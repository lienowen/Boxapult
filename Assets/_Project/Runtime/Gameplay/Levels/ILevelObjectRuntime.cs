namespace Boxapult.Gameplay.Levels
{
    public interface ILevelObjectRuntime
    {
        void Configure(LevelObjectPlacement placement, GameContext context);
    }
}
