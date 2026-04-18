export const resolveAnswers = (questions, cliAnswers = {}) => {
  const resolved = { ...cliAnswers };
  const missing = questions.filter(q => resolved[q.name] === undefined);
  return { resolved, missing };
};
