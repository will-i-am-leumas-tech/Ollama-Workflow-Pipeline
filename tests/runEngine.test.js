import { describe, it, expect, vi } from 'vitest';
import { runEngine } from '../src/core/runEngine.js';
import fs from 'fs/promises';

describe('runEngine', () => {
  it('executes the workflow and saves output', async () => {
    const mockWorkflowName = 'generate-goal-md';
    const mockCliAnswers = { projectName: 'Test Project' };
    const mockQuestions = [
      { name: 'projectType', message: 'What type?' },
      { name: 'problemSolved', message: 'What problem?' },
      { name: 'coreFeatures', message: 'What features?' },
      { name: 'stack', message: 'What stack?' },
      { name: 'includeTests', message: 'Tests?' },
      { name: 'includeFileTree', message: 'Tree?' }
    ];
    
    const mockAskQuestionsFn = vi.fn().mockResolvedValue({
      projectType: 'CLI',
      problemSolved: 'None',
      coreFeatures: 'Everything',
      stack: 'JS',
      includeTests: 'yes',
      includeFileTree: 'yes'
    });
    
    const mockConfirmRunFn = vi.fn().mockResolvedValue(true);
    const mockOllamaAdapter = {
      runPrompt: vi.fn().mockResolvedValue('Mocked Ollama Response')
    };

    const result = await runEngine(mockWorkflowName, {
      cliAnswers: mockCliAnswers,
      askQuestionsFn: mockAskQuestionsFn,
      confirmRunFn: mockConfirmRunFn,
      ollamaAdapter: mockOllamaAdapter
    });

    expect(result).toBeDefined();
    expect(result.result).toBe('Mocked Ollama Response');
    expect(result.metadata.workflowName).toBe('generate-goal-md');
    expect(result.metadata.answers.projectName).toBe('Test Project');
    expect(mockOllamaAdapter.runPrompt).toHaveBeenCalledWith(expect.objectContaining({
      system: expect.any(String),
      options: expect.objectContaining({
        temperature: expect.any(Number)
      })
    }));
    
    // Clean up
    await fs.unlink(result.outputPath);
    await fs.unlink(`${result.outputPath}.json`);
  });
});
