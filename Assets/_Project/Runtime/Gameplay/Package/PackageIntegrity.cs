using System;
using Boxapult.Gameplay.Flow;
using UnityEngine;

namespace Boxapult.Gameplay.Package
{
    public sealed class PackageIntegrity : MonoBehaviour, IGameContextReceiver
    {
        private GameContext _context;

        public event Action<int, int> IntegrityChanged;
        public event Action Depleted;

        public int Current { get; private set; }
        public int Maximum { get; private set; }

        public void Install(GameContext context)
        {
            _context = context;
            Maximum = context.Config.MaximumIntegrity;
            ResetIntegrity();
        }

        public void ResetIntegrity()
        {
            if (_context == null)
            {
                return;
            }

            Maximum = _context.Config.MaximumIntegrity;
            Current = Maximum;
            IntegrityChanged?.Invoke(Current, Maximum);
        }

        public void ApplyDamage(int amount)
        {
            if (amount <= 0 || Current <= 0)
            {
                return;
            }

            Current = Mathf.Max(0, Current - amount);
            IntegrityChanged?.Invoke(Current, Maximum);

            if (Current == 0)
            {
                Depleted?.Invoke();
            }
        }

        private void OnCollisionEnter2D(Collision2D collision)
        {
            if (_context == null ||
                !_context.Flow.IsInitialized ||
                _context.Flow.Current != GamePhase.Flying)
            {
                return;
            }

            float impactSpeed = collision.relativeVelocity.magnitude;
            float excessSpeed = impactSpeed - _context.Config.CollisionDamageThreshold;
            if (excessSpeed <= 0f)
            {
                return;
            }

            int damage = Mathf.CeilToInt(excessSpeed * _context.Config.CollisionDamagePerSpeed);
            ApplyDamage(damage);
        }
    }
}
