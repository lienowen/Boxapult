# Boxapult architecture

## Architectural goal

Keep the physics loop small, deterministic enough for level design, and independent from platform SDKs and UI. New levels must be data, not code.

## Runtime assemblies

### `Boxapult.Core`

Small reusable primitives only. It must not know about gameplay, UI, storage, ads, or CrazyGames.

### `Boxapult.Gameplay`

Game rules, state, level definitions, runtime configuration, and service contracts. It owns the meaning of the game but does not know how data is stored or how the platform SDK works.

### `Boxapult.Presentation`

Camera, UI, audio, animation, visual feedback, and input presentation. It may observe gameplay but must not become the source of gameplay truth.

### `Boxapult.Infrastructure`

Implementations for persistence, platform SDKs, analytics, ads, remote configuration, and browser-specific behavior. `PlayerPrefs`, CrazyGames SDK calls, and browser bridges belong here only.

### `Boxapult.Bootstrap`

The sole composition root. It constructs concrete services and injects `GameContext` into scene receivers. No other module may construct the full application graph.

### `Boxapult.Editor`

Level authoring, validation, import rules, and build gates. Editor code never enters a player build.

## Dependency rule

Dependencies only point inward:

```text
Core <- Gameplay <- Presentation
                 <- Infrastructure

Core + Gameplay + Presentation + Infrastructure <- Bootstrap
Core + Gameplay <- Editor
```

A dependency in the opposite direction is an architecture defect, not a convenience.

## Scene strategy

The release target has three scenes:

1. `Boot` — platform initialization and first playable loading.
2. `Gameplay` — all campaign levels, tutorial steps, and daily contracts.
3. `Sandbox` — development-only physics and content testing.

There is never one Unity scene per level.

## Level strategy

`LevelDefinition` is the source of level structure. It contains identifiers and placements, not direct ad-hoc scripts. A level may only choose registered prefabs, positions, rotations, variants, link groups, package type, and goals.

A new mechanic must be reusable in at least three levels. Otherwise it is removed or redesigned.

## Composition and state

- No service locator.
- No mutable global singleton.
- No third-party DI container.
- `GameBootstrapper` creates the graph once.
- Scene components receive a `GameContext` through `IGameContextReceiver`.
- `GameFlow` is the single authority for high-level runtime phase.

## Physics ownership

Global physics values live in `GameRuntimeConfig` and are applied once by the bootstrapper. Level files cannot modify gravity, fixed timestep, damage thresholds, or package rigidbody defaults.

Physics forces are applied in fixed-time code. Visual interpolation belongs to presentation. Framerate-dependent force calculations are forbidden.

## Platform ownership

Game code calls `IPlatformService`; it never calls CrazyGames directly. During local development, `LocalPlatformService` is used. A future `CrazyGamesPlatformService` will replace it without changing gameplay code.

## Save ownership

Game code calls `IGameSaveService`; only infrastructure can use `PlayerPrefs`, cloud data, JSON files, or platform storage.

## Build gates

A build is blocked when level IDs are duplicated, goal zones are invalid, or placed objects have no registered ID. Repository validation also blocks forbidden assembly references and common architecture shortcuts.
