import { describe, it, expect } from 'vitest';
import { loadWorkflow } from '../src/core/loadWorkflow.js';

describe('loadWorkflow', () => {
  it('loads a valid workflow by name', async () => {
    const workflow = await loadWorkflow('generate-goal-md');
    expect(workflow.name).toBe('generate-goal-md');
    expect(workflow.questions).toBeInstanceOf(Array);
    expect(workflow.prompt).toBeDefined();
  });

  it('throws error for missing workflow', async () => {
    await expect(loadWorkflow('missing-workflow')).rejects.toThrow('Workflow "missing-workflow" not found');
  });

  // Since we don't have an invalid json file on disk, we can't test it directly unless we create one.
  // But our loader also uses validateWorkflow which we can test separately.
});
