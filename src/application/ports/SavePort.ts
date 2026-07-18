export interface GameSave {
  readonly version: 1;
  readonly highestUnlockedLevel: string;
  readonly levelResults: Readonly<Record<string, number>>;
  readonly muted: boolean;
}

export interface SavePort {
  load(): GameSave;
  save(data: GameSave): void;
}
