using System;

namespace Boxapult.Gameplay.Services
{
    [Serializable]
    public sealed class GameSaveData
    {
        public const int CurrentVersion = 1;

        public int version = CurrentVersion;
        public int highestUnlockedLevelIndex;
        public int totalStamps;
        public string selectedSkinId = "default";
    }
}
