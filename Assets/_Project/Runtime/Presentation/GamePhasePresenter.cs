using System;
using Boxapult.Gameplay;
using Boxapult.Gameplay.Flow;
using UnityEngine;

namespace Boxapult.Presentation
{
    public sealed class GamePhasePresenter : MonoBehaviour, IGameContextReceiver
    {
        [Serializable]
        private sealed class PhaseRoot
        {
            public GamePhase phase;
            public GameObject root;
        }

        [SerializeField] private PhaseRoot[] phaseRoots = Array.Empty<PhaseRoot>();

        private GameFlow _flow;

        public void Install(GameContext context)
        {
            if (_flow != null)
            {
                _flow.PhaseChanged -= HandlePhaseChanged;
            }

            _flow = context.Flow;
            _flow.PhaseChanged += HandlePhaseChanged;

            if (_flow.IsInitialized)
            {
                Refresh(_flow.Current);
            }
        }

        private void OnDestroy()
        {
            if (_flow != null)
            {
                _flow.PhaseChanged -= HandlePhaseChanged;
            }
        }

        private void HandlePhaseChanged(GamePhase previous, GamePhase current)
        {
            Refresh(current);
        }

        private void Refresh(GamePhase current)
        {
            foreach (PhaseRoot entry in phaseRoots)
            {
                if (entry?.root != null)
                {
                    entry.root.SetActive(entry.phase == current);
                }
            }
        }
    }
}
