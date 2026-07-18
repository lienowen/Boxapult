import type Phaser from 'phaser';
import type { GameBalance } from '../../content/config/gameBalance';
import type { RectangleBounds } from '../../domain/level/LevelDefinition';
import { GameFlow } from '../../domain/flow/GameFlow';
import { GamePhase } from '../../domain/flow/GamePhase';
import type { IntegrityModel } from '../../domain/package/IntegrityModel';

export class FailureSystem {
  #stationaryMs = 0;

  constructor(
    private readonly packageImage: Phaser.Physics.Matter.Image,
    private readonly integrity: IntegrityModel,
    private readonly bounds: RectangleBounds,
    private readonly balance: GameBalance,
    private readonly flow: GameFlow,
  ) {}

  update(deltaMs: number): void {
    if (this.flow.current !== GamePhase.Flying) {
      return;
    }

    const body = this.packageImage.body;
    if (!body) {
      return;
    }
    const velocity = body.velocity;
    const speed = Math.hypot(velocity.x, velocity.y);
    if (speed > this.balance.maximumPackageSpeed) {
      const ratio = this.balance.maximumPackageSpeed / speed;
      this.packageImage.setVelocity(velocity.x * ratio, velocity.y * ratio);
    }

    const outside =
      this.packageImage.x < this.bounds.x ||
      this.packageImage.x > this.bounds.x + this.bounds.width ||
      this.packageImage.y < this.bounds.y ||
      this.packageImage.y > this.bounds.y + this.bounds.height;

    if (outside || this.integrity.depleted) {
      this.#fail();
      return;
    }

    if (speed <= this.balance.stationarySpeedThreshold) {
      this.#stationaryMs += deltaMs;
      if (this.#stationaryMs >= this.balance.stationaryFailureDurationMs) {
        this.#fail();
      }
    } else {
      this.#stationaryMs = 0;
    }
  }

  #fail(): void {
    this.packageImage.setVelocity(0, 0);
    this.packageImage.setAngularVelocity(0);
    this.packageImage.setStatic(true);
    this.flow.moveTo(GamePhase.Resolving);
    this.flow.moveTo(GamePhase.Failure);
  }
}
