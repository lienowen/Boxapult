using System;
using System.Collections.Generic;
using UnityEngine;

namespace Boxapult.Gameplay.Levels
{
    [CreateAssetMenu(fileName = "LevelPrefabRegistry", menuName = "Boxapult/Levels/Prefab Registry")]
    public sealed class LevelPrefabRegistry : ScriptableObject
    {
        [Serializable]
        private sealed class Entry
        {
            public string id;
            public GameObject prefab;
        }

        [SerializeField] private List<Entry> entries = new();

        private Dictionary<string, GameObject> _prefabsById;

        public bool TryGet(string prefabId, out GameObject prefab)
        {
            EnsureIndex();
            return _prefabsById.TryGetValue(prefabId, out prefab) && prefab != null;
        }

        private void EnsureIndex()
        {
            if (_prefabsById != null)
            {
                return;
            }

            _prefabsById = new Dictionary<string, GameObject>(StringComparer.Ordinal);
            foreach (Entry entry in entries)
            {
                if (entry != null && !string.IsNullOrWhiteSpace(entry.id) && entry.prefab != null)
                {
                    _prefabsById[entry.id.Trim()] = entry.prefab;
                }
            }
        }

        private void OnValidate()
        {
            _prefabsById = null;
        }
    }
}
