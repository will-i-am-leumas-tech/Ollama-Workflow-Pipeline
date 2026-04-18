import { runEngine } from './src/core/runEngine.js';
import { parseArgs } from './src/cli/parseArgs.js';
import { askQuestions } from './src/cli/askQuestions.js';
import { confirmRun } from './src/cli/confirmRun.js';
import { ollamaAdapter } from './src/adapters/ollamaAdapter.js';
import { logger } from './src/utils/logger.js';

const main = async () => {
  const args = process.argv.slice(2);
  const parsed = parseArgs(args);

  if (!parsed.workflowName) {
    logger.error('Usage: node runWorkflow.js <workflowName> [--model <model>] [--output <dir>] [--set key=value]');
    process.exit(1);
  }

  try {
    await runEngine(parsed.workflowName, {
      cliAnswers: parsed.set,
      askQuestionsFn: askQuestions,
      confirmRunFn: confirmRun,
      ollamaAdapter: ollamaAdapter,
      outputDirOverride: parsed.output,
      modelOverride: parsed.model
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

main();
