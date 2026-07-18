using Boxapult.Core;
using Boxapult.Gameplay.Configuration;
using Boxapult.Gameplay.Flow;
using Boxapult.Gameplay.Services;

namespace Boxapult.Gameplay
{
    public sealed class GameContext
    {
        public GameContext(
            GameRuntimeConfig config,
            GameFlow flow,
            IGameSaveService saveService,
            IPlatformService platformService)
        {
            Config = Guard.NotNull(config, nameof(config));
            Flow = Guard.NotNull(flow, nameof(flow));
            SaveService = Guard.NotNull(saveService, nameof(saveService));
            PlatformService = Guard.NotNull(platformService, nameof(platformService));
        }

        public GameRuntimeConfig Config { get; }
        public GameFlow Flow { get; }
        public IGameSaveService SaveService { get; }
        public IPlatformService PlatformService { get; }
    }

    public interface IGameContextReceiver
    {
        void Install(GameContext context);
    }
}
