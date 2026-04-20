# Leumas Ollama Workflow Engine

A simple Ollama automation engine that allows you to create and run human-readable JSON workflow adapters.

## Features

- **Human-readable JSON workflows**: Define your workflows in plain JSON.
- **Interactive CLI runner**: Asks the right questions based on the workflow definition.
- **Reusable prompt builder**: Composes structured prompts from roles, tasks, instructions, and user input.
- **Ollama integration**: Connects to your local Ollama instance.
- **Metadata output**: Saves detailed run information alongside the generated content.
- **Modular architecture**: Easy to extend with new adapters or providers.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Ollama](https://ollama.com/) installed and running locally.

### Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

### Running Workflows

To run a workflow, use the `runWorkflow.js` script:

```bash
node runWorkflow.js <workflowName>
```

Example:

```bash
node runWorkflow.js generate-goal-md
```

#### CLI Options

- `--model <modelName>`: Override the recommended model (e.g., `--model llama3`).
- `--output <dirPath>`: Override the default output directory.
- `--set <key>=<value>`: Pre-fill an answer to skip its interactive prompt.
- `--yes` or `-y`: Skip the confirmation preview (useful for automated runs).

Example with overrides:

```bash
node runWorkflow.js generate-goal-md --model qwen2.5:7b --set projectName="My App" --yes
```

## Advanced Multi-Step Workflows

Workflows can now perform multiple sequential prompts, parse JSON, and loop over lists to generate multiple files.

### Workflow Structure

Instead of a single `prompt` and `output`, you can use a `steps` array:

- **Prompt Steps**: Run a prompt and optionally save the output to a file or internal state.
- **Loop Steps**: Iterate over a list (e.g., a JSON array from a previous step) and run nested steps for each item.

### Key Features

- **Internal State**: Each step can save its result using `id` or `output.saveAs`.
- **JSON Parsing**: Set `output.format: "json"` to automatically parse LLM responses into objects for looping or data extraction.
- **Dot Notation**: Access nested data in templates like `{{item.title}}` or `{{stepId.someField}}`.
- **Template Helpers**: Use `{{slugify:variableName}}` to create clean file and folder names.

### Example: Album Generator

A workflow that plans an album and then writes lyrics for every song:

```json
{
  "name": "album-generator",
  "steps": [
    {
      "id": "planner",
      "type": "prompt",
      "prompt": {
        "task": "Plan an album with {{songCount}} songs. Return a JSON array of objects with 'title' and 'mood'.",
        "instructions": ["Return ONLY valid JSON."]
      },
      "output": { "saveAs": "albumPlan", "format": "json" }
    },
    {
      "type": "loop",
      "forEach": "albumPlan",
      "steps": [
        {
          "id": "lyrics",
          "type": "prompt",
          "prompt": {
            "task": "Write lyrics for: {{item.title}}",
            "instructions": ["Mood: {{item.mood}}"]
          },
          "output": {
            "directory": "./outputs/albums/{{slugify:albumTitle}}",
            "fileNameTemplate": "{{index}}-{{slugify:item.title}}",
            "extension": ".md"
          }
        }
      ]
    }
  ]
}
```

## Adding New Workflows

Create a new `.json` file in the `workflows/` directory. Follow the structure of existing workflows like `generate-goal-md.json`.

Required fields:
- `name`: Unique identifier for the workflow.
- `questions`: Array of question objects (`name`, `message`, `required`).
- `prompt`: Object defining `role`, `task`, `instructions`, and `inputTemplate`.
- `output`: Object defining `directory`, `extension`, and `fileNameTemplate`.

## Included Demo Workflows

1. `generate-goal-md`: Create a structured `goal.md` for a new project.
2. `generate-library-book`: Generate a structured book or educational entry.
3. `generate-landing-page-outline`: Generate a landing page content outline.
4. `generate-product-spec`: Generate a clean product specification document.
5. `generate-prompt-pack`: Generate a pack of reusable prompts.

## Development and Testing

Run tests using Vitest:

```bash
npm test
```

Tests use mocked Ollama responses, so you can verify the engine without a running model.

## Folder Structure

- `workflows/`: JSON workflow adapters.
- `src/core/`: Core engine logic.
- `src/cli/`: CLI interaction components.
- `src/adapters/`: Ollama API adapter.
- `src/output/`: File writing and path building.
- `src/utils/`: General utilities.
- `outputs/`: Default directory for generated content.
- `tests/`: Test suite.
