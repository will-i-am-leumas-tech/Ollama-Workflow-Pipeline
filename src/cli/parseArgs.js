export const parseArgs = (args) => {
  const result = {
    workflowName: null,
    model: null,
    output: null,
    set: {},
    yes: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--yes' || arg === '-y') {
      result.yes = true;
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (key === 'model') {
        result.model = args[++i];
      } else if (key === 'output') {
        result.output = args[++i];
      } else if (key === 'set') {
        const setVal = args[++i];
        if (setVal && setVal.includes('=')) {
          const [k, v] = setVal.split('=');
          result.set[k] = v;
        }
      }
    } else if (!result.workflowName) {
      result.workflowName = arg;
    }
  }

  return result;
};
