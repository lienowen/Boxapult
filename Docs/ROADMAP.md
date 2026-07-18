# Roadmap

## M0 — Architecture bootstrap

- Unity project lock
- assembly boundaries
- composition root
- game-flow state machine
- runtime configuration
- level data schema
- local platform and save adapters
- repository and pre-build validation

## M1 — Five-level white box

- Boot and Gameplay scenes
- input abstraction for mouse and touch
- package launcher
- trajectory preview
- package rigidbody controller
- delivery-zone resolution
- instant restart
- five white-box levels

### Acceptance gate

- a new tester launches a package within 10 seconds without text instruction;
- level one is normally completed within 30 seconds;
- restart is under 0.5 seconds;
- the same input produces materially consistent results at 30, 60, 144, and 165 Hz;
- no white-box level needs a special-case script;
- at least three of five testers voluntarily finish all five levels.

## M2 — Vertical slice

- final apartment visual direction
- final package, glass, crate, and bounce-pad assets
- collision audio and feedback
- levels 1–3 at release quality
- WebGL size and loading measurement

## M3 — Content production

- reusable level editor workflow
- 30 campaign levels
- office and warehouse districts
- content validation and balance passes

## M4 — CrazyGames readiness

- CrazyGames SDK adapter
- gameplay start/stop integration
- cloud data migration
- focus and audio lifecycle
- custom WebGL build optimization
- platform preview QA

## M5 — Submission freeze

No new systems. Only defects, tuning, loading, compatibility, copy, and asset corrections.
