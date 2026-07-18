import type { GameSave, SavePort } from '../../application/ports/SavePort';

const defaultSave: GameSave = {
  version: 1,
  highestUnlockedLevel: 'apt-001',
  levelResults: {},
  muted: false,
};

export class LocalStorageSaveAdapter implements SavePort {
  constructor(private readonly key: string) {}

  load(): GameSave {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) {
        return defaultSave;
      }
      const parsed = JSON.parse(raw) as Partial<GameSave>;
      if (parsed.version !== 1) {
        return defaultSave;
      }
      return {
        version: 1,
        highestUnlockedLevel: parsed.highestUnlockedLevel ?? defaultSave.highestUnlockedLevel,
        levelResults: parsed.levelResults ?? {},
        muted: parsed.muted ?? false,
      };
    } catch {
      return defaultSave;
    }
  }

  save(data: GameSave): void {
    localStorage.setItem(this.key, JSON.stringify(data));
  }
}
