import { describe, expect, it } from 'vitest';
import { GameFlow } from '../src/domain/flow/GameFlow';
import { GamePhase } from '../src/domain/flow/GamePhase';

describe('GameFlow', () => {
  it('supports the normal launch and success path', () => {
    const flow = new GameFlow();
    flow.moveTo(GamePhase.Loading);
    flow.moveTo(GamePhase.Aiming);
    flow.moveTo(GamePhase.Flying);
    flow.moveTo(GamePhase.Resolving);
    flow.moveTo(GamePhase.Success);
    expect(flow.current).toBe(GamePhase.Success);
  });

  it('rejects invalid transitions', () => {
    const flow = new GameFlow();
    expect(() => flow.moveTo(GamePhase.Flying)).toThrow(/Invalid game-flow transition/);
  });

  it('resumes the phase that was paused', () => {
    const flow = new GameFlow();
    flow.moveTo(GamePhase.Loading);
    flow.moveTo(GamePhase.Aiming);
    flow.pause();
    flow.resume();
    expect(flow.current).toBe(GamePhase.Aiming);
  });
});
