# Parcel Patrol v0.3

## Fast local preview

```bash
python3 -m http.server 5173
```

Open `http://localhost:5173`.

## Vercel upload

Upload this folder as a static project. No build command is required. The output directory is the project root.

## Current content

- 3 data-driven routes
- route unlock progression
- route targets, score, lives, combo and 1–3 star ratings
- 3 reusable enemy types
- shield and rapid-fire power-ups
- title, route selection, mission and results screens
- responsive landscape presentation
- code-generated original graphics and sound effects

## Temporary engine loading

This preview loads Phaser 3.90.0 from cdnjs. Before CrazyGames submission, vendor `phaser.min.js` locally and remove the placeholder integrity attribute from `index.html`.
