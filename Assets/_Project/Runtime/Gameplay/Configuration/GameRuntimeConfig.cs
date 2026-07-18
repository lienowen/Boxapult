using UnityEngine;

namespace Boxapult.Gameplay.Configuration
{
    [CreateAssetMenu(fileName = "GameRuntimeConfig", menuName = "Boxapult/Configuration/Game Runtime Config")]
    public sealed class GameRuntimeConfig : ScriptableObject
    {
        [Header("Startup")]
        [SerializeField] private string firstLevelId = "apt-001";
        [SerializeField] private string saveKey = "boxapult_save_v1";

        [Header("Physics")]
        [SerializeField, Min(0.005f)] private float fixedDeltaTime = 0.02f;
        [SerializeField] private Vector2 gravity = new(0f, -9.81f);
        [SerializeField, Min(1f)] private float maximumPackageSpeed = 25f;
        [SerializeField, Min(0f)] private float stationarySpeedThreshold = 0.15f;
        [SerializeField, Min(0f)] private float stationaryDuration = 2f;

        public string FirstLevelId => firstLevelId;
        public string SaveKey => saveKey;
        public float FixedDeltaTime => fixedDeltaTime;
        public Vector2 Gravity => gravity;
        public float MaximumPackageSpeed => maximumPackageSpeed;
        public float StationarySpeedThreshold => stationarySpeedThreshold;
        public float StationaryDuration => stationaryDuration;

        private void OnValidate()
        {
            firstLevelId = firstLevelId?.Trim();
            saveKey = saveKey?.Trim();
            fixedDeltaTime = Mathf.Clamp(fixedDeltaTime, 0.005f, 0.05f);
            maximumPackageSpeed = Mathf.Max(1f, maximumPackageSpeed);
            stationarySpeedThreshold = Mathf.Max(0f, stationarySpeedThreshold);
            stationaryDuration = Mathf.Max(0f, stationaryDuration);
        }
    }
}
