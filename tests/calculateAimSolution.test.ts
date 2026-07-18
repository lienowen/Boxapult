import { describe, expect, it } from 'vitest';
import { calculateAimSolution } from '../src/domain/launch/calculateAimSolution';

const balance = {
  minimumDragPixels: 10,
  maximumDragPixels: 100,
  velocityPerDragPixel: 0.1,
};

describe('calculateAimSolution', () => {
  it('launches in the opposite direction of the drag', () => {
    const result = calculateAimSolution({ x: 100, y: 100 }, { x: 50, y: 120 }, balance);
    expect(result.velocity.x).toBeGreaterThan(0);
    expect(result.velocity.y).toBeLessThan(0);
    expect(result.valid).toBe(true);
  });

  it('clamps excessive drag distance', () => {
    const result = calculateAimSolution({ x: 0, y: 0 }, { x: -500, y: 0 }, balance);
    expect(result.velocity.x).toBeCloseTo(10);
    expect(result.strength01).toBe(1);
  });
});
