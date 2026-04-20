import { loadWorkflow } from './loadWorkflow.js';
import { resolveAnswers } from './resolveAnswers.js';
import { buildPrompt } from './buildPrompt.js';
import { renderTemplate } from './renderTemplate.js';
import { buildOutputPath } from '../output/buildOutputPath.js';
import { writeResult } from '../output/writeResult.js';
import { writeMetadata } from '../output/writeMetadata.js';
import { getIsoTimestamp } from '../utils/timestamp.js';
import { logger } from '../utils/logger.js';
import { safeJsonParse } from '../utils/safeJson.js';

export const runEngine = async (workflowName, options = {}) => {
  const {
    cliAnswers = {},
    askQuestionsFn,
    confirmRunFn,
    ollamaAdapter,
    outputDirOverride,
    modelOverride,
    workflowsDir = 'workflows'
  } = options;

  logger.info(`Loading workflow: ${workflowName}`);
  const workflow = await loadWorkflow(workflowName, workflowsDir);
  
  const { resolved, missing } = resolveAnswers(workflow.questions, cliAnswers);
  let finalAnswers = { ...resolved };

  if (missing.length > 0 && askQuestionsFn) {
    const answers = await askQuestionsFn(missing);
    finalAnswers = { ...finalAnswers, ...answers };
  }

  // Handle tools (legacy support)
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
  const internalState = { ...finalAnswers };

  const executeSteps = async (steps, currentContext) => {
    for (const step of steps) {
      if (step.type === 'loop') {
        const list = currentContext[step.forEach] || [];
        if (!Array.isArray(list)) {
          logger.warn(`Loop target "${step.forEach}" is not an array. Skipping.`);
          continue;
        }
        for (let index = 0; index < list.length; index++) {
          const item = list[index];
          const loopContext = { ...currentContext, item, index };
          await executeSteps(step.steps, loopContext);
        }
      } else if (step.type === 'prompt' || !step.type) {
        // Default to prompt if type is missing (for backward compatibility)
        const prompt = buildPrompt(step.prompt || workflow, currentContext);
        const systemPrompt = step.systemPrompt || workflow.systemPrompt || '';
        const ollamaOptions = step.ollamaOptions || workflow.ollamaOptions || {};
        
        const outputConfig = step.output || workflow.output;
        const outputDirRaw = outputDirOverride || outputConfig.directory || './outputs';
        const outputDir = renderTemplate(outputDirRaw, currentContext);
        const fileName = renderTemplate(outputConfig.fileNameTemplate, currentContext);
        const outputPath = buildOutputPath(outputDir, fileName, outputConfig.extension);

        if (confirmRunFn && !step.skipConfirm) {
          const confirmed = await confirmRunFn({
            workflow: workflow.name,
            stepId: step.id,
            model,
            outputPath,
            answers: currentContext,
            prompt,
            system: systemPrompt,
            options: ollamaOptions
          });
          if (!confirmed) {
            logger.info('Step cancelled by user.');
            continue;
          }
        }

        logger.info(`Generating step: ${step.id || 'main'}...`);
        const result = await ollamaAdapter.runPrompt({ 
          model, 
          prompt, 
          system: systemPrompt, 
          options: ollamaOptions 
        });

        // Parse JSON if needed
        let finalResult = result;
        if (outputConfig.format === 'json') {
          // Extract JSON from potential Markdown blocks
          const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || result.match(/```([\s\S]*?)```/);
          const rawJson = jsonMatch ? jsonMatch[1] : result;
          finalResult = safeJsonParse(rawJson, result);
        }

        // Save to state
        if (step.id) {
          currentContext[step.id] = finalResult;
        }
        if (outputConfig.saveAs) {
          currentContext[outputConfig.saveAs] = finalResult;
        }

        // Only write to file if a fileNameTemplate is provided
        if (outputConfig.fileNameTemplate) {
          await writeResult(outputPath, typeof finalResult === 'string' ? finalResult : JSON.stringify(finalResult, null, 2));
          
          const metadata = {
            workflowName: workflow.name,
            stepId: step.id,
            model,
            timestamp: getIsoTimestamp(),
            context: currentContext,
            prompt,
            outputFile: outputPath
          };
          
          await writeMetadata(outputPath, metadata);
          logger.success(`Saved to: ${outputPath}`);
        }
      }
    }
  };

  if (workflow.steps) {
    await executeSteps(workflow.steps, internalState);
  } else {
    // Legacy support for single prompt workflows
    const legacyStep = {
      id: 'main',
      type: 'prompt',
      prompt: workflow.prompt,
      output: workflow.output,
      systemPrompt: workflow.systemPrompt,
      ollamaOptions: workflow.ollamaOptions
    };
    await executeSteps([legacyStep], internalState);
  }

  return { state: internalState };
};
