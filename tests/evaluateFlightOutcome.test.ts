import { describe, expect, it } from 'vitest';
import type { GoalDefinition, RectangleBounds } from '../src/domain/level/LevelDefinition';
import {
  evaluateFlightOutcome,
  type FlightOutcomeBalance,
  type FlightSample,
} from '../src/domain/outcome/evaluateFlightOutcome';

const worldBounds: RectangleBounds = { x: 0, y: 0, width: 1920, height: 1080 };
const goal: GoalDefinition = {
  x: 1500,
  y: 720,
  width: 460,
  height: 250,
  maximumSettleSpeed: 1.15,
  settleDurationMs: 450,
  minimumIntegrity: 1,
};
const balance: FlightOutcomeBalance = {
  stationarySpeedThreshold: 0.18,
  stationaryFailureDurationMs: 1700,
  worldBoundsMarginPixels: 120,
};

function sample(overrides: Partial<FlightSample> = {}): FlightSample {
  return {
    position: { x: 1500, y: 780 },
    velocity: { x: 0.2, y: 0.1 },
    packageBounds: { left: 1458, right: 1542, top: 749, bottom: 811 },
    integrity: 100,
    stationaryDurationMs: 0,
    goalSettleDurationMs: 0,
    deltaMs: 16,
    ...overrides,
  };
}

describe('evaluateFlightOutcome', () => {
  it('succeeds only after the complete package settles inside the goal', () => {
    const outcome = evaluateFlightOutcome(
      sample({ goalSettleDurationMs: 440, deltaMs: 16 }),
      worldBounds,
      goal,
      balance,
    );

    expect(outcome).toEqual({ kind: 'success' });
  });

  it('does not accept a package hanging over the goal edge', () => {
    const outcome = evaluateFlightOutcome(
      sample({
        packageBounds: { left: 1458, right: 1740, top: 749, bottom: 811 },
        goalSettleDurationMs: 440,
      }),
      worldBounds,
      goal,
      balance,
    );

    expect(outcome.kind).toBe('continue');
  });

  it('does not count stationary failure time while the package is inside the goal', () => {
    const outcome = evaluateFlightOutcome(
      sample({
        velocity: { x: 0.05, y: 0.05 },
        stationaryDurationMs: 1600,
        goalSettleDurationMs: 100,
      }),
      worldBounds,
      goal,
      balance,
    );

    expect(outcome).toMatchObject({ kind: 'continue', stationaryDurationMs: 0 });
  });

  it('fails after the package remains stationary away from the goal', () => {
    const outcome = evaluateFlightOutcome(
      sample({
        position: { x: 700, y: 850 },
        packageBounds: { left: 658, right: 742, top: 819, bottom: 881 },
        velocity: { x: 0.05, y: 0.05 },
        stationaryDurationMs: 1690,
        deltaMs: 16,
      }),
      worldBounds,
      goal,
      balance,
    );

    expect(outcome).toEqual({ kind: 'failure', reason: 'stationary' });
  });

  it('fails immediately when integrity is depleted', () => {
    const outcome = evaluateFlightOutcome(
      sample({ integrity: 0 }),
      worldBounds,
      goal,
      balance,
    );

    expect(outcome).toEqual({ kind: 'failure', reason: 'destroyed' });
  });
});
