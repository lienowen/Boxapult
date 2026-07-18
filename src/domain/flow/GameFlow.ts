import { GamePhase } from './GamePhase';

const transitions: Readonly<Record<GamePhase, readonly GamePhase[]>> = {
  [GamePhase.Boot]: [GamePhase.Loading],
  [GamePhase.Loading]: [GamePhase.Aiming],
  [GamePhase.Aiming]: [GamePhase.Flying, GamePhase.Loading, GamePhase.Paused],
  [GamePhase.Flying]: [GamePhase.Resolving, GamePhase.Loading, GamePhase.Paused],
  [GamePhase.Resolving]: [GamePhase.Success, GamePhase.Failure, GamePhase.Loading, GamePhase.Paused],
  [GamePhase.Success]: [GamePhase.Loading],
  [GamePhase.Failure]: [GamePhase.Loading],
  [GamePhase.Paused]: [GamePhase.Aiming, GamePhase.Flying, GamePhase.Resolving],
};

type PhaseListener = (previous: GamePhase, current: GamePhase) => void;

export class GameFlow {
  readonly #listeners = new Set<PhaseListener>();
  #current: GamePhase = GamePhase.Boot;
  #phaseBeforePause: GamePhase | null = null;

  get current(): GamePhase {
    return this.#current;
  }

  subscribe(listener: PhaseListener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  canMoveTo(next: GamePhase): boolean {
    return transitions[this.#current].includes(next);
  }

  moveTo(next: GamePhase): void {
    if (!this.canMoveTo(next)) {
      throw new Error(`Invalid game-flow transition: ${this.#current} -> ${next}`);
    }

    const previous = this.#current;
    this.#current = next;
    this.#listeners.forEach((listener) => listener(previous, next));
  }

  pause(): void {
    if (this.#current === GamePhase.Paused) {
      return;
    }
    if (!this.canMoveTo(GamePhase.Paused)) {
      throw new Error(`Cannot pause while in phase '${this.#current}'.`);
    }
    this.#phaseBeforePause = this.#current;
    this.moveTo(GamePhase.Paused);
  }

  resume(): void {
    if (this.#current !== GamePhase.Paused || this.#phaseBeforePause === null) {
      throw new Error('Cannot resume because the game is not paused.');
    }
    const target = this.#phaseBeforePause;
    this.#phaseBeforePause = null;
    this.moveTo(target);
  }
}
