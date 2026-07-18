import type { PlatformPort } from './ports/PlatformPort';
import type { HighScorePort } from './ports/HighScorePort';

export interface ParcelPatrolServices {
  readonly platform: PlatformPort;
  readonly highScore: HighScorePort;
}
