import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOLS_DIR = path.resolve(__dirname, '../tools');

export const executeTool = async (toolName, params, context) => {
  try {
    // Dynamic import of the tool module
    // We use a file path to ensure it works in various environments
    const toolModule = await import(path.join(TOOLS_DIR, `${toolName}.js`));
    
    if (typeof toolModule.run !== 'function') {
      throw new Error(`Tool "${toolName}" does not export a "run" function.`);
    }

    return await toolModule.run(params, context);
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(`Tool "${toolName}" not found in ${TOOLS_DIR}`);
    }
    throw error;
  }
};
