import type { IntegrityBalance } from '../../domain/package/IntegrityModel';
import type { LaunchBalance } from '../../domain/launch/calculateAimSolution';

export interface GameBalance {
  readonly launch: LaunchBalance;
  readonly integrity: IntegrityBalance;
  readonly maximumPackageSpeed: number;
  readonly stationarySpeedThreshold: number;
  readonly stationaryFailureDurationMs: number;
}

export const gameBalance: GameBalance = {
  launch: {
    minimumDragPixels: 18,
    maximumDragPixels: 150,
    velocityPerDragPixel: 0.095,
  },
  integrity: {
    maximum: 100,
    damageSpeedThreshold: 11,
    damagePerSpeedUnit: 7,
  },
  maximumPackageSpeed: 24,
  stationarySpeedThreshold: 0.18,
  stationaryFailureDurationMs: 1800,
};
