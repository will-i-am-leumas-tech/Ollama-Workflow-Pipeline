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
      finalKey = key.slice(8).trim();
    }

    // Support for simple arithmetic (e.g., {{index + 1}})
    if (finalKey.includes('+') || finalKey.includes('-')) {
      const matchExpr = finalKey.match(/([a-zA-Z0-9_\.]+)\s*([\+\-])\s*(\d+)/);
      if (matchExpr) {
        const [_, varName, op, amount] = matchExpr;
        const baseValue = varName.split('.').reduce((o, i) => (o && o[i] !== undefined ? o[i] : undefined), ctx);
        if (typeof baseValue === 'number' || !isNaN(baseValue)) {
          const numBase = Number(baseValue);
          const numAmt = Number(amount);
          const calculated = op === '+' ? numBase + numAmt : numBase - numAmt;
          return applySlugify ? slugifyString(String(calculated)) : calculated;
        }
      }
    }

    // Support dot notation for nested objects (e.g., item.title)
    const value = finalKey.split('.').reduce((o, i) => (o && o[i] !== undefined ? o[i] : undefined), ctx);
    
    if (value === undefined) return fallback;
    
    return applySlugify ? slugifyString(String(value)) : value;
  });
};
