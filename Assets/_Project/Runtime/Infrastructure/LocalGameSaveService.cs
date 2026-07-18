using Boxapult.Core;
using Boxapult.Gameplay.Services;
using UnityEngine;

namespace Boxapult.Infrastructure
{
    public sealed class LocalGameSaveService : IGameSaveService
    {
        private readonly string _saveKey;

        public LocalGameSaveService(string saveKey)
        {
            _saveKey = Guard.NotBlank(saveKey, nameof(saveKey));
        }

        public GameSaveData Load()
        {
            if (!PlayerPrefs.HasKey(_saveKey))
            {
                return new GameSaveData();
            }

            string json = PlayerPrefs.GetString(_saveKey, string.Empty);
            if (string.IsNullOrWhiteSpace(json))
            {
                return new GameSaveData();
            }

            try
            {
                GameSaveData data = JsonUtility.FromJson<GameSaveData>(json);
                return data ?? new GameSaveData();
            }
            catch (System.Exception exception)
            {
                Debug.LogWarning($"Boxapult save data could not be read and will be reset. {exception.Message}");
                return new GameSaveData();
            }
        }

        public void Save(GameSaveData data)
        {
            Guard.NotNull(data, nameof(data));
            data.version = GameSaveData.CurrentVersion;

            string json = JsonUtility.ToJson(data);
            PlayerPrefs.SetString(_saveKey, json);
            PlayerPrefs.Save();
        }
    }
}
