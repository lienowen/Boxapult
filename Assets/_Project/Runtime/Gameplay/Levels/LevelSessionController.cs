using System.Collections;
using Boxapult.Gameplay.Flow;
using Boxapult.Gameplay.Launch;
using Boxapult.Gameplay.Package;
using UnityEngine;

namespace Boxapult.Gameplay.Levels
{
    public sealed class LevelSessionController : MonoBehaviour, IGameContextReceiver
    {
        [SerializeField] private LevelCatalog catalog;
        [SerializeField] private LevelRuntimeBuilder runtimeBuilder;
        [SerializeField] private PackageLauncher packageLauncher;
        [SerializeField] private PackageIntegrity packageIntegrity;

        private GameContext _context;
        private LevelDefinition _currentLevel;
        private string _currentLevelId;
        private Coroutine _loadRoutine;
        private float _stationaryDuration;

        public void Install(GameContext context)
        {
            _context = context;
            _currentLevelId = context.Config.FirstLevelId;
            context.Flow.PhaseChanged += HandlePhaseChanged;
            packageIntegrity.Depleted += HandleIntegrityDepleted;
        }

        public void RestartCurrentLevel()
        {
            if (_context?.Flow.IsInitialized == true)
            {
                _context.Flow.TryMoveTo(GamePhase.LoadingLevel);
            }
        }

        public void ContinueToNextLevel()
        {
            if (_currentLevel != null && catalog.TryGetNext(_currentLevel.Id, out LevelDefinition nextLevel))
            {
                _currentLevelId = nextLevel.Id;
                _context.Flow.TryMoveTo(GamePhase.LoadingLevel);
            }
        }

        private void FixedUpdate()
        {
            if (_context == null ||
                _currentLevel == null ||
                _context.Flow.Current != GamePhase.Flying ||
                !packageLauncher.PackageBody.simulated)
            {
                return;
            }

            Rigidbody2D body = packageLauncher.PackageBody;
            if (!_currentLevel.CameraBounds.Contains(body.position))
            {
                ResolveFailure();
                return;
            }

            if (body.linearVelocity.magnitude <= _context.Config.StationarySpeedThreshold)
            {
                _stationaryDuration += Time.fixedDeltaTime;
                if (_stationaryDuration >= _context.Config.StationaryDuration)
                {
                    ResolveFailure();
                }
            }
            else
            {
                _stationaryDuration = 0f;
            }
        }

        private void HandlePhaseChanged(GamePhase previous, GamePhase current)
        {
            if (current != GamePhase.LoadingLevel)
            {
                return;
            }

            if (_loadRoutine != null)
            {
                StopCoroutine(_loadRoutine);
            }

            _loadRoutine = StartCoroutine(LoadCurrentLevel());
        }

        private IEnumerator LoadCurrentLevel()
        {
            yield return null;

            if (!catalog.TryGet(_currentLevelId, out _currentLevel))
            {
                Debug.LogError($"Level '{_currentLevelId}' is missing from the catalog.", this);
                yield break;
            }

            _stationaryDuration = 0f;
            runtimeBuilder.Build(_currentLevel, _context);
            _loadRoutine = null;
            _context.Flow.TryMoveTo(GamePhase.Aiming);
        }

        private void HandleIntegrityDepleted()
        {
            if (_context?.Flow.Current == GamePhase.Flying)
            {
                ResolveFailure();
            }
        }

        private void ResolveFailure()
        {
            if (_context.Flow.TryMoveTo(GamePhase.Resolving))
            {
                _context.Flow.TryMoveTo(GamePhase.Failure);
            }
        }

        private void OnDestroy()
        {
            if (_context != null)
            {
                _context.Flow.PhaseChanged -= HandlePhaseChanged;
            }

            if (packageIntegrity != null)
            {
                packageIntegrity.Depleted -= HandleIntegrityDepleted;
            }
        }
    }
}
