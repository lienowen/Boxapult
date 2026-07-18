using System;
using System.Collections.Generic;
using UnityEngine;

namespace Boxapult.Gameplay.Levels
{
    [CreateAssetMenu(fileName = "LevelCatalog", menuName = "Boxapult/Levels/Level Catalog")]
    public sealed class LevelCatalog : ScriptableObject
    {
        [SerializeField] private List<LevelDefinition> levels = new();

        private Dictionary<string, int> _indexById;

        public int Count => levels.Count;

        public bool TryGet(string levelId, out LevelDefinition level)
        {
            EnsureIndex();

            if (!string.IsNullOrWhiteSpace(levelId) && _indexById.TryGetValue(levelId, out int index))
            {
                level = levels[index];
                return level != null;
            }

            level = null;
            return false;
        }

        public bool TryGetNext(string currentLevelId, out LevelDefinition level)
        {
            EnsureIndex();

            if (_indexById.TryGetValue(currentLevelId, out int index) && index + 1 < levels.Count)
            {
                level = levels[index + 1];
                return level != null;
            }

            level = null;
            return false;
        }

        private void EnsureIndex()
        {
            if (_indexById != null)
            {
                return;
            }

            _indexById = new Dictionary<string, int>(StringComparer.Ordinal);
            for (int index = 0; index < levels.Count; index++)
            {
                LevelDefinition level = levels[index];
                if (level != null && !string.IsNullOrWhiteSpace(level.Id))
                {
                    _indexById[level.Id] = index;
                }
            }
        }

        private void OnValidate()
        {
            _indexById = null;
        }
    }
}
