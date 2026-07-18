using System.Threading.Tasks;

namespace Boxapult.Gameplay.Services
{
    public interface IPlatformService
    {
        bool IsInitialized { get; }

        Task InitializeAsync();

        void NotifyGameplayStarted();

        void NotifyGameplayStopped();
    }
}
