import { describe, it, expect } from 'vitest';
import { buildOutputPath } from '../src/output/buildOutputPath.js';
import path from 'path';

describe('buildOutputPath', () => {
  it('slugifies filenames and preserves extension', () => {
    const dir = './outputs';
    const fileName = 'My Project Goal';
    const extension = '.md';
    const result = buildOutputPath(dir, fileName, extension);
    
    expect(result).toBe(path.resolve(dir, 'my-project-goal.md'));
  });

  it('removes extension from fileName before slugifying if it exists', () => {
    const dir = './outputs';
    const fileName = 'My Project Goal.md';
    const extension = '.md';
    const result = buildOutputPath(dir, fileName, extension);
    
    expect(result).toBe(path.resolve(dir, 'my-project-goal.md'));
  });
});
