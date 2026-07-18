# Definition of Done

## Architecture gate

- `npm run check` passes.
- No forbidden dependency is introduced.
- No level-specific branch exists in runtime code.
- New external services are behind application ports.

## First-level gate

The first level is accepted only when dragging starts near the package, mouse and touch behave equivalently, strength limits are clear, trajectory guidance is readable, physics remains consistent across common refresh rates, the goal requires settling, failure cannot hang, restart does not duplicate listeners, the game is readable at 821 x 462 and 1920 x 1080, and the production build works from a relative path.

## Performance gate

- Initial download remains far below 20 MB.
- Desktop target is 60 FPS; low-end target is at least 30 FPS.
- A level uses no more than 12 dynamic bodies.
- Restart never reloads the browser page.
- Particle, timer, and listener counts are bounded.

## Content gate

A new mechanic requires documented rules, reusable configuration, at least three planned level uses, consistent visual language, and no implicit change to existing levels.
