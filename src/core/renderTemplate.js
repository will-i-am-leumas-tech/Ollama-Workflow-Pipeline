import { getIsoTimestamp } from '../utils/timestamp.js';
import { slugifyString } from '../utils/slugify.js';

export const renderTemplate = (template, context = {}, fallback = '') => {
  if (typeof template !== 'string') return '';
  
  const ctx = {
    timestamp: getIsoTimestamp(),
    ...context
  };
  
  return template.replace(/\{\{\s*(.+?)\s*\}\}/g, (match, key) => {
    let finalKey = key;
    let applySlugify = false;

    if (key.startsWith('slugify:')) {
      applySlugify = true;
      finalKey = key.slice(8);
    }

    // Support dot notation for nested objects (e.g., item.title)
    const value = finalKey.split('.').reduce((o, i) => (o && o[i] !== undefined ? o[i] : undefined), ctx);
    
    if (value === undefined) return fallback;
    
    return applySlugify ? slugifyString(String(value)) : value;
  });
};
