# Boxapult

Architecture-first 2D physics delivery game for CrazyGames.

## Technology

- Phaser 3.90
- TypeScript 7 in strict mode
- Vite 8
- Matter Physics at a fixed 60 Hz step
- Vitest domain tests

## Commands

```bash
npm install
npm run dev
npm run check
npm run build
```

## Current playable slice

The repository contains a white-box first level:

1. Drag the package backward.
2. Release to launch it.
3. Land and settle inside the delivery zone.
4. Click or press `R` to retry.

No production art, ads, progression, or extra mechanics should be added before this slice passes the acceptance gates in `Docs/DEFINITION_OF_DONE.md`.

## Architecture

Read these before adding code or content:

- `Docs/ARCHITECTURE.md`
- `Docs/GAME_DESIGN.md`
- `Docs/CONTENT_PIPELINE.md`
- `Docs/DEFINITION_OF_DONE.md`
