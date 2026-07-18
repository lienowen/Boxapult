export type RouteGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface RoutePerformance {
  readonly score: number;
  readonly deliveries: number;
  readonly completed: boolean;
}

export function calculateRouteGrade(performance: RoutePerformance): RouteGrade {
  const score = Math.max(0, performance.score);
  const deliveries = Math.max(0, performance.deliveries);

  if (!performance.completed) {
    return score >= 2500 ? 'C' : 'D';
  }

  const total = score + deliveries * 350;
  if (total >= 8500) {
    return 'S';
  }
  if (total >= 6000) {
    return 'A';
  }
  if (total >= 3800) {
    return 'B';
  }
  return 'C';
}
