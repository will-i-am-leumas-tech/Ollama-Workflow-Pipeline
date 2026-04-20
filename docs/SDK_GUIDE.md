# Node.js SDK Guide

The `ollama-pipeline` SDK allows you to programmatically run workflows from any other Node.js application.

## Installation
You can install the SDK directly from the project directory:
```bash
npm install /path/to/ollama-pipeline
```

---

## 1. Quick Start
Use the `OllamaPipeline` object for a simple, high-level API.

```javascript
import { OllamaPipeline } from 'leumas-ollama-workflow-engine';

const result = await OllamaPipeline.run('creative/album-generator', {
  answers: { artistName: 'Neon Dreams' }
});

console.log('Final Result:', result.state);
```

---

## 2. API Options
The `run()` method accepts an options object:
- **`answers`**: (Object) Key-value pairs for the workflow questions.
- **`model`**: (String) Override the model specified in the workflow.
- **`outputDir`**: (String) Override the base directory for generated files.
- **`workflowsDir`**: (String) Path to your local workflows folder.
- **`onLog`**: (Function) Callback to capture pipeline logs.

```javascript
const result = await OllamaPipeline.run('my-workflow', {
  answers: { topic: 'AI' },
  model: 'llama3:8b',
  onLog: (type, msg) => {
    // Integrate with your app's logger
    myLogger.info(`[${type}] ${msg}`);
  }
});
```

---

## 3. Direct Access
You can also import core components for more advanced usage:

```javascript
import { runEngine, ollamaAdapter } from 'leumas-ollama-workflow-engine';

// Use the adapter directly
const response = await ollamaAdapter.runPrompt({
  model: 'llama3',
  prompt: 'Hello AI!'
});

// Run the engine with custom adapters or question handlers
const result = await runEngine('my-workflow', {
  ollamaAdapter: myCustomAdapter,
  cliAnswers: { topic: 'Advanced AI' }
});
```

---

## 4. Why use the SDK?
- **Workflow Decoupling**: Keep your logic in JSON files and your app code clean.
- **Unified Engine**: Use the same pipeline logic in your CLI, Web UI, and external apps.
- **Built-in Storage**: Let the SDK handle complex file naming and metadata storage automatically.
