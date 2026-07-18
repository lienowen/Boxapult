# Parcel Patrol Architecture

## Purpose

Parcel Patrol is a focused browser arcade game adapted from the scene organization of the MIT-licensed Phaser's Revenge demo. The product code, theme, controls, scoring, generated artwork, sound effects, storage and platform boundaries are implemented in this repository.

The architecture must preserve the speed of a small game without allowing all rules, platform calls and presentation code to collapse into one scene file.

## Dependency direction

```text
domain          <- pure scoring and rule calculations; no Phaser or browser APIs
application     <- ports and application-facing service contracts
content         <- balance and route configuration
runtime         <- Phaser scenes, input, collision execution, HUD, feedback and generated art
infrastructure  <- browser storage and future CrazyGames adapters
app             <- the only composition root; creates services and Phaser configuration
```

Dependencies point toward stable contracts. `runtime` may use `domain`, `application` and `content`; it may not directly access platform SDKs or LocalStorage.

## Current runtime flow

```text
ParcelTitleScene
  -> ParcelGameScene
  -> ParcelResultScene
  -> retry ParcelGameScene or return ParcelTitleScene
```

Each scene must reset its mutable session state when entered because Phaser reuses scene instances.

## Responsibilities

- `domain/parcelPatrol`: pure route grading and future deterministic scoring rules.
- `application/ports`: interfaces for platform lifecycle and persistence.
- `content/parcelPatrol`: mission duration, player tuning, spawn timing and scoring values.
- `runtime/parcelPatrol`: generated vector textures, parallax backdrop, sound synthesis and result data.
- `runtime/scenes`: title, active mission and result orchestration.
- `infrastructure`: LocalStorage fallback and future CrazyGames SDK implementation.
- `app/createParcelPatrol.ts`: creates adapters and Phaser; it contains no game rules.

## Non-negotiable runtime rules

1. The title, mission and result scenes form one complete loop; no direct DOM navigation between game states.
2. Every scene must remove input listeners on shutdown and reset private state on re-entry.
3. Object pools must reset texture, scale, alpha, velocity, tint and custom data before reuse.
4. Session score, lives, combo, timers and spawn counters reset in one mission-reset method.
5. Platform lifecycle calls go only through `PlatformPort`.
6. Browser persistence goes only through infrastructure adapters and must fail safely.
7. Scoring thresholds and route grades belong in pure domain functions with tests.
8. Mission tuning belongs in `content/parcelPatrol/balance.ts`, not scattered magic numbers.
9. Original Phaser demo art, fonts, music and audio must never be copied into the commercial build.
10. A second route must reuse the same mission systems and differ through content/configuration before new scene classes are considered.

## Open-source boundary

The official Phaser demo provides the legal and technical starting point for scene organization and a basic arcade-shooter loop. Parcel Patrol does not ship the source demo's assets. Attribution is retained in `THIRD_PARTY_NOTICES.md`.

## Quality gate

`npm run check` performs:

1. architecture-boundary validation;
2. pure logic tests;
3. strict TypeScript compilation;
4. a production Vite build.

A deployment is not considered valid merely because Vercel created a URL. The full quality gate and a title-to-result browser playthrough must both pass.

## Deliberate non-goals for the first release

The first release does not include React, an ECS framework, a dependency-injection library, multiplayer, backend services, an economy, a store, multiple currencies, procedural generation or advertisements. Those features are blocked until the single-route loop demonstrates retention-worthy play.
