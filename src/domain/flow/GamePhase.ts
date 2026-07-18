export const GamePhase = {
  Boot: 'boot',
  Loading: 'loading',
  Aiming: 'aiming',
  Flying: 'flying',
  Resolving: 'resolving',
  Success: 'success',
  Failure: 'failure',
  Paused: 'paused',
} as const;

export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];
