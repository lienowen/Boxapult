# Content and Asset Pipeline

## Coordinate system

- Logical canvas: 1920 x 1080.
- Camera: fixed side view.
- Level coordinates use pixels in this logical canvas.
- Phaser scales the canvas with `FIT` and centers it.
- Level geometry uses center-positioned rectangles.

## Level data

Every level is a `LevelDefinition` containing a unique ID, district, package type, launch point, world bounds, goal rules, and reusable object placements. Scripts, callbacks, SDK references, and loading logic are forbidden in level data.

## Asset rules

- Work at 2x intended display resolution.
- Use transparent PNG or WebP for sprites.
- Keep texture atlases at or below 2048 x 2048.
- Trim transparent padding to 2-8 pixels.
- Do not bake text, numbers, locks, or UI into scene art.
- Use one fixed side-view perspective.
- Visible contact edges must match collider contact edges.
- Ground props use bottom-center pivots; packages use center pivots.
- Build environments from reusable modules; do not paint one full image per level.

## Collision ownership

Art never supplies automatic polygon collision shapes. Collision dimensions are explicit data using simple rectangles, circles, or small compound shapes.

## Naming

```text
package-standard.png
obstacle-glass-wide.png
prop-office-chair-a.png
fx-impact-small.png
ui-icon-integrity.png
```

Final assets begin only after five white-box levels pass playtesting. The first art milestone is a three-level visual slice, not a complete asset batch.
