import { runEngine } from './core/runEngine.js';
import { loadWorkflow } from './core/loadWorkflow.js';
import { ollamaAdapter } from './adapters/ollamaAdapter.js';
import { logger } from './utils/logger.js';

/**
 * Ollama Pipeline SDK
 * 
 * This SDK allows you to programmatically run Ollama workflows from any Node.js application.
 */
export const OllamaPipeline = {
  /**
   * Run a workflow by name or path
   * @param {string} workflowName - Name of the workflow file (without .json)
   * @param {Object} options - Configuration and answers
   * @param {Object} options.answers - Key-value pairs for workflow questions
   * @param {string} options.model - Override the Ollama model
   * @param {string} options.outputDir - Override the output directory
   * @param {string} options.workflowsDir - Custom directory to look for workflows
   * @param {Function} options.onLog - Callback for capturing logs
   */
  async run(workflowName, options = {}) {
    const { 
      answers = {}, 
      model, 
      outputDir, 
      workflowsDir,
      onLog 
    } = options;

    // Capture logs if callback provided
    const originalInfo = console.info;
    const originalLog = console.log;
    const originalError = console.error;

    if (onLog) {
      console.info = (...args) => onLog('info', args.join(' '));
      console.log = (...args) => onLog('log', args.join(' '));
      console.error = (...args) => onLog('error', args.join(' '));
    }

    try {
      const result = await runEngine(workflowName, {
        cliAnswers: answers,
        ollamaAdapter: ollamaAdapter,
        modelOverride: model,
        outputDirOverride: outputDir,
        workflowsDir: workflowsDir // Passing to engine
      });
      return result;
    } finally {
      // Restore logs
      if (onLog) {
        console.info = originalInfo;
        console.log = originalLog;
        console.error = originalError;
      }
    }
  },

  /**
   * Load and validate a workflow JSON
   */
  async getWorkflow(name, workflowsDir) {
    return loadWorkflow(name, workflowsDir);
  },

  /**
   * Direct access to the Ollama adapter
   */
  adapter: ollamaAdapter
};

export { runEngine, loadWorkflow, ollamaAdapter, logger };
