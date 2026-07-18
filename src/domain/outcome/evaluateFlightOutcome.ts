import type { GoalDefinition, RectangleBounds } from '../level/LevelDefinition';
import type { Vector2 } from '../launch/Vector2';

export interface PackageBounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

export interface FlightOutcomeBalance {
  readonly stationarySpeedThreshold: number;
  readonly stationaryFailureDurationMs: number;
  readonly worldBoundsMarginPixels: number;
}

export interface FlightSample {
  readonly position: Vector2;
  readonly velocity: Vector2;
  readonly packageBounds: PackageBounds;
  readonly integrity: number;
  readonly stationaryDurationMs: number;
  readonly goalSettleDurationMs: number;
  readonly deltaMs: number;
}

export type FlightFailureReason = 'destroyed' | 'out-of-bounds' | 'stationary';

export type FlightOutcome =
  | {
      readonly kind: 'continue';
      readonly stationaryDurationMs: number;
      readonly goalSettleDurationMs: number;
      readonly packageInsideGoal: boolean;
    }
  | { readonly kind: 'success' }
  | { readonly kind: 'failure'; readonly reason: FlightFailureReason };

export function evaluateFlightOutcome(
  sample: FlightSample,
  worldBounds: RectangleBounds,
  goal: GoalDefinition,
  balance: FlightOutcomeBalance,
): FlightOutcome {
  if (sample.integrity <= 0) {
    return { kind: 'failure', reason: 'destroyed' };
  }

  if (isOutsideWorld(sample.position, worldBounds, balance.worldBoundsMarginPixels)) {
    return { kind: 'failure', reason: 'out-of-bounds' };
  }

  const speed = Math.hypot(sample.velocity.x, sample.velocity.y);
  const packageInsideGoal = isPackageFullyInsideGoal(sample.packageBounds, goal);
  const qualifiesForDelivery =
    packageInsideGoal && speed <= goal.maximumSettleSpeed && sample.integrity >= goal.minimumIntegrity;
  const goalSettleDurationMs = qualifiesForDelivery
    ? sample.goalSettleDurationMs + sample.deltaMs
    : 0;

  if (goalSettleDurationMs >= goal.settleDurationMs) {
    return { kind: 'success' };
  }

  const stationaryDurationMs =
    !packageInsideGoal && speed <= balance.stationarySpeedThreshold
      ? sample.stationaryDurationMs + sample.deltaMs
      : 0;

  if (stationaryDurationMs >= balance.stationaryFailureDurationMs) {
    return { kind: 'failure', reason: 'stationary' };
  }

  return {
    kind: 'continue',
    stationaryDurationMs,
    goalSettleDurationMs,
    packageInsideGoal,
  };
}

function isOutsideWorld(
  position: Vector2,
  worldBounds: RectangleBounds,
  marginPixels: number,
): boolean {
  return (
    position.x < worldBounds.x - marginPixels ||
    position.x > worldBounds.x + worldBounds.width + marginPixels ||
    position.y < worldBounds.y - marginPixels ||
    position.y > worldBounds.y + worldBounds.height + marginPixels
  );
}

function isPackageFullyInsideGoal(packageBounds: PackageBounds, goal: GoalDefinition): boolean {
  const left = goal.x - goal.width / 2;
  const right = goal.x + goal.width / 2;
  const top = goal.y - goal.height / 2;
  const bottom = goal.y + goal.height / 2;

  return (
    packageBounds.left >= left &&
    packageBounds.right <= right &&
    packageBounds.top >= top &&
    packageBounds.bottom <= bottom
  );
}
