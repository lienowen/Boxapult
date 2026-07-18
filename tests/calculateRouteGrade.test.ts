import { describe, expect, it } from 'vitest';
import { calculateRouteGrade } from '../src/domain/parcelPatrol/calculateRouteGrade';

describe('calculateRouteGrade', () => {
  it('awards S for a strong completed route', () => {
    expect(calculateRouteGrade({ score: 7100, deliveries: 4, completed: true })).toBe('S');
  });

  it('awards A and B at their completed-route thresholds', () => {
    expect(calculateRouteGrade({ score: 4600, deliveries: 4, completed: true })).toBe('A');
    expect(calculateRouteGrade({ score: 3100, deliveries: 2, completed: true })).toBe('B');
  });

  it('does not award a high grade when the drone is destroyed', () => {
    expect(calculateRouteGrade({ score: 9000, deliveries: 12, completed: false })).toBe('C');
    expect(calculateRouteGrade({ score: 1200, deliveries: 1, completed: false })).toBe('D');
  });

  it('normalizes negative values', () => {
    expect(calculateRouteGrade({ score: -100, deliveries: -2, completed: true })).toBe('C');
  });
});
