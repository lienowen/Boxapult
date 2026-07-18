import type { PlatformPort } from '../../application/ports/PlatformPort';

export class LocalPlatformAdapter implements PlatformPort {
  #muted = false;

  async initialize(): Promise<void> {
    await Promise.resolve();
  }

  gameplayStart(): void {
    // Local development adapter intentionally does nothing.
  }

  gameplayStop(): void {
    // Local development adapter intentionally does nothing.
  }

  setMuted(muted: boolean): void {
    this.#muted = muted;
  }

  get muted(): boolean {
    return this.#muted;
  }
}
