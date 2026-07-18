using System;
using Boxapult.Gameplay;
using Boxapult.Gameplay.Configuration;
using Boxapult.Gameplay.Flow;
using Boxapult.Gameplay.Services;
using Boxapult.Infrastructure;
using UnityEngine;

namespace Boxapult.Bootstrap
{
    [DefaultExecutionOrder(-10000)]
    public sealed class GameBootstrapper : MonoBehaviour
    {
        [SerializeField] private GameRuntimeConfig runtimeConfig;
        [SerializeField] private MonoBehaviour[] contextReceivers = Array.Empty<MonoBehaviour>();

        private GameContext _context;

        private async void Awake()
        {
            try
            {
                ValidateConfiguration();
                ApplyRuntimeConfiguration();

                GameFlow flow = new();
                IGameSaveService saveService = new LocalGameSaveService(runtimeConfig.SaveKey);
                IPlatformService platformService = new LocalPlatformService();

                _context = new GameContext(runtimeConfig, flow, saveService, platformService);
                InstallContextReceivers(_context);

                await platformService.InitializeAsync();

                flow.Initialize();
                if (!flow.TryMoveTo(GamePhase.LoadingLevel))
                {
                    throw new InvalidOperationException("Initial game-flow transition failed.");
                }
            }
            catch (Exception exception)
            {
                Debug.LogException(exception, this);
                enabled = false;
            }
        }

        private void ValidateConfiguration()
        {
            if (runtimeConfig == null)
            {
                throw new InvalidOperationException("GameBootstrapper requires a GameRuntimeConfig asset.");
            }

            if (string.IsNullOrWhiteSpace(runtimeConfig.FirstLevelId))
            {
                throw new InvalidOperationException("The first level ID is not configured.");
            }

            if (string.IsNullOrWhiteSpace(runtimeConfig.SaveKey))
            {
                throw new InvalidOperationException("The save key is not configured.");
            }
        }

        private void ApplyRuntimeConfiguration()
        {
            Time.fixedDeltaTime = runtimeConfig.FixedDeltaTime;
            Physics2D.gravity = runtimeConfig.Gravity;
        }

        private void InstallContextReceivers(GameContext context)
        {
            foreach (MonoBehaviour receiver in contextReceivers)
            {
                if (receiver == null)
                {
                    continue;
                }

                if (receiver is not IGameContextReceiver contextReceiver)
                {
                    throw new InvalidOperationException(
                        $"Configured receiver '{receiver.name}' does not implement {nameof(IGameContextReceiver)}.");
                }

                contextReceiver.Install(context);
            }
        }
    }
}
