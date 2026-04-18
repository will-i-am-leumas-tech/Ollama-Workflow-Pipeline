import { loadWorkflow } from './loadWorkflow.js';
import { resolveAnswers } from './resolveAnswers.js';
import { buildPrompt } from './buildPrompt.js';
import { renderTemplate } from './renderTemplate.js';
import { buildOutputPath } from '../output/buildOutputPath.js';
import { writeResult } from '../output/writeResult.js';
import { writeMetadata } from '../output/writeMetadata.js';
import { getIsoTimestamp } from '../utils/timestamp.js';
import { logger } from '../utils/logger.js';

export const runEngine = async (workflowName, options = {}) => {
  const {
    cliAnswers = {},
    askQuestionsFn,
    confirmRunFn,
    ollamaAdapter,
    outputDirOverride,
    modelOverride
  } = options;

  logger.info(`Loading workflow: ${workflowName}`);
  const workflow = await loadWorkflow(workflowName);
  
  const { resolved, missing } = resolveAnswers(workflow.questions, cliAnswers);
  let finalAnswers = { ...resolved };

  if (missing.length > 0 && askQuestionsFn) {
    const answers = await askQuestionsFn(missing);
    finalAnswers = { ...finalAnswers, ...answers };
  }

  // Handle tools
  if (workflow.tools && Array.isArray(workflow.tools)) {
    for (const tool of workflow.tools) {
      if (tool.type === 'research') {
        const topic = renderTemplate(tool.topicTemplate, finalAnswers);
        logger.info(`Running research tool for topic: "${topic}"...`);
        try {
          const { runResearch } = await import('ollama-deep-researcher');
          const researchResult = await runResearch(topic, tool.config || {});
          finalAnswers.researchResult = researchResult;
          logger.success('Research completed.');
        } catch (error) {
          logger.error(`Research tool failed: ${error.message}`);
          finalAnswers.researchResult = `Research failed: ${error.message}`;
        }
      }
    }
  }

  const model = modelOverride || workflow.recommendedModel || 'llama3';
  const prompt = buildPrompt(workflow, finalAnswers);
  const systemPrompt = workflow.systemPrompt || '';
  const ollamaOptions = workflow.ollamaOptions || {};
  
  const outputDir = outputDirOverride || workflow.output.directory || './outputs';
  const fileName = renderTemplate(workflow.output.fileNameTemplate, finalAnswers);
  const outputPath = buildOutputPath(outputDir, fileName, workflow.output.extension);

  if (confirmRunFn) {
    const confirmed = await confirmRunFn({
      workflow: workflow.name,
      model,
      outputPath,
      answers: finalAnswers,
      prompt,
      system: systemPrompt,
      options: ollamaOptions
    });
    if (!confirmed) {
      logger.info('Run cancelled by user.');
      return;
    }
  }

  logger.info('Generating...');
  const result = await ollamaAdapter.runPrompt({ 
    model, 
    prompt, 
    system: systemPrompt, 
    options: ollamaOptions 
  });
  
  await writeResult(outputPath, result);
  
  const metadata = {
    workflowName: workflow.name,
    model,
    timestamp: getIsoTimestamp(),
    answers: finalAnswers,
    prompt,
    outputFile: outputPath
  };
  
  await writeMetadata(outputPath, metadata);
  
  logger.success(`Saved to: ${outputPath}`);
  return { outputPath, result, metadata };
};
