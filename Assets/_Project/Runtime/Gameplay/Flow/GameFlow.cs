using System;
using Boxapult.Core;

namespace Boxapult.Gameplay.Flow
{
    public sealed class GameFlow
    {
        private readonly StateMachine<GamePhase> _stateMachine = new();
        private GamePhase _phaseBeforePause;

        public event Action<GamePhase, GamePhase> PhaseChanged
        {
            add => _stateMachine.StateChanged += value;
            remove => _stateMachine.StateChanged -= value;
        }

        public bool IsInitialized => _stateMachine.IsInitialized;

        public GamePhase Current => _stateMachine.Current;

        public void Initialize()
        {
            _stateMachine.Initialize(GamePhase.Boot);
        }

        public bool TryMoveTo(GamePhase next)
        {
            EnsureInitialized();

            if (!CanTransition(Current, next))
            {
                return false;
            }

            return _stateMachine.TryTransition(next);
        }

        public bool TryPause()
        {
            EnsureInitialized();

            if (Current != GamePhase.Aiming &&
                Current != GamePhase.Flying &&
                Current != GamePhase.Resolving)
            {
                return false;
            }

            _phaseBeforePause = Current;
            return _stateMachine.TryTransition(GamePhase.Paused);
        }

        public bool TryResume()
        {
            EnsureInitialized();

            if (Current != GamePhase.Paused)
            {
                return false;
            }

            return _stateMachine.TryTransition(_phaseBeforePause);
        }

        private static bool CanTransition(GamePhase current, GamePhase next)
        {
            return current switch
            {
                GamePhase.Boot => next == GamePhase.LoadingLevel,
                GamePhase.LoadingLevel => next == GamePhase.Aiming,
                GamePhase.Aiming => next is GamePhase.Flying or GamePhase.Paused or GamePhase.LoadingLevel,
                GamePhase.Flying => next is GamePhase.Resolving or GamePhase.Paused or GamePhase.LoadingLevel,
                GamePhase.Resolving => next is GamePhase.Success or GamePhase.Failure or GamePhase.Paused or GamePhase.LoadingLevel,
                GamePhase.Success => next is GamePhase.Results or GamePhase.LoadingLevel,
                GamePhase.Failure => next is GamePhase.Results or GamePhase.LoadingLevel,
                GamePhase.Results => next == GamePhase.LoadingLevel,
                GamePhase.Paused => false,
                _ => false
            };
        }

        private void EnsureInitialized()
        {
            if (!IsInitialized)
            {
                throw new InvalidOperationException("GameFlow must be initialized before it is used.");
            }
        }
    }
}
