import { getIsoTimestamp } from '../utils/timestamp.js';

export const renderTemplate = (template, context = {}, fallback = '') => {
  if (typeof template !== 'string') return '';
  
  const ctx = {
    timestamp: getIsoTimestamp(),
    ...context
  };
  
  return template.replace(/\{\{\s*(.+?)\s*\}\}/g, (match, key) => {
    return ctx[key] !== undefined ? ctx[key] : fallback;
  });
};
