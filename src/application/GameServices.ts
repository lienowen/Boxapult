import type { PlatformPort } from './ports/PlatformPort';
import type { SavePort } from './ports/SavePort';

export interface GameServices {
  readonly platform: PlatformPort;
  readonly save: SavePort;
}
