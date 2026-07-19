# Architecture Audit — v0.3

## Passed boundaries

- Route differences are data, not separate scene classes.
- Mission state is isolated in `MissionSession` and can be tested without Phaser.
- Route unlock and persistence are isolated in `ProgressStore`.
- Spawn pacing is isolated in `SpawnDirector`.
- HUD rendering is isolated in `Hud`.
- Runtime artwork and sound are isolated in their own systems.
- No route ID is allowed to trigger runtime special-case logic.
- No scene may directly use LocalStorage.
- Phaser composition exists only in `src/main.js`.

## Reusable extension points

A fourth route should require only:

1. one new object in `src/config/routes.js`;
2. balancing of duration, parcel target, spawn timing and enemy weights;
3. a new palette;
4. no new scene class and no edits to mission rules.

A fourth enemy family is allowed only when it introduces a materially different decision and can appear in at least two routes. It should be added through an enemy behavior registry before more combat logic is added to `GameScene`.

## Known risks before market submission

1. Phaser is temporarily loaded from cdnjs. The final CrazyGames ZIP must vendor `phaser.min.js` locally.
2. `GameScene` remains the orchestration hub. Before adding bosses or route-specific hazards, enemy behavior and collision resolution should be extracted into dedicated systems.
3. Current artwork is original and code-generated, but still represents a polished prototype style rather than final commissioned art.
4. CrazyGames SDK lifecycle, ads and cloud data are not yet connected.
5. Browser playtesting is still required for input feel, spawn fairness and mobile performance.

## Stop conditions

Development must stop and refactor when any of these occur:

- a route needs its own game scene;
- a route ID appears in runtime branching;
- a new feature is useful in only one encounter;
- scene code calls LocalStorage or a platform SDK;
- an object pool is reused without resetting tint, scale, velocity and custom data;
- a route cannot be tuned through configuration alone.
