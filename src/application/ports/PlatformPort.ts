export interface PlatformPort {
  initialize(): Promise<void>;
  gameplayStart(): void;
  gameplayStop(): void;
  setMuted(muted: boolean): void;
}
