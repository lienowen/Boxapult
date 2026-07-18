using System.Collections.Generic;
using Boxapult.Gameplay.Levels;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace Boxapult.Editor
{
    public sealed class LevelDefinitionValidator : IPreprocessBuildWithReport
    {
        public int callbackOrder => -1000;

        [MenuItem("Boxapult/Validate Level Content")]
        public static void ValidateFromMenu()
        {
            if (ValidateAll(out List<string> errors))
            {
                Debug.Log("Boxapult level validation passed.");
                return;
            }

            foreach (string error in errors)
            {
                Debug.LogError(error);
            }
        }

        public void OnPreprocessBuild(BuildReport report)
        {
            if (!ValidateAll(out List<string> errors))
            {
                throw new BuildFailedException(string.Join("\n", errors));
            }
        }

        private static bool ValidateAll(out List<string> errors)
        {
            errors = new List<string>();
            HashSet<string> levelIds = new();
            string[] guids = AssetDatabase.FindAssets("t:LevelDefinition", new[] { "Assets/_Project" });

            foreach (string guid in guids)
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                LevelDefinition level = AssetDatabase.LoadAssetAtPath<LevelDefinition>(path);

                if (level == null)
                {
                    errors.Add($"Could not load LevelDefinition at '{path}'.");
                    continue;
                }

                if (string.IsNullOrWhiteSpace(level.Id))
                {
                    errors.Add($"Level at '{path}' has no ID.");
                }
                else if (!levelIds.Add(level.Id))
                {
                    errors.Add($"Duplicate level ID '{level.Id}' at '{path}'.");
                }

                if (level.Goal == null || !level.Goal.IsValid)
                {
                    errors.Add($"Level '{level.Id}' has an invalid goal zone.");
                }

                for (int index = 0; index < level.Objects.Count; index++)
                {
                    LevelObjectPlacement placement = level.Objects[index];
                    if (placement == null || string.IsNullOrWhiteSpace(placement.PrefabId))
                    {
                        errors.Add($"Level '{level.Id}' has an invalid object at index {index}.");
                    }
                }
            }

            return errors.Count == 0;
        }
    }
}
