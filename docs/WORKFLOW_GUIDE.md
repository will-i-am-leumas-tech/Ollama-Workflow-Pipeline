# Workflow Builder Guide

The `ollama-pipeline` engine uses JSON files to define multi-step AI workflows. This guide covers the full schema and advanced features.

## 1. Top-Level Structure
A workflow file has three main sections:
- **`name`**: (Required) The unique identifier for the workflow.
- **`questions`**: (Required) Input variables needed from the user.
- **`steps`**: (Required) The sequence of tasks to execute.

```json
{
  "name": "my-cool-pipeline",
  "questions": [...],
  "steps": [...]
}
```

## 2. Defining Questions
Questions populate the pipeline's internal state. Each question has:
- `name`: Variable name used in templates (e.g., `{{topic}}`).
- `message`: Text shown to the user or in the HUD input.

```json
{
  "name": "projectName",
  "message": "What is the name of your project?"
}
```

## 3. Pipeline Steps
Steps are the building blocks of your workflow. There are two types: `prompt` and `loop`.

### A. Prompt Step
Executes an LLM call.
- `id`: (Optional) Save the result to state with this key.
- `prompt`: Object containing `task` and `instructions`.
- `output`: Config for saving/parsing the result.
    - `saveAs`: (Alternative to `id`) Key to save the result in state.
    - `format`: set to `"json"` to parse the LLM's response into an object.
    - `directory`: Folder to save the file.
    - `fileNameTemplate`: Name for the generated file.

```json
{
  "id": "generate-summary",
  "type": "prompt",
  "prompt": {
    "task": "Summarize: {{topic}}",
    "instructions": ["Keep it under 50 words."]
  },
  "output": {
    "directory": "./outputs/summaries",
    "fileNameTemplate": "{{slugify:topic}}-summary",
    "extension": ".md"
  }
}
```

### B. Loop Step
Iterates over a JSON array in the internal state.
- `forEach`: The key in the state containing the array.
- `steps`: Nested steps to run for each item.
- **`{{item}}`**: Inside a loop, use `item` to access the current object's data.

```json
{
  "type": "loop",
  "forEach": "myArray",
  "steps": [
    {
      "id": "item-processor",
      "type": "prompt",
      "prompt": {
        "task": "Process this: {{item.title}}"
      }
    }
  ]
}
```

## 4. Smart Templating
Use `{{ }}` to inject data into prompts or paths.
- **Variables**: `{{topic}}`, `{{stepId}}`.
- **Dot Notation**: `{{item.subProperty}}`, `{{step1.result.title}}`.
- **Helpers**: 
    - `{{slugify:myVar}}`: Converts "Hello World!" to "hello-world".
    - `{{index}}`: The current 0-based index in a loop.

## 5. Output Management
The engine automatically handles file writing.
- **Directory**: Paths are relative to the project root.
- **Extension**: `.md` (default), `.json`, `.txt`, etc.
- **Metadata**: Every file created gets a `.json` companion file with the full run context (prompt, model, timestamp).
