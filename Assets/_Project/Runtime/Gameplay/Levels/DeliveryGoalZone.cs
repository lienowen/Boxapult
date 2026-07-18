using Boxapult.Gameplay.Flow;
using Boxapult.Gameplay.Package;
using UnityEngine;

namespace Boxapult.Gameplay.Levels
{
    [RequireComponent(typeof(BoxCollider2D))]
    public sealed class DeliveryGoalZone : MonoBehaviour
    {
        [SerializeField] private BoxCollider2D trigger;

        private GoalZoneDefinition _definition;
        private GameFlow _flow;
        private Rigidbody2D _packageBody;
        private PackageIntegrity _integrity;
        private bool _packageInside;
        private float _settledDuration;
        private bool _resolved;

        public void Configure(
            GoalZoneDefinition definition,
            GameFlow flow,
            Rigidbody2D packageBody,
            PackageIntegrity integrity)
        {
            _definition = definition;
            _flow = flow;
            _packageBody = packageBody;
            _integrity = integrity;
            _packageInside = false;
            _settledDuration = 0f;
            _resolved = false;

            transform.position = definition.Center;
            trigger.size = definition.Size;
            trigger.isTrigger = true;
        }

        private void FixedUpdate()
        {
            if (_resolved ||
                !_packageInside ||
                _flow == null ||
                _packageBody == null ||
                _integrity == null ||
                _flow.Current != GamePhase.Flying)
            {
                return;
            }

            if (_integrity.Current < _definition.MinimumIntegrity)
            {
                _settledDuration = 0f;
                return;
            }

            if (_packageBody.linearVelocity.magnitude <= _definition.MaximumSettleSpeed)
            {
                _settledDuration += Time.fixedDeltaTime;
                if (_settledDuration >= _definition.SettleDuration)
                {
                    ResolveSuccess();
                }
            }
            else
            {
                _settledDuration = 0f;
            }
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (other.attachedRigidbody == _packageBody)
            {
                _packageInside = true;
                _settledDuration = 0f;
            }
        }

        private void OnTriggerExit2D(Collider2D other)
        {
            if (other.attachedRigidbody == _packageBody)
            {
                _packageInside = false;
                _settledDuration = 0f;
            }
        }

        private void ResolveSuccess()
        {
            _resolved = true;
            if (_flow.TryMoveTo(GamePhase.Resolving))
            {
                _flow.TryMoveTo(GamePhase.Success);
            }
        }

        private void OnValidate()
        {
            if (trigger == null)
            {
                trigger = GetComponent<BoxCollider2D>();
            }
        }
    }
}
