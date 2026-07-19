export const ROUTES = Object.freeze([
  Object.freeze({
    id: 'downtown',
    order: 0,
    name: 'DOWNTOWN DASH',
    subtitle: 'Morning courier lane',
    durationSeconds: 45,
    targetParcels: 6,
    lives: 3,
    playerSpeed: 460,
    enemySpawnStartMs: 980,
    enemySpawnMinMs: 520,
    parcelSpawnMs: 4000,
    powerupSpawnMs: 15000,
    speedMultiplier: 1,
    enemyWeights: Object.freeze({ scout: 0.64, raider: 0.28, interceptor: 0.08 }),
    stars: Object.freeze({ two: 4800, three: 7600 }),
    palette: Object.freeze({ top: 0x102b4a, middle: 0x246185, bottom: 0x57a4bd, sun: 0xffd77a, celestialRadius: 62, far: 0x173653, near: 0x11273f }),
  }),
  Object.freeze({
    id: 'harbor',
    order: 1,
    name: 'HARBOR EXPRESS',
    subtitle: 'Crosswind cargo route',
    durationSeconds: 52,
    targetParcels: 8,
    lives: 3,
    playerSpeed: 485,
    enemySpawnStartMs: 850,
    enemySpawnMinMs: 440,
    parcelSpawnMs: 3600,
    powerupSpawnMs: 13500,
    speedMultiplier: 1.15,
    enemyWeights: Object.freeze({ scout: 0.46, raider: 0.37, interceptor: 0.17 }),
    stars: Object.freeze({ two: 6800, three: 9800 }),
    palette: Object.freeze({ top: 0x163b57, middle: 0x237783, bottom: 0x4fb4aa, sun: 0xffe0a0, celestialRadius: 58, far: 0x19485a, near: 0x11333e }),
  }),
  Object.freeze({
    id: 'night',
    order: 2,
    name: 'MIDNIGHT PRIORITY',
    subtitle: 'High-risk express lane',
    durationSeconds: 60,
    targetParcels: 10,
    lives: 3,
    playerSpeed: 510,
    enemySpawnStartMs: 760,
    enemySpawnMinMs: 360,
    parcelSpawnMs: 3300,
    powerupSpawnMs: 12000,
    speedMultiplier: 1.32,
    enemyWeights: Object.freeze({ scout: 0.30, raider: 0.42, interceptor: 0.28 }),
    stars: Object.freeze({ two: 9000, three: 12800 }),
    palette: Object.freeze({ top: 0x080f2c, middle: 0x15204d, bottom: 0x293d69, sun: 0xc9dcff, celestialRadius: 40, far: 0x101a39, near: 0x090f27 }),
  }),
]);

export function getRoute(routeId) {
  const route = ROUTES.find((candidate) => candidate.id === routeId);
  if (!route) throw new Error(`Unknown route: ${routeId}`);
  return route;
}

export function getNextRoute(routeId) {
  const current = getRoute(routeId);
  return ROUTES[current.order + 1] ?? null;
}
