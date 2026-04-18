import inquirer from 'inquirer';

export const confirmRun = async ({ workflow, model, outputPath, answers, prompt, system, options }) => {
  console.log('\n--- Preview ---');
  console.log(`Workflow: ${workflow}`);
  console.log(`Model:    ${model}`);
  console.log(`Output:   ${outputPath}`);
  
  if (system) {
    console.log(`System:   ${system.slice(0, 100)}${system.length > 100 ? '...' : ''}`);
  }
  
  if (options && Object.keys(options).length > 0) {
    console.log(`Options:  ${JSON.stringify(options)}`);
  }

  console.log('Answers:');
  Object.entries(answers).forEach(([key, val]) => {
    console.log(`  ${key}: ${val}`);
  });
  console.log('----------------\n');

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Continue?',
      default: true
    }
  ]);

  return confirmed;
};
