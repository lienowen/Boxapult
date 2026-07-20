# Cargo Renegade v0.4

A fast browser arcade game about a rogue combat courier stealing energy cores and breaking through corporate airspace.

**Steal the core. Break the blockade.**

## Fast local preview

```bash
python3 -m http.server 5173
```

Open `http://localhost:5173`.

## Vercel upload

Upload this folder as a static project. No build command is required. The output directory is the project root.

## Current content

- 3 data-driven blockade sectors
- sector unlock progression
- energy-core targets, bounty, hull, chain multiplier and 1–3 rank results
- 3 reusable corporate hunter types
- shield and rapid-fire upgrades
- title, sector selection, extraction and results screens
- scripted high-action openings for every sector
- responsive landscape presentation
- submitted runtime Atlas art with generated fallback visuals
- persistent mute and tutorial settings

## Temporary engine loading

This preview loads Phaser 3.90.0 from cdnjs. Before CrazyGames submission, vendor `phaser.min.js` locally.
