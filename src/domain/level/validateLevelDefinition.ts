import type { LevelDefinition } from './LevelDefinition';

export function validateLevelDefinition(level: LevelDefinition): readonly string[] {
  const errors: string[] = [];

  if (!/^[a-z]+-\d{3}$/.test(level.id)) {
    errors.push(`Level id '${level.id}' must match '<district>-<number>'.`);
  }
  if (level.worldBounds.width <= 0 || level.worldBounds.height <= 0) {
    errors.push('World bounds must have positive width and height.');
  }
  if (level.goal.width <= 0 || level.goal.height <= 0) {
    errors.push('Goal must have positive width and height.');
  }
  if (level.goal.settleDurationMs < 0 || level.goal.maximumSettleSpeed < 0) {
    errors.push('Goal timing and settle speed cannot be negative.');
  }

  const ids = new Set<string>();
  for (const object of level.objects) {
    if (!object.id.trim()) {
      errors.push('Every level object requires a non-empty id.');
    }
    if (ids.has(object.id)) {
      errors.push(`Duplicate level object id '${object.id}'.`);
    }
    ids.add(object.id);
    if (object.width <= 0 || object.height <= 0) {
      errors.push(`Level object '${object.id}' must have positive dimensions.`);
    }
  }

  return errors;
}
