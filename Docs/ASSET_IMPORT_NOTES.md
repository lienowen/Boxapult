# Parcel Patrol Asset Import Notes

This ZIP is arranged relative to the repository root. Extract it directly into the Boxapult / Parcel Patrol project root.

It contains:

- `assets/source/`: individually cut transparent PNG masters plus processed source sheets.
- `assets/runtime/gameplay-atlas.png` and `.json`: Phaser-ready gameplay atlas.
- `assets/runtime/ui-atlas.png` and `.json`: Phaser-ready UI atlas.
- `src/config/assetManifest.js`: stable atlas keys and frame names.

The package may overwrite the existing `src/config/assetManifest.js`; that is intentional.

Recommended Phaser preload:

```js
this.load.atlas(
  ASSET_KEYS.gameplayAtlas.key,
  ASSET_KEYS.gameplayAtlas.textureURL,
  ASSET_KEYS.gameplayAtlas.atlasURL,
);
this.load.atlas(
  ASSET_KEYS.uiAtlas.key,
  ASSET_KEYS.uiAtlas.textureURL,
  ASSET_KEYS.uiAtlas.atlasURL,
);
```

The generated art was cut to the project source dimensions and packed without changing gameplay collision geometry.
