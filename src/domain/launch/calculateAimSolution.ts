import type { Vector2 } from './Vector2';

export interface LaunchBalance {
  readonly minimumDragPixels: number;
  readonly maximumDragPixels: number;
  readonly velocityPerDragPixel: number;
}

export interface AimSolution {
  readonly origin: Vector2;
  readonly packagePosition: Vector2;
  readonly velocity: Vector2;
  readonly strength01: number;
  readonly valid: boolean;
}

export function calculateAimSolution(
  origin: Vector2,
  pointer: Vector2,
  balance: LaunchBalance,
): AimSolution {
  const rawX = origin.x - pointer.x;
  const rawY = origin.y - pointer.y;
  const rawLength = Math.hypot(rawX, rawY);
  const clampedLength = Math.min(rawLength, balance.maximumDragPixels);
  const ratio = rawLength > 0 ? clampedLength / rawLength : 0;
  const dragX = rawX * ratio;
  const dragY = rawY * ratio;

  return {
    origin,
    packagePosition: { x: origin.x - dragX, y: origin.y - dragY },
    velocity: {
      x: dragX * balance.velocityPerDragPixel,
      y: dragY * balance.velocityPerDragPixel,
    },
    strength01: clampedLength / balance.maximumDragPixels,
    valid: clampedLength >= balance.minimumDragPixels,
  };
}
