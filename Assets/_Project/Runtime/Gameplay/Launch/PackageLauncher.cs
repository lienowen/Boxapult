using System;
using Boxapult.Gameplay.Flow;
using UnityEngine;

namespace Boxapult.Gameplay.Launch
{
    public sealed class PackageLauncher : MonoBehaviour, IGameContextReceiver
    {
        [SerializeField] private Rigidbody2D packageBody;
        [SerializeField] private Transform launchAnchor;

        private GameContext _context;
        private bool _isAiming;
        private AimSolution _currentSolution;

        public event Action<AimSolution> AimChanged;
        public event Action AimCancelled;
        public event Action<Vector2> Launched;

        public Rigidbody2D PackageBody => packageBody;

        public void Install(GameContext context)
        {
            _context = context;
            ResetPackage();
        }

        public void SetLaunchPoint(Vector2 worldPosition)
        {
            launchAnchor.position = worldPosition;
            ResetPackage();
        }

        public bool TryBeginAim(Vector2 pointerWorldPosition)
        {
            if (!CanAim())
            {
                return false;
            }

            _isAiming = true;
            packageBody.simulated = false;
            packageBody.position = launchAnchor.position;
            UpdateAim(pointerWorldPosition);
            return true;
        }

        public void UpdateAim(Vector2 pointerWorldPosition)
        {
            if (!_isAiming || _context == null)
            {
                return;
            }

            Vector2 origin = launchAnchor.position;
            Vector2 rawDrag = origin - pointerWorldPosition;
            Vector2 clampedDrag = Vector2.ClampMagnitude(rawDrag, _context.Config.MaximumDragDistance);
            float dragDistance = clampedDrag.magnitude;
            bool isValid = dragDistance >= _context.Config.MinimumDragDistance;
            Vector2 velocity = clampedDrag * _context.Config.LaunchSpeedPerWorldUnit;
            float strength = Mathf.InverseLerp(0f, _context.Config.MaximumDragDistance, dragDistance);

            _currentSolution = new AimSolution(origin, velocity, strength, isValid);
            packageBody.position = origin - clampedDrag;
            AimChanged?.Invoke(_currentSolution);
        }

        public bool TryReleaseAim()
        {
            if (!_isAiming)
            {
                return false;
            }

            _isAiming = false;

            if (!_currentSolution.IsValid)
            {
                ResetPackage();
                AimCancelled?.Invoke();
                return false;
            }

            if (!_context.Flow.TryMoveTo(GamePhase.Flying))
            {
                ResetPackage();
                AimCancelled?.Invoke();
                return false;
            }

            packageBody.position = _currentSolution.Origin;
            packageBody.rotation = 0f;
            packageBody.simulated = true;
            packageBody.linearVelocity = _currentSolution.Velocity;
            packageBody.angularVelocity = 0f;
            Launched?.Invoke(_currentSolution.Velocity);
            return true;
        }

        public void CancelAim()
        {
            if (!_isAiming)
            {
                return;
            }

            _isAiming = false;
            ResetPackage();
            AimCancelled?.Invoke();
        }

        public void ResetPackage()
        {
            _isAiming = false;
            _currentSolution = default;

            if (packageBody == null || launchAnchor == null)
            {
                return;
            }

            packageBody.simulated = false;
            packageBody.position = launchAnchor.position;
            packageBody.rotation = 0f;
            packageBody.linearVelocity = Vector2.zero;
            packageBody.angularVelocity = 0f;
        }

        private bool CanAim()
        {
            return _context != null &&
                   packageBody != null &&
                   launchAnchor != null &&
                   _context.Flow.IsInitialized &&
                   _context.Flow.Current == GamePhase.Aiming;
        }

        private void OnValidate()
        {
            if (packageBody == null)
            {
                packageBody = GetComponentInChildren<Rigidbody2D>();
            }
        }
    }
}
