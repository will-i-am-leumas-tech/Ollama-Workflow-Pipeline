import { describe, it, expect } from 'vitest';
import { validateWorkflow } from '../src/core/validateWorkflow.js';

describe('validateWorkflow', () => {
  it('accepts valid workflow', () => {
    const workflow = {
      name: 'test',
      questions: [{ name: 'q1', message: 'm1' }],
      prompt: { task: 't1', inputTemplate: 'i1' }
    };
    const { valid, errors } = validateWorkflow(workflow);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('rejects workflow with missing name', () => {
    const workflow = {
      questions: [{ name: 'q1', message: 'm1' }],
      prompt: { task: 't1', inputTemplate: 'i1' }
    };
    const { valid, errors } = validateWorkflow(workflow);
    expect(valid).toBe(false);
    expect(errors).toContain('Missing required field: name');
  });

  it('rejects questions with missing name or message', () => {
    const workflow = {
      name: 'test',
      questions: [{ message: 'm1' }, { name: 'q2' }],
      prompt: { task: 't1', inputTemplate: 'i1' }
    };
    const { valid, errors } = validateWorkflow(workflow);
    expect(valid).toBe(false);
    expect(errors).toContain('Question at index 0 is missing required field: name');
    expect(errors).toContain('Question at index 1 is missing required field: message');
  });

  it('rejects prompt with missing task or inputTemplate', () => {
    const workflow = {
      name: 'test',
      questions: [{ name: 'q1', message: 'm1' }],
      prompt: { }
    };
    const { valid, errors } = validateWorkflow(workflow);
    expect(valid).toBe(false);
    expect(errors).toContain('Missing required field in prompt: task');
    expect(errors).toContain('Missing required field in prompt: inputTemplate');
  });
});
