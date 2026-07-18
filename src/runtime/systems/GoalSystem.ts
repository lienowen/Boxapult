import type Phaser from 'phaser';
import type { GoalDefinition } from '../../domain/level/LevelDefinition';
import { GameFlow } from '../../domain/flow/GameFlow';
import { GamePhase } from '../../domain/flow/GamePhase';
import type { IntegrityModel } from '../../domain/package/IntegrityModel';

export class GoalSystem {
  #settledMs = 0;

  constructor(
    private readonly packageImage: Phaser.Physics.Matter.Image,
    private readonly integrity: IntegrityModel,
    private readonly goal: GoalDefinition,
    private readonly flow: GameFlow,
  ) {}

  update(deltaMs: number): void {
    if (this.flow.current !== GamePhase.Flying) {
      return;
    }

    const inside =
      Math.abs(this.packageImage.x - this.goal.x) <= this.goal.width / 2 &&
      Math.abs(this.packageImage.y - this.goal.y) <= this.goal.height / 2;

    const body = this.packageImage.body;
    if (!body) {
      return;
    }
    const speed = Math.hypot(body.velocity.x, body.velocity.y);
    if (inside && speed <= this.goal.maximumSettleSpeed && this.integrity.current >= this.goal.minimumIntegrity) {
      this.#settledMs += deltaMs;
      if (this.#settledMs >= this.goal.settleDurationMs) {
        this.packageImage.setVelocity(0, 0);
        this.packageImage.setAngularVelocity(0);
        this.packageImage.setStatic(true);
        this.flow.moveTo(GamePhase.Resolving);
        this.flow.moveTo(GamePhase.Success);
      }
      return;
    }

    this.#settledMs = 0;
  }
}
