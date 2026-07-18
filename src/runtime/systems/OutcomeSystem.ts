import type Phaser from 'phaser';
import type { GameBalance } from '../../content/config/gameBalance';
import { GameFlow } from '../../domain/flow/GameFlow';
import { GamePhase } from '../../domain/flow/GamePhase';
import type { GoalDefinition, RectangleBounds } from '../../domain/level/LevelDefinition';
import {
  evaluateFlightOutcome,
  type FlightFailureReason,
} from '../../domain/outcome/evaluateFlightOutcome';
import type { IntegrityModel } from '../../domain/package/IntegrityModel';
import { getMatterBody } from '../physics/getMatterBody';

export class OutcomeSystem {
  #stationaryDurationMs = 0;
  #goalSettleDurationMs = 0;
  #failureReason: FlightFailureReason | null = null;

  constructor(
    private readonly packageImage: Phaser.Physics.Matter.Image,
    private readonly integrity: IntegrityModel,
    private readonly worldBounds: RectangleBounds,
    private readonly goal: GoalDefinition,
    private readonly balance: GameBalance,
    private readonly flow: GameFlow,
  ) {}

  get failureReason(): FlightFailureReason | null {
    return this.#failureReason;
  }

  update(deltaMs: number): void {
    if (this.flow.current !== GamePhase.Flying) {
      return;
    }

    const body = getMatterBody(this.packageImage);
    if (!body) {
      return;
    }

    this.#limitSpeed(body.velocity.x, body.velocity.y);

    const outcome = evaluateFlightOutcome(
      {
        position: { x: this.packageImage.x, y: this.packageImage.y },
        velocity: { x: body.velocity.x, y: body.velocity.y },
        packageBounds: {
          left: body.bounds.min.x,
          right: body.bounds.max.x,
          top: body.bounds.min.y,
          bottom: body.bounds.max.y,
        },
        integrity: this.integrity.current,
        stationaryDurationMs: this.#stationaryDurationMs,
        goalSettleDurationMs: this.#goalSettleDurationMs,
        deltaMs,
      },
      this.worldBounds,
      this.goal,
      this.balance.outcome,
    );

    if (outcome.kind === 'continue') {
      this.#stationaryDurationMs = outcome.stationaryDurationMs;
      this.#goalSettleDurationMs = outcome.goalSettleDurationMs;
      return;
    }

    this.#freezePackage();
    this.flow.moveTo(GamePhase.Resolving);

    if (outcome.kind === 'success') {
      this.flow.moveTo(GamePhase.Success);
      return;
    }

    this.#failureReason = outcome.reason;
    this.flow.moveTo(GamePhase.Failure);
  }

  #limitSpeed(velocityX: number, velocityY: number): void {
    const speed = Math.hypot(velocityX, velocityY);
    if (speed <= this.balance.maximumPackageSpeed) {
      return;
    }

    const ratio = this.balance.maximumPackageSpeed / speed;
    this.packageImage.setVelocity(velocityX * ratio, velocityY * ratio);
  }

  #freezePackage(): void {
    this.packageImage.setVelocity(0, 0);
    this.packageImage.setAngularVelocity(0);
    this.packageImage.setStatic(true);
  }
}
