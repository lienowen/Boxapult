# Boxapult

Architecture-first 2D physics delivery game targeting CrazyGames and modern WebGL browsers.

## Locked foundation

- Unity **6.3 LTS / 6000.3.18f1**
- Built-in 2D rendering; no URP in the first release
- One gameplay scene with data-driven levels
- Manual composition root; no service locator or third-party DI container
- CrazyGames integration isolated inside `Boxapult.Infrastructure`
- Physics rules centralized in `GameRuntimeConfig`

## Open the project

1. Install Unity `6000.3.18f1` with WebGL Build Support.
2. Clone this repository.
3. Open the repository root from Unity Hub.
4. Let Unity generate missing `.meta` files on the first import, then commit them before creating scenes or assets.

## Validate architecture

```bash
python Tools/validate_architecture.py
```

The same validation runs on every push through GitHub Actions.

## Module dependency direction

```text
Boxapult.Core
      ^
      |
Boxapult.Gameplay
   ^          ^
   |          |
Presentation  Infrastructure
       \      /
        Bootstrap

Editor -> Core + Gameplay
```

See [`Docs/ARCHITECTURE.md`](Docs/ARCHITECTURE.md) and [`Docs/PROJECT_RULES.md`](Docs/PROJECT_RULES.md) before adding gameplay code.

## Current milestone

`M0 — architecture bootstrap`

The next milestone is a five-level white-box prototype. Formal art production does not begin until the white-box acceptance gate passes.
