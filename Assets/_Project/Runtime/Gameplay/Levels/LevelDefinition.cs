using System;
using System.Collections.Generic;
using UnityEngine;

namespace Boxapult.Gameplay.Levels
{
    public enum DistrictId
    {
        Apartment = 0,
        Office = 1,
        Warehouse = 2
    }

    public enum PackageTypeId
    {
        Standard = 0,
        Fragile = 1,
        Heavy = 2
    }

    [Serializable]
    public sealed class GoalZoneDefinition
    {
        [SerializeField] private Vector2 center;
        [SerializeField] private Vector2 size = new(2.5f, 1.5f);
        [SerializeField, Min(0f)] private float maximumSettleSpeed = 0.5f;
        [SerializeField, Min(0f)] private float settleDuration = 0.5f;
        [SerializeField, Range(1, 100)] private int minimumIntegrity = 1;

        public Vector2 Center => center;
        public Vector2 Size => size;
        public float MaximumSettleSpeed => maximumSettleSpeed;
        public float SettleDuration => settleDuration;
        public int MinimumIntegrity => minimumIntegrity;
        public bool IsValid => size.x > 0f && size.y > 0f && settleDuration >= 0f;
    }

    [CreateAssetMenu(fileName = "LevelDefinition", menuName = "Boxapult/Levels/Level Definition")]
    public sealed class LevelDefinition : ScriptableObject
    {
        [SerializeField] private string id = "apt-001";
        [SerializeField] private DistrictId district;
        [SerializeField] private PackageTypeId packageType;
        [SerializeField] private Vector2 launchPoint;
        [SerializeField] private Rect cameraBounds = new(-9.6f, -5.4f, 19.2f, 10.8f);
        [SerializeField] private GoalZoneDefinition goal = new();
        [SerializeField] private List<LevelObjectPlacement> objects = new();

        public string Id => id;
        public DistrictId District => district;
        public PackageTypeId PackageType => packageType;
        public Vector2 LaunchPoint => launchPoint;
        public Rect CameraBounds => cameraBounds;
        public GoalZoneDefinition Goal => goal;
        public IReadOnlyList<LevelObjectPlacement> Objects => objects;

        private void OnValidate()
        {
            id = id?.Trim().ToLowerInvariant();
        }
    }
}
