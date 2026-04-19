export const validateWorkflow = (workflow) => {
  const errors = [];

  if (!workflow.name) errors.push('Missing required field: name');
  if (!workflow.questions || !Array.isArray(workflow.questions)) {
    errors.push('Missing or invalid field: questions (must be an array)');
  } else {
    workflow.questions.forEach((q, idx) => {
      if (!q.name) errors.push(`Question at index ${idx} is missing required field: name`);
      if (!q.message) errors.push(`Question at index ${idx} is missing required field: message`);
    });
  }

  if (workflow.steps) {
    if (!Array.isArray(workflow.steps)) {
      errors.push('Field "steps" must be an array');
    } else {
      workflow.steps.forEach((step, idx) => {
        if (!step.id && step.type !== 'loop') errors.push(`Step at index ${idx} is missing required field: id`);
        if (step.type === 'loop') {
          if (!step.forEach) errors.push(`Loop step at index ${idx} is missing required field: forEach`);
          if (!step.steps || !Array.isArray(step.steps)) errors.push(`Loop step at index ${idx} is missing or invalid field: steps`);
        } else if (step.type === 'prompt' || !step.type) {
          if (!step.prompt && !workflow.prompt) errors.push(`Prompt step at index ${idx} is missing required field: prompt`);
        }
      });
    }
  } else if (!workflow.prompt) {
    errors.push('Missing required field: prompt or steps');
  } else {
    if (!workflow.prompt.task) errors.push('Missing required field in prompt: task');
    if (!workflow.prompt.inputTemplate) errors.push('Missing required field in prompt: inputTemplate');
  }

  if (workflow.tools && !Array.isArray(workflow.tools)) {
    errors.push('Field "tools" must be an array');
  } else if (workflow.tools) {
    workflow.tools.forEach((tool, idx) => {
      if (!tool.type) errors.push(`Tool at index ${idx} is missing required field: type`);
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
