using System;
using UnityEngine;

namespace Boxapult.Gameplay.Levels
{
    [Serializable]
    public sealed class LevelObjectPlacement
    {
        [SerializeField] private string prefabId;
        [SerializeField] private string variantId;
        [SerializeField] private Vector2 position;
        [SerializeField] private float rotationDegrees;
        [SerializeField] private Vector2 scale = Vector2.one;
        [SerializeField] private string linkGroupId;

        public string PrefabId => prefabId;
        public string VariantId => variantId;
        public Vector2 Position => position;
        public float RotationDegrees => rotationDegrees;
        public Vector2 Scale => scale;
        public string LinkGroupId => linkGroupId;
    }
}
