using UnityEngine;

namespace Boxapult.Gameplay.Package
{
    public sealed class PackageMotionLimiter : MonoBehaviour, IGameContextReceiver
    {
        [SerializeField] private Rigidbody2D packageBody;

        private GameContext _context;

        public void Install(GameContext context)
        {
            _context = context;
        }

        private void FixedUpdate()
        {
            if (_context == null || packageBody == null || !packageBody.simulated)
            {
                return;
            }

            float maximumSpeed = _context.Config.MaximumPackageSpeed;
            if (packageBody.linearVelocity.sqrMagnitude > maximumSpeed * maximumSpeed)
            {
                packageBody.linearVelocity = packageBody.linearVelocity.normalized * maximumSpeed;
            }
        }

        private void OnValidate()
        {
            if (packageBody == null)
            {
                packageBody = GetComponent<Rigidbody2D>();
            }
        }
    }
}
