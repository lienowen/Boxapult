import type { Vector2 } from '../launch/Vector2';

export type PackageType = 'standard' | 'fragile' | 'heavy';
export type LevelObjectKind = 'platform' | 'wall' | 'crate';

export interface RectangleBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface GoalDefinition extends RectangleBounds {
  readonly maximumSettleSpeed: number;
  readonly settleDurationMs: number;
  readonly minimumIntegrity: number;
}

export interface LevelObjectDefinition extends RectangleBounds {
  readonly id: string;
  readonly kind: LevelObjectKind;
  readonly angleDegrees?: number;
  readonly tint?: number;
}

export interface LevelDefinition {
  readonly id: string;
  readonly district: 'apartment' | 'office' | 'warehouse';
  readonly packageType: PackageType;
  readonly launchPoint: Vector2;
  readonly worldBounds: RectangleBounds;
  readonly goal: GoalDefinition;
  readonly objects: readonly LevelObjectDefinition[];
}
