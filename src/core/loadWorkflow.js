import fs from 'fs/promises';
import path from 'path';
import { validateWorkflow } from './validateWorkflow.js';

const findFile = async (dir, fileName) => {
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      const found = await findFile(path.join(dir, file.name), fileName);
      if (found) return found;
    } else if (file.name === fileName) {
      return path.join(dir, file.name);
    }
  }
  return null;
};

export const loadWorkflow = async (workflowName) => {
  // Try direct path first (e.g. "dev/generate-goal-md")
  let workflowPath = path.resolve('workflows', `${workflowName}.json`);
  
  try {
    const content = await fs.readFile(workflowPath, 'utf8');
    const workflow = JSON.parse(content);
    const { valid, errors } = validateWorkflow(workflow);
    if (!valid) throw new Error(`Invalid workflow "${workflowName}":\n${errors.join('\n')}`);
    return workflow;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Fallback: search all subdirectories for just the fileName
      const baseFileName = path.basename(workflowName) + '.json';
      const foundPath = await findFile(path.resolve('workflows'), baseFileName);
      if (foundPath) {
        const content = await fs.readFile(foundPath, 'utf8');
        const workflow = JSON.parse(content);
        const { valid, errors } = validateWorkflow(workflow);
        if (!valid) throw new Error(`Invalid workflow "${workflowName}":\n${errors.join('\n')}`);
        return workflow;
      }
      throw new Error(`Workflow "${workflowName}" not found in "workflows" directory.`);
    }
    throw error;
  }
};
