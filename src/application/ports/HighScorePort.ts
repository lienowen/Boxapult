export interface HighScorePort {
  load(): number;
  save(score: number): void;
}
