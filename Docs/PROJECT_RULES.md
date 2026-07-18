# Project rules

These rules protect Boxapult from becoming a patchwork project.

## Non-negotiable rules

1. One gameplay scene; levels are data.
2. No per-level scripts and no `if (levelNumber == ...)` behavior.
3. No direct CrazyGames SDK calls outside `Boxapult.Infrastructure`.
4. No direct `PlayerPrefs` access outside `Boxapult.Infrastructure`.
5. No `Resources.Load`; assets use registries first and Addressables only when the content budget requires it.
6. No `FindObjectOfType`, scene-wide searches, or hidden runtime dependency discovery.
7. No new third-party runtime package without an architecture decision record.
8. No URP in the first release unless a measured visual requirement justifies its WebGL cost.
9. No formal art batch before the five-level white-box gate passes.
10. No new mechanic that cannot support at least three good levels.
11. No physics value overrides inside individual levels.
12. No submission-week features; submission freeze is bug fixes and tuning only.

## Definition of done for a gameplay feature

A feature is complete only when:

- its responsibility belongs to one module;
- its public contract is named and documented;
- it works with mouse and touch through the same input abstraction;
- it survives restart without stale state;
- it has no per-level special case;
- its assets follow scale, pivot, and collider standards;
- it passes low-resolution and high-refresh testing;
- it has a clear removal path if metrics show it does not help.

## Content naming

- Level IDs: `apt-001`, `off-001`, `whs-001`.
- Prefab IDs: `obstacle.glass.wide`, `device.fan.medium`, `goal.door.standard`.
- Link groups: short semantic IDs such as `door-a`.
- Asset files: lowercase kebab-case.
- C# types: PascalCase under the `Boxapult` root namespace.

## Scope gate for release one

Allowed mechanics:

- launch and trajectory preview;
- standard, fragile, and heavy packages;
- glass, crates, bounce pads, fans, conveyors, buttons, and doors;
- delivery goal, integrity goal, and one contract goal;
- campaign levels and daily contract variants.

Anything else requires removing an existing item from the first-release scope.
