export const parcelPatrolBalance = {
  world: {
    width: 1280,
    height: 720,
  },
  missionDurationSeconds: 60,
  player: {
    startX: 150,
    startY: 360,
    speed: 430,
    fireCooldownMs: 210,
    lives: 3,
    invulnerabilityMs: 900,
  },
  enemy: {
    firstSpawnDelayMs: 900,
    minimumSpawnDelayMs: 390,
    spawnAccelerationPerSecond: 6,
    scoutSpeedMin: 210,
    scoutSpeedMax: 285,
    raiderSpeedMin: 150,
    raiderSpeedMax: 210,
  },
  parcel: {
    spawnDelayMs: 4200,
    speed: 180,
    value: 300,
  },
  scoring: {
    scout: 100,
    raider: 220,
    comboStep: 0.15,
    maximumCombo: 4,
  },
} as const;
