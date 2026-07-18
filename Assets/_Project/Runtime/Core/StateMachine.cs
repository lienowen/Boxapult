using System;
using System.Collections.Generic;

namespace Boxapult.Core
{
    public sealed class StateMachine<TState> where TState : struct, Enum
    {
        public event Action<TState, TState> StateChanged;

        public bool IsInitialized { get; private set; }

        public TState Current { get; private set; }

        public void Initialize(TState initialState)
        {
            if (IsInitialized)
            {
                throw new InvalidOperationException("The state machine is already initialized.");
            }

            Current = initialState;
            IsInitialized = true;
        }

        public bool TryTransition(TState nextState)
        {
            EnsureInitialized();

            if (EqualityComparer<TState>.Default.Equals(Current, nextState))
            {
                return false;
            }

            TState previousState = Current;
            Current = nextState;
            StateChanged?.Invoke(previousState, nextState);
            return true;
        }

        private void EnsureInitialized()
        {
            if (!IsInitialized)
            {
                throw new InvalidOperationException("Initialize the state machine before using it.");
            }
        }
    }
}
