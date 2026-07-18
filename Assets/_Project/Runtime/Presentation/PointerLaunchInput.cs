using Boxapult.Gameplay.Launch;
using UnityEngine;

namespace Boxapult.Presentation
{
    public sealed class PointerLaunchInput : MonoBehaviour
    {
        [SerializeField] private Camera worldCamera;
        [SerializeField] private PackageLauncher launcher;
        [SerializeField] private float interactionPlaneZ;

        private bool _mouseAiming;
        private int _activeFingerId = -1;

        private void Update()
        {
            if (Input.touchCount > 0)
            {
                ProcessTouch();
                return;
            }

            ProcessMouse();
        }

        private void ProcessMouse()
        {
            Vector2 worldPosition = ScreenToWorld(Input.mousePosition);

            if (Input.GetMouseButtonDown(0))
            {
                _mouseAiming = launcher.TryBeginAim(worldPosition);
            }
            else if (_mouseAiming && Input.GetMouseButton(0))
            {
                launcher.UpdateAim(worldPosition);
            }
            else if (_mouseAiming && Input.GetMouseButtonUp(0))
            {
                _mouseAiming = false;
                launcher.TryReleaseAim();
            }
        }

        private void ProcessTouch()
        {
            for (int index = 0; index < Input.touchCount; index++)
            {
                Touch touch = Input.GetTouch(index);

                if (_activeFingerId == -1 && touch.phase == TouchPhase.Began)
                {
                    if (launcher.TryBeginAim(ScreenToWorld(touch.position)))
                    {
                        _activeFingerId = touch.fingerId;
                    }

                    continue;
                }

                if (touch.fingerId != _activeFingerId)
                {
                    continue;
                }

                switch (touch.phase)
                {
                    case TouchPhase.Moved:
                    case TouchPhase.Stationary:
                        launcher.UpdateAim(ScreenToWorld(touch.position));
                        break;
                    case TouchPhase.Ended:
                        _activeFingerId = -1;
                        launcher.TryReleaseAim();
                        break;
                    case TouchPhase.Canceled:
                        _activeFingerId = -1;
                        launcher.CancelAim();
                        break;
                }
            }
        }

        private Vector2 ScreenToWorld(Vector2 screenPosition)
        {
            float depth = Mathf.Abs(worldCamera.transform.position.z - interactionPlaneZ);
            Vector3 world = worldCamera.ScreenToWorldPoint(new Vector3(screenPosition.x, screenPosition.y, depth));
            return new Vector2(world.x, world.y);
        }

        private void OnApplicationFocus(bool hasFocus)
        {
            if (!hasFocus)
            {
                _mouseAiming = false;
                _activeFingerId = -1;
                launcher.CancelAim();
            }
        }

        private void OnValidate()
        {
            if (worldCamera == null)
            {
                worldCamera = Camera.main;
            }
        }
    }
}
