import path from 'path';
import { slugifyString } from '../utils/slugify.js';

export const buildOutputPath = (directory, fileName, extension) => {
  const baseName = fileName.replace(extension, '');
  const slugifiedName = slugifyString(baseName);
  const finalFileName = `${slugifiedName}${extension}`;
  return path.resolve(directory, finalFileName);
};
