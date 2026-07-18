using UnityEngine;

namespace Boxapult.Gameplay.Configuration
{
    [CreateAssetMenu(fileName = "GameRuntimeConfig", menuName = "Boxapult/Configuration/Game Runtime Config")]
    public sealed class GameRuntimeConfig : ScriptableObject
    {
        [Header("Startup")]
        [SerializeField] private string firstLevelId = "apt-001";
        [SerializeField] private string saveKey = "boxapult_save_v1";

        [Header("Launch")]
        [SerializeField, Min(0.1f)] private float maximumDragDistance = 3f;
        [SerializeField, Min(0f)] private float minimumDragDistance = 0.2f;
        [SerializeField, Min(0.1f)] private float launchSpeedPerWorldUnit = 6f;

        [Header("Physics")]
        [SerializeField, Min(0.005f)] private float fixedDeltaTime = 0.02f;
        [SerializeField] private Vector2 gravity = new(0f, -9.81f);
        [SerializeField, Min(1f)] private float maximumPackageSpeed = 25f;
        [SerializeField, Min(0f)] private float stationarySpeedThreshold = 0.15f;
        [SerializeField, Min(0f)] private float stationaryDuration = 2f;

        [Header("Integrity")]
        [SerializeField, Range(1, 100)] private int maximumIntegrity = 100;
        [SerializeField, Min(0f)] private float collisionDamageThreshold = 5f;
        [SerializeField, Min(0f)] private float collisionDamagePerSpeed = 8f;

        public string FirstLevelId => firstLevelId;
        public string SaveKey => saveKey;
        public float MaximumDragDistance => maximumDragDistance;
        public float MinimumDragDistance => minimumDragDistance;
        public float LaunchSpeedPerWorldUnit => launchSpeedPerWorldUnit;
        public float FixedDeltaTime => fixedDeltaTime;
        public Vector2 Gravity => gravity;
        public float MaximumPackageSpeed => maximumPackageSpeed;
        public float StationarySpeedThreshold => stationarySpeedThreshold;
        public float StationaryDuration => stationaryDuration;
        public int MaximumIntegrity => maximumIntegrity;
        public float CollisionDamageThreshold => collisionDamageThreshold;
        public float CollisionDamagePerSpeed => collisionDamagePerSpeed;

        private void OnValidate()
        {
            firstLevelId = firstLevelId?.Trim();
            saveKey = saveKey?.Trim();
            maximumDragDistance = Mathf.Max(0.1f, maximumDragDistance);
            minimumDragDistance = Mathf.Clamp(minimumDragDistance, 0f, maximumDragDistance);
            launchSpeedPerWorldUnit = Mathf.Max(0.1f, launchSpeedPerWorldUnit);
            fixedDeltaTime = Mathf.Clamp(fixedDeltaTime, 0.005f, 0.05f);
            maximumPackageSpeed = Mathf.Max(1f, maximumPackageSpeed);
            stationarySpeedThreshold = Mathf.Max(0f, stationarySpeedThreshold);
            stationaryDuration = Mathf.Max(0f, stationaryDuration);
            maximumIntegrity = Mathf.Clamp(maximumIntegrity, 1, 100);
            collisionDamageThreshold = Mathf.Max(0f, collisionDamageThreshold);
            collisionDamagePerSpeed = Mathf.Max(0f, collisionDamagePerSpeed);
        }
    }
}
