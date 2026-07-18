using Boxapult.Gameplay.Launch;
using UnityEngine;

namespace Boxapult.Presentation
{
    [RequireComponent(typeof(LineRenderer))]
    public sealed class TrajectoryPreview : MonoBehaviour
    {
        [SerializeField] private PackageLauncher launcher;
        [SerializeField] private LineRenderer lineRenderer;
        [SerializeField, Range(4, 64)] private int pointCount = 24;
        [SerializeField, Min(0.01f)] private float timeStep = 0.06f;

        private void OnEnable()
        {
            launcher.AimChanged += HandleAimChanged;
            launcher.AimCancelled += Hide;
            launcher.Launched += HandleLaunched;
            Hide();
        }

        private void OnDisable()
        {
            launcher.AimChanged -= HandleAimChanged;
            launcher.AimCancelled -= Hide;
            launcher.Launched -= HandleLaunched;
        }

        private void HandleAimChanged(AimSolution solution)
        {
            if (!solution.IsValid)
            {
                Hide();
                return;
            }

            lineRenderer.enabled = true;
            lineRenderer.positionCount = pointCount;

            for (int index = 0; index < pointCount; index++)
            {
                float time = index * timeStep;
                Vector2 point = solution.Origin +
                                solution.Velocity * time +
                                0.5f * Physics2D.gravity * time * time;
                lineRenderer.SetPosition(index, new Vector3(point.x, point.y, 0f));
            }
        }

        private void HandleLaunched(Vector2 velocity)
        {
            Hide();
        }

        private void Hide()
        {
            if (lineRenderer != null)
            {
                lineRenderer.enabled = false;
                lineRenderer.positionCount = 0;
            }
        }

        private void OnValidate()
        {
            if (lineRenderer == null)
            {
                lineRenderer = GetComponent<LineRenderer>();
            }
        }
    }
}
