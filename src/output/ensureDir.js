import fs from 'fs/promises';
import path from 'path';

export const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};
