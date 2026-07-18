using System.Threading.Tasks;
using Boxapult.Gameplay.Services;

namespace Boxapult.Infrastructure
{
    public sealed class LocalPlatformService : IPlatformService
    {
        public bool IsInitialized { get; private set; }

        public Task InitializeAsync()
        {
            IsInitialized = true;
            return Task.CompletedTask;
        }

        public void NotifyGameplayStarted()
        {
        }

        public void NotifyGameplayStopped()
        {
        }
    }
}
