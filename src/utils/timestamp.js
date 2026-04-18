export const getTimestamp = () => {
  return new Date().toISOString().replace(/[:.]/g, '-');
};

export const getIsoTimestamp = () => {
  return new Date().toISOString();
};
