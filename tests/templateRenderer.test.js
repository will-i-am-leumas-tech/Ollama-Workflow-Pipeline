import { describe, it, expect } from 'vitest';
import { renderTemplate } from '../src/core/renderTemplate.js';

describe('renderTemplate', () => {
  it('replaces placeholders with context values', () => {
    const template = 'Hello {{name}}!';
    const context = { name: 'World' };
    expect(renderTemplate(template, context)).toBe('Hello World!');
  });

  it('uses fallback for missing values', () => {
    const template = 'Hello {{name}}!';
    const context = {};
    expect(renderTemplate(template, context, 'Stranger')).toBe('Hello Stranger!');
  });

  it('handles multiple placeholders', () => {
    const template = '{{greeting}} {{name}}!';
    const context = { greeting: 'Hi', name: 'Leumas' };
    expect(renderTemplate(template, context)).toBe('Hi Leumas!');
  });

  it('injects timestamp by default', () => {
    const template = 'Current time: {{timestamp}}';
    const result = renderTemplate(template, {});
    expect(result).toMatch(/Current time: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/);
  });
});
