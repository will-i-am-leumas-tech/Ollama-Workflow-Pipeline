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

Example with overrides:

```bash
node runWorkflow.js generate-goal-md --model llama3 --set projectName="My Awesome App"
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
