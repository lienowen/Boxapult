import type { LevelDefinition } from '../../domain/level/LevelDefinition';
import { validateLevelDefinition } from '../../domain/level/validateLevelDefinition';
import { apt001 } from './apt001';

const orderedLevels = [apt001] as const;
const levelsById = new Map<string, LevelDefinition>(orderedLevels.map((level) => [level.id, level]));

for (const level of orderedLevels) {
  const errors = validateLevelDefinition(level);
  if (errors.length > 0) {
    throw new Error(`Invalid level '${level.id}':\n${errors.join('\n')}`);
  }
}

export const firstLevelId = orderedLevels[0].id;

export function getLevel(levelId: string): LevelDefinition {
  const level = levelsById.get(levelId);
  if (!level) {
    throw new Error(`Unknown level '${levelId}'.`);
  }
  return level;
}
