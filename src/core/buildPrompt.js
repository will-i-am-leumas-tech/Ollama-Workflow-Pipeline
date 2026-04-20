import { renderTemplate } from './renderTemplate.js';

export const buildPrompt = (promptSource, answers) => {
  const prompt = promptSource.prompt || promptSource;
  const sections = [];

  if (prompt.role) {
    sections.push(`ROLE:\n${renderTemplate(prompt.role, answers)}`);
  }

  if (prompt.task) {
    sections.push(`TASK:\n${renderTemplate(prompt.task, answers)}`);
  }

  if (prompt.instructions && Array.isArray(prompt.instructions)) {
    const renderedInstructions = prompt.instructions
      .map(i => `- ${renderTemplate(i, answers)}`)
      .join('\n');
    sections.push(`INSTRUCTIONS:\n${renderedInstructions}`);
  }

  if (prompt.inputTemplate) {
    const renderedInput = renderTemplate(prompt.inputTemplate, answers);
    sections.push(`USER INPUT:\n${renderedInput}`);
  }

  return sections.join('\n\n');
};
