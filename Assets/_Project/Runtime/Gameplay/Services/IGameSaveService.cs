namespace Boxapult.Gameplay.Services
{
    public interface IGameSaveService
    {
        GameSaveData Load();

        void Save(GameSaveData data);
    }
}
