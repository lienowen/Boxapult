import type { HighScorePort } from '../../application/ports/HighScorePort';

export class LocalHighScoreAdapter implements HighScorePort {
  #memoryScore = 0;

  constructor(private readonly storageKey: string) {}

  load(): number {
    try {
      const raw = globalThis.localStorage.getItem(this.storageKey);
      if (raw === null) {
        return this.#memoryScore;
      }

      const parsed = Number.parseInt(raw, 10);
      const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
      this.#memoryScore = normalized;
      return normalized;
    } catch {
      return this.#memoryScore;
    }
  }

  save(score: number): void {
    const normalized = Math.max(0, Math.floor(score));
    this.#memoryScore = normalized;

    try {
      globalThis.localStorage.setItem(this.storageKey, normalized.toString());
    } catch {
      // Memory fallback keeps the current browser session playable.
    }
  }
}
