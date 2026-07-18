# First-level playtest protocol

This protocol is the only active validation scope. Do not add a second level, a new mechanic, or production art until these checks pass.

## Test URLs

- Normal player view: `https://boxapult.vercel.app/`
- Telemetry view: `https://boxapult.vercel.app/?debug=1`

The telemetry panel is opt-in and must never appear in the normal player view.

## Run sequence

1. Open the normal player view in a fresh tab.
2. Time how long it takes to understand the drag-and-release action.
3. Try a light, medium, and full-strength launch.
4. Complete at least one successful delivery.
5. Trigger each visible failure type: stuck, out of bounds, and destroyed when practical.
6. Restart at least 20 times using both pointer input and the `R` key.
7. Repeat once in a mobile browser in landscape orientation.
8. Open the telemetry view only when a result feels wrong and capture its values.

## Acceptance gate

- First launch happens within 10 seconds without external explanation.
- A new player succeeds within three attempts.
- The preview does not visibly promise a different route from the actual launch.
- Light, medium, and full power feel meaningfully different.
- The package starts on the platform and the goal aligns with its landing surface.
- Failure text matches the actual reason.
- Retry is available in under one second.
- Twenty restarts do not duplicate input, HUD, physics bodies, or event listeners.
- Desktop and mobile inputs produce the same intended launch direction.

## Feedback template

```text
Device / browser:
Screen orientation:
First launch time:
Attempts before success:
Trajectory accurate: yes / slightly off / clearly off
Power: too weak / good / too strong
Bounce: too low / good / too high
Slide: too short / good / too far
Goal: too easy / good / too hard
Damage: too forgiving / good / too harsh
Retry: clean / problem
Failure reason shown:
Debug values at the problem moment:
Notes:
```

## Decision rule

Only tune values already owned by `gameBalance` or first-level geometry. A problem must not be solved by adding a one-off script, hidden collider, new mechanic, or permanent tutorial popup.
