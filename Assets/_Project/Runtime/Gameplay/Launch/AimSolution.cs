using UnityEngine;

namespace Boxapult.Gameplay.Launch
{
    public readonly struct AimSolution
    {
        public AimSolution(Vector2 origin, Vector2 velocity, float strength01, bool isValid)
        {
            Origin = origin;
            Velocity = velocity;
            Strength01 = strength01;
            IsValid = isValid;
        }

        public Vector2 Origin { get; }
        public Vector2 Velocity { get; }
        public float Strength01 { get; }
        public bool IsValid { get; }
    }
}
