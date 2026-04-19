import { renderTemplate } from './renderTemplate.js';

export const buildPrompt = (promptSource, answers) => {
  const prompt = promptSource.prompt || promptSource;
  const sections = [];

  if (prompt.role) {
    sections.push(`ROLE:\n${prompt.role}`);
  }

  if (prompt.task) {
    sections.push(`TASK:\n${prompt.task}`);
  }

  if (prompt.instructions && Array.isArray(prompt.instructions)) {
    sections.push(`INSTRUCTIONS:\n${prompt.instructions.map(i => `- ${i}`).join('\n')}`);
  }

  if (prompt.inputTemplate) {
    const renderedInput = renderTemplate(prompt.inputTemplate, answers);
    sections.push(`USER INPUT:\n${renderedInput}`);
  }

  return sections.join('\n\n');
};
