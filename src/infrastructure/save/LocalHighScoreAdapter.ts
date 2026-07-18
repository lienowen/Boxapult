import type { HighScorePort } from '../../application/ports/HighScorePort';

export class LocalHighScoreAdapter implements HighScorePort {
  constructor(private readonly storageKey: string) {}

  load(): number {
    const raw = globalThis.localStorage?.getItem(this.storageKey);
    if (raw === null || raw === undefined) {
      return 0;
    }

    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  save(score: number): void {
    const normalized = Math.max(0, Math.floor(score));
    globalThis.localStorage?.setItem(this.storageKey, normalized.toString());
  }
}
