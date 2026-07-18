# Game Design Baseline

## Product sentence

Drag a package backward, release it, and use a small physical scene to land safely inside the delivery zone.

## Core loop

```text
Aim -> Launch -> Watch collisions -> Deliver or fail -> Instant retry
```

The first release must prove this loop before adding content systems.

## Non-negotiable experience targets

- First meaningful input within 10 seconds.
- First success should be possible within 30 seconds.
- Restart must feel immediate.
- Failure must be readable and visually entertaining.
- Mouse and touch use the same single-pointer interaction.
- No menu is shown before the first playable level.

## First vertical slice

Only one white-box level is active. It proves responsive input, predictable launch strength, stable collision, settle-based success, bounded failure, and retry without a page reload.

It intentionally excludes glass, movable crates, springs, fans, switches, progression, economy, skins, ads, and final art.

## Expansion sequence

1. Static geometry and route choice.
2. Breakable glass.
3. Movable crates.
4. Spring pad.
5. Fan force field.
6. Switch and door.

Each mechanic requires one isolated teaching level, two combination levels, a content specification, and an automated or deterministic test where practical.

## Scope red flags

Stop and review when a mechanic is useful in only one level, a level needs custom code, progression is proposed before the launch loop is fun, art is produced before collision dimensions are frozen, or a failed launch takes more than one action to retry.
