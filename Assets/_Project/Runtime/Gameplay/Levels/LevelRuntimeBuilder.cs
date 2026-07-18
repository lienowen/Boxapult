using System;
using System.Collections.Generic;
using Boxapult.Gameplay.Launch;
using Boxapult.Gameplay.Package;
using UnityEngine;

namespace Boxapult.Gameplay.Levels
{
    public sealed class LevelRuntimeBuilder : MonoBehaviour
    {
        [SerializeField] private Transform levelRoot;
        [SerializeField] private LevelPrefabRegistry prefabRegistry;
        [SerializeField] private PackageLauncher packageLauncher;
        [SerializeField] private PackageIntegrity packageIntegrity;
        [SerializeField] private DeliveryGoalZone goalZone;

        private readonly List<GameObject> _spawnedObjects = new();

        public void Build(LevelDefinition definition, GameContext context)
        {
            if (definition == null)
            {
                throw new ArgumentNullException(nameof(definition));
            }

            Clear();
            packageLauncher.SetLaunchPoint(definition.LaunchPoint);
            packageIntegrity.ResetIntegrity();
            goalZone.Configure(
                definition.Goal,
                context.Flow,
                packageLauncher.PackageBody,
                packageIntegrity);

            foreach (LevelObjectPlacement placement in definition.Objects)
            {
                if (placement == null || !prefabRegistry.TryGet(placement.PrefabId, out GameObject prefab))
                {
                    throw new InvalidOperationException(
                        $"Level '{definition.Id}' references missing prefab ID '{placement?.PrefabId}'.");
                }

                GameObject instance = Instantiate(prefab, levelRoot);
                instance.name = placement.PrefabId;
                instance.transform.SetPositionAndRotation(
                    placement.Position,
                    Quaternion.Euler(0f, 0f, placement.RotationDegrees));
                instance.transform.localScale = new Vector3(placement.Scale.x, placement.Scale.y, 1f);
                _spawnedObjects.Add(instance);

                foreach (MonoBehaviour behaviour in instance.GetComponentsInChildren<MonoBehaviour>(true))
                {
                    if (behaviour is ILevelObjectRuntime runtimeObject)
                    {
                        runtimeObject.Configure(placement, context);
                    }
                }
            }
        }

        public void Clear()
        {
            foreach (GameObject instance in _spawnedObjects)
            {
                if (instance != null)
                {
                    Destroy(instance);
                }
            }

            _spawnedObjects.Clear();
        }
    }
}
