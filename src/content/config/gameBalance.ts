import type { LaunchBalance } from '../../domain/launch/calculateAimSolution';
import type { FlightOutcomeBalance } from '../../domain/outcome/evaluateFlightOutcome';
import type { IntegrityBalance } from '../../domain/package/IntegrityModel';

export interface PackageBalance {
  readonly widthPixels: number;
  readonly heightPixels: number;
  readonly aimGrabRadiusPixels: number;
  readonly angularVelocityAtFullStrength: number;
}

export interface TrajectoryPreviewBalance {
  readonly pointCount: number;
  readonly timeStep: number;
  readonly velocityScale: number;
  readonly gravityPixelsPerSecondSquared: number;
}

export interface GameBalance {
  readonly launch: LaunchBalance;
  readonly package: PackageBalance;
  readonly trajectoryPreview: TrajectoryPreviewBalance;
  readonly integrity: IntegrityBalance;
  readonly outcome: FlightOutcomeBalance;
  readonly maximumPackageSpeed: number;
}

export const gameBalance: GameBalance = {
  launch: {
    minimumDragPixels: 20,
    maximumDragPixels: 160,
    velocityPerDragPixel: 0.092,
  },
  package: {
    widthPixels: 84,
    heightPixels: 62,
    aimGrabRadiusPixels: 125,
    angularVelocityAtFullStrength: 0.028,
  },
  trajectoryPreview: {
    pointCount: 14,
    timeStep: 0.11,
    velocityScale: 5.7,
    gravityPixelsPerSecondSquared: 44,
  },
  integrity: {
    maximum: 100,
    damageSpeedThreshold: 11,
    damagePerSpeedUnit: 7,
  },
  outcome: {
    stationarySpeedThreshold: 0.18,
    stationaryFailureDurationMs: 1700,
    worldBoundsMarginPixels: 120,
  },
  maximumPackageSpeed: 24,
};
