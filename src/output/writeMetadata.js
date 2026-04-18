import fs from 'fs/promises';
import path from 'path';
import { ensureDir } from './ensureDir.js';
import { safeJsonStringify } from '../utils/safeJson.js';

export const writeMetadata = async (resultFilePath, metadata) => {
  const metadataPath = `${resultFilePath}.json`;
  await ensureDir(path.dirname(metadataPath));
  await fs.writeFile(metadataPath, safeJsonStringify(metadata), 'utf8');
};
