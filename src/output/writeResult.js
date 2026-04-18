import fs from 'fs/promises';
import path from 'path';
import { ensureDir } from './ensureDir.js';

export const writeResult = async (filePath, result) => {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, result, 'utf8');
};
