import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../src/core/buildPrompt.js';

describe('buildPrompt', () => {
  const mockWorkflow = {
    name: 'test-workflow',
    prompt: {
      role: 'Test Role',
      task: 'Test Task',
      instructions: ['Inst 1', 'Inst 2'],
      inputTemplate: 'Input: {{val}}'
    }
  };

  it('builds a complete prompt from workflow and answers', () => {
    const answers = { val: 'HelloWorld' };
    const prompt = buildPrompt(mockWorkflow, answers);
    
    expect(prompt).toContain('ROLE:\nTest Role');
    expect(prompt).toContain('TASK:\nTest Task');
    expect(prompt).toContain('INSTRUCTIONS:\n- Inst 1\n- Inst 2');
    expect(prompt).toContain('USER INPUT:\nInput: HelloWorld');
  });

  it('omits optional role/instructions when missing', () => {
    const minimalWorkflow = {
      prompt: {
        task: 'Just task',
        inputTemplate: 'Just input'
      }
    };
    const prompt = buildPrompt(minimalWorkflow, {});
    
    expect(prompt).not.toContain('ROLE:');
    expect(prompt).not.toContain('INSTRUCTIONS:');
    expect(prompt).toContain('TASK:\nJust task');
    expect(prompt).toContain('USER INPUT:\nJust input');
  });
});
