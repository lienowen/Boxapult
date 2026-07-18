import type { LevelDefinition } from '../../domain/level/LevelDefinition';

export const apt001: LevelDefinition = {
  id: 'apt-001',
  district: 'apartment',
  packageType: 'standard',
  launchPoint: { x: 250, y: 640 },
  worldBounds: { x: 0, y: 0, width: 1920, height: 1080 },
  goal: {
    x: 1475,
    y: 700,
    width: 260,
    height: 170,
    maximumSettleSpeed: 1.25,
    settleDurationMs: 500,
    minimumIntegrity: 1,
  },
  objects: [
    {
      id: 'floor-main',
      kind: 'platform',
      x: 960,
      y: 940,
      width: 1920,
      height: 120,
      tint: 0x31435d,
    },
    {
      id: 'launch-deck',
      kind: 'platform',
      x: 260,
      y: 735,
      width: 420,
      height: 40,
      tint: 0x58708f,
    },
    {
      id: 'landing-deck',
      kind: 'platform',
      x: 1500,
      y: 835,
      width: 520,
      height: 40,
      tint: 0x58708f,
    },
  ],
};
