# Architecture Audit — v0.4

## Passed boundaries

- Route differences are data, not separate scene classes.
- Mission state is isolated in `MissionSession` and can be tested without Phaser.
- Route unlock and persistence are isolated in `ProgressStore`.
- Player preferences are isolated in `SettingsStore`; scenes do not call LocalStorage.
- Spawn pacing is isolated in `SpawnDirector`.
- HUD rendering is isolated in `Hud`.
- Tutorial, pause, mute and route-exit UI are isolated in `GameplayControlsOverlay`.
- Runtime atlas selection and fallback behavior are isolated in `AssetCatalog` and `BootScene`.
- Generated fallback artwork remains isolated in `ArtFactory` and is not the primary presentation path.
- No route ID is allowed to trigger runtime special-case logic.
- No scene may directly use LocalStorage.
- Phaser composition exists only in `src/main.js`.

## Runtime lifecycle guarantees

- The first-route tutorial pauses physics before mission time starts advancing.
- Pause blocks input, spawning, mission time, enemy behavior and collisions.
- Shield, rapid-fire, invulnerability, firing cooldown and enemy-shot timestamps are shifted on resume, so pause time never consumes gameplay time.
- Pause and input listeners are removed on scene shutdown.
- Atlas loading failure changes the asset mode to `fallback` instead of producing a blank screen.
- Audio mute state persists through `SettingsStore` and does not require scene knowledge.

## Reusable extension points

A fourth route should require only:

1. one new object in `src/config/routes.js`;
2. balancing of duration, parcel target, spawn timing and enemy weights;
3. a new palette or optional background asset references;
4. no new scene class and no edits to mission rules.

A fourth enemy family is allowed only when it introduces a materially different decision and can appear in at least two routes. It must be added through an enemy behavior registry before more combat branching is added to `GameScene`.

A new pickup must provide:

1. one asset catalog entry;
2. one duration/effect definition in a pickup registry;
3. no direct pickup-name branching inside scene input, HUD or persistence code.

## Known risks before market submission

1. Phaser is temporarily loaded from cdnjs. The final CrazyGames ZIP must vendor `phaser.min.js` locally.
2. `GameScene` remains the orchestration hub. Enemy behavior, projectile management and collision resolution are the next required extractions before bosses or route hazards.
3. Submitted Atlas artwork is integrated, but route backgrounds are still generated rather than using final layered background art.
4. CrazyGames SDK lifecycle, ads and cloud data are not yet connected.
5. Browser playtesting is still required for input feel, spawn fairness, animation pivots and mobile performance.
6. The Atlas and source PNGs should not both ship in the final market ZIP; source masters remain in the repository, while the distribution ZIP should contain runtime assets only.

## Stop conditions

Development must stop and refactor when any of these occur:

- a route needs its own game scene;
- a route ID appears in runtime branching;
- a new feature is useful in only one encounter;
- scene code calls LocalStorage or a platform SDK;
- an object pool is reused without resetting tint, scale, velocity, animation and custom data;
- a route cannot be tuned through configuration alone;
- pause or modal UI introduces its own gameplay timer;
- an asset filename is referenced directly from gameplay code instead of through the manifest/catalog.
