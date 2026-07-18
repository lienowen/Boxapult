# Architecture

## Purpose

Boxapult is a small browser game, not a general-purpose engine. The architecture prevents duplicated rules, incompatible assets, per-level patches, oversized systems, and platform code mixed into gameplay.

## Dependency direction

```text
domain          <- pure rules, no Phaser, no browser APIs
application     <- ports and use-case contracts; may depend on domain
content         <- level and balance data; may depend on domain types
runtime         <- Phaser scenes and systems; depends on application/content/domain
infrastructure  <- browser and CrazyGames adapters; depends on application ports
app             <- composition root; wires runtime and infrastructure
```

Dependencies only point inward or toward stable contracts. `app` is the only composition root.

## Responsibilities

- `domain`: state machine, launch calculation, level validation, integrity and scoring rules.
- `application`: stable ports such as `PlatformPort` and `SavePort`.
- `content`: declarative balance and level data with no executable callbacks.
- `runtime`: Phaser scenes, entity construction, input, outcome checks, HUD and feedback.
- `infrastructure`: LocalStorage, local preview, and future CrazyGames SDK adapters.
- `app`: creates adapters and Phaser configuration; contains no gameplay rules.

## Runtime rules

1. Matter Physics runs at a fixed 60 Hz step.
2. One gameplay scene serves every level.
3. Levels are plain data selected from one catalog.
4. A new mechanic requires a reusable system and at least three intended level uses.
5. A level ID may never trigger special-case code.
6. Restart reconstructs the level cleanly.
7. Platform lifecycle calls go only through `PlatformPort`.
8. Production art never owns collision geometry.

## Quality gate

`npm run check` must pass before pushing. It performs architecture validation, pure domain tests, strict TypeScript compilation, and a production Vite build.

## Deliberate non-goals

The first release does not use React, an ECS framework, a dependency injection library, Redux-style global state, procedural generation, multiplayer, backend services, or a custom editor before plain level data proves insufficient.
