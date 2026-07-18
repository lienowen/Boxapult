import { describe, expect, it } from 'vitest';
import { apt001 } from '../src/content/levels/apt001';
import { validateLevelDefinition } from '../src/domain/level/validateLevelDefinition';

describe('validateLevelDefinition', () => {
  it('accepts the first white-box level', () => {
    expect(validateLevelDefinition(apt001)).toEqual([]);
  });
});
