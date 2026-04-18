export const safeJsonParse = (str, fallback = {}) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return fallback;
  }
};

export const safeJsonStringify = (obj, space = 2) => {
  try {
    return JSON.stringify(obj, null, space);
  } catch (err) {
    return '';
  }
};
