import inquirer from 'inquirer';

export const askQuestions = async (questions) => {
  const prompts = questions.map(q => ({
    type: q.type || 'input',
    name: q.name,
    message: q.message,
    validate: value => {
      if (q.required && !value) return 'This field is required';
      return true;
    }
  }));

  return await inquirer.prompt(prompts);
};
