# Goal.md — Leumas Ollama Workflow Engine

## Objective

Build a **simple Ollama automation engine** that allows us to create and run **human-readable JSON workflow adapters**.

The system should let us define content-generation workflows like:

* generate a new `goal.md`
* generate a new library book
* generate a prompt pack
* generate a landing page outline
* generate a product spec

Each workflow should be written as a **JSON file** using mostly standard English so that new workflows can be created without needing a coding agent every time.

The engine should:

* load a workflow JSON by name
* ask the user the right questions in CLI
* merge CLI answers with optional passed props
* build the final Ollama prompt from the workflow definition
* run the selected Ollama model
* save outputs to a predictable folder on disk
* optionally save metadata, prompt, and answers used

This should be **adapter-based**, **DRY**, **modular**, and easy to extend.

---

## Core Vision

We want a reusable local pipeline where this command works:

```bash
node runWorkflow.js workflowName
```

Or:

```bash
node runWorkflow.js workflowName --model llama3 --output ./outputs
```

When run:

1. The engine loads the matching workflow JSON.
2. It reads the workflow’s question list.
3. It asks the user those questions interactively in the terminal.
4. It combines the answers with optional CLI props.
5. It builds a structured final prompt.
6. It calls Ollama.
7. It writes the result to disk.
8. It optionally also writes a `.json` metadata file containing:

   * workflow used
   * model used
   * timestamp
   * raw answers
   * final prompt
   * output path

This should feel like a **mini automation operating system for Ollama**, powered by readable JSON adapters.

---

## Product Requirements

### 1) Human-readable JSON workflows

Each workflow adapter should be easy to understand and edit by hand.

The JSON should read almost like English.

A workflow should be able to declare:

* its name
* description
* output type
* recommended model
* questions to ask
* optional defaults
* optional validation hints
* prompt-building instructions
* output formatting rules
* file naming rules
* save location rules

### 2) Interactive CLI runner

The CLI runner must:

* accept a workflow name
* find the JSON workflow file
* ask all required questions
* support optional CLI overrides
* show a preview before generation
* allow confirm/cancel
* call Ollama locally
* save result to file

### 3) Reusable prompt builder

A central prompt builder should:

* convert workflow JSON + answers into a clean LLM prompt
* support sections like role, task, constraints, style, output format, examples
* support placeholder replacement like `{{projectName}}`
* support optional sections when values exist

### 4) Ollama adapter layer

The Ollama layer should be abstracted so later we can swap providers if needed.

For now, implement Ollama first.

It should support:

* model selection
* prompt submission
* streamed or non-streamed responses
* timeout handling
* basic error handling

### 5) Output writer

The output writer should:

* create folders if missing
* write generated text to disk
* optionally write debug metadata
* support file naming templates like:

  * `{{projectName}}-goal.md`
  * `{{title}}-book.md`
  * `{{workflowName}}-{{timestamp}}.md`

### 6) Testable workflow engine

We want demo adapters and tests so Codex can scaffold this with confidence.

The generated project should include:

* real demo workflow files
* tests for loading workflows
* tests for placeholder injection
* tests for prompt generation
* tests for file output naming
* tests for CLI question parsing
* tests for adapter execution with mocked Ollama output

---

## Project Philosophy

* DRY code
* simple folder structure
* plain JSON for workflows
* no overengineering
* readable enough for fast workflow authoring
* local-first
* easy to expand later into GUI or Leumas tools

This should feel like it could later plug into:

* **Leviathan**
* **Leumas Library**
* **Imperium**
* **Leumas API**

---

## Suggested Tech Stack

* Node.js
* plain JavaScript first
* minimal dependencies
* `fs/promises` for file work
* `path`
* `readline` or `inquirer` for CLI questions
* native `fetch` or lightweight HTTP client for Ollama API
* `vitest` or `jest` for tests

Prefer **minimal dependencies**.

---

## Suggested Folder Structure

```txt
leumas-ollama-workflow-engine/
  package.json
  README.md
  runWorkflow.js
  goal.md
  workflows/
    generate-goal-md.json
    generate-library-book.json
    generate-landing-page-outline.json
    generate-product-spec.json
    generate-prompt-pack.json
  src/
    cli/
      askQuestions.js
      parseArgs.js
      confirmRun.js
    core/
      loadWorkflow.js
      validateWorkflow.js
      resolveAnswers.js
      buildPrompt.js
      renderTemplate.js
      runEngine.js
    adapters/
      ollamaAdapter.js
    output/
      ensureDir.js
      buildOutputPath.js
      writeResult.js
      writeMetadata.js
    utils/
      timestamp.js
      slugify.js
      logger.js
      safeJson.js
  tests/
    workflowLoader.test.js
    promptBuilder.test.js
    templateRenderer.test.js
    outputWriter.test.js
    runEngine.test.js
    cliFlow.test.js
  outputs/
    .gitkeep
```

---

## Workflow JSON Design

Each workflow JSON should be readable and flexible.

### Example schema shape

```json
{
  "name": "generate-goal-md",
  "description": "Generate a detailed goal.md file for a new coding project.",
  "recommendedModel": "llama3",
  "output": {
    "format": "markdown",
    "extension": ".md",
    "directory": "./outputs/goals",
    "fileNameTemplate": "{{projectName}}-goal.md"
  },
  "questions": [
    {
      "name": "projectName",
      "message": "What is the project name?",
      "required": true
    },
    {
      "name": "projectType",
      "message": "What type of project is this?",
      "required": true
    },
    {
      "name": "mainGoal",
      "message": "What should this tool do?",
      "required": true
    }
  ],
  "prompt": {
    "role": "You are a senior product architect and coding scaffold planner.",
    "task": "Generate a complete goal.md file for the described project.",
    "instructions": [
      "Write in markdown.",
      "Be clear and structured.",
      "Include core requirements, architecture, file structure, and tests.",
      "Keep it practical and implementation-ready."
    ],
    "inputTemplate": "Project Name: {{projectName}}\nProject Type: {{projectType}}\nMain Goal: {{mainGoal}}"
  }
}
```

---

## Workflow Authoring Rules

Codex should build the engine so workflow authors can write adapters using these principles:

1. `questions` should be plain English.
2. `prompt.role`, `prompt.task`, and `prompt.instructions` should be optional but supported.
3. `inputTemplate` should support placeholder replacement.
4. Missing optional fields should not crash the engine.
5. The workflow validator should give useful human-readable errors.
6. JSON files should remain clean and editable by non-experts.

---

## Required Features

### A. CLI argument support

Support examples like:

```bash
node runWorkflow.js generate-goal-md
node runWorkflow.js generate-goal-md --model llama3
node runWorkflow.js generate-goal-md --output ./my-outputs
node runWorkflow.js generate-goal-md --set projectName="Leumas Forge"
node runWorkflow.js generate-goal-md --set projectType="Node SDK"
```

Optional `--set key=value` flags should pre-fill answers and skip those prompts if already provided.

### B. Prompt preview

Before sending to Ollama, show:

* workflow name
* model
* output location
* final resolved answers
* optional preview of prompt

Then ask:

* continue?

### C. Safe file writing

Never overwrite files silently unless explicitly allowed.

Support:

* automatic suffixing if file exists
* or `--overwrite true`

### D. Metadata output

Optionally write:

```json
{
  "workflowName": "generate-goal-md",
  "model": "llama3",
  "timestamp": "2026-04-17T12:00:00.000Z",
  "answers": {
    "projectName": "Leumas Forge"
  },
  "prompt": "...",
  "outputFile": "..."
}
```

### E. Mock-friendly design

The run engine should allow mocked Ollama responses for testing.

---

## Demo Workflow Adapters To Include

We want **5 real demo workflow JSON adapters** included in the scaffold.

These are important because they also serve as test fixtures.

---

## Demo Adapter 1 — generate-goal-md.json

### Purpose

Generate a structured `goal.md` for a coding or product project.

### Questions

* What is the project name?
* What type of app or tool is this?
* What problem does it solve?
* What are the core features?
* What stack should be used?
* Should tests be included?
* Should the output include a file tree?

### Expected output traits

* markdown
* implementation-ready
* sections for objective, features, architecture, file tree, tests

### Example test answers

```json
{
  "projectName": "Leumas Forge",
  "projectType": "Node.js CLI tool",
  "problemSolved": "Generate reusable automation workflows from readable configuration",
  "coreFeatures": "workflow loading, CLI prompts, template rendering, output writing",
  "stack": "Node.js with minimal dependencies",
  "includeTests": "yes",
  "includeFileTree": "yes"
}
```

### Verification expectations

Tests should assert the generated prompt includes:

* `Leumas Forge`
* `Node.js CLI tool`
* `workflow loading`
* markdown instruction
* request for tests

---

## Demo Adapter 2 — generate-library-book.json

### Purpose

Generate a structured book or long-form educational library entry.

### Questions

* What is the book title?
* Who is the audience?
* What is the subject?
* What tone should it have?
* How many chapters?
* Should it include exercises?
* Should it be beginner, intermediate, or advanced?

### Expected output traits

* markdown or text
* chapter outline
* introduction
* chapter summaries
* optional exercises

### Example test answers

```json
{
  "title": "The Practical Builder's Guide to Local AI",
  "audience": "solo developers",
  "subject": "building local AI tools with Ollama",
  "tone": "practical and inspiring",
  "chapterCount": "8",
  "includeExercises": "yes",
  "difficulty": "beginner"
}
```

### Verification expectations

Tests should assert the final prompt includes:

* book title
* solo developers
* 8 chapters
* exercises included
* beginner tone/level

---

## Demo Adapter 3 — generate-landing-page-outline.json

### Purpose

Generate a landing page content outline for a product or startup.

### Questions

* What is the product name?
* What does it do?
* Who is it for?
* What is the main CTA?
* What tone should the landing page have?
* Should pricing be included?
* Should FAQ be included?

### Expected output traits

* markdown
* hero section
* features section
* CTA section
* optional FAQ
* optional pricing

### Example test answers

```json
{
  "productName": "Leumas Prompt Foundry",
  "productDescription": "A local workflow engine for promptable content generation",
  "targetAudience": "developers and founders",
  "mainCTA": "Start Building Workflows",
  "tone": "high-tech and persuasive",
  "includePricing": "yes",
  "includeFAQ": "yes"
}
```

### Verification expectations

Tests should assert the prompt includes:

* product name
* developers and founders
* CTA text
* pricing section requested
* FAQ requested

---

## Demo Adapter 4 — generate-product-spec.json

### Purpose

Generate a clean product specification document.

### Questions

* What is the product name?
* What is the main use case?
* Who are the users?
* What are the must-have features?
* What are the non-goals?
* What constraints exist?
* What should success look like?

### Expected output traits

* markdown
* product overview
* requirements
* user stories
* constraints
* success criteria

### Example test answers

```json
{
  "productName": "Leumas Workflow Core",
  "mainUseCase": "turn readable workflow JSON into repeatable Ollama automations",
  "users": "solo developers and technical founders",
  "mustHaveFeatures": "workflow loading, interactive questions, prompt rendering, file output",
  "nonGoals": "web frontend, cloud sync, multi-user auth",
  "constraints": "local-first, Node.js, minimal dependencies",
  "successCriteria": "user can add a new workflow JSON and run it without editing core code"
}
```

### Verification expectations

Tests should assert the prompt includes:

* non-goals
* constraints
* success criteria
* user type

---

## Demo Adapter 5 — generate-prompt-pack.json

### Purpose

Generate a pack of reusable prompts for a specific business or workflow.

### Questions

* What is the prompt pack for?
* Who will use it?
* How many prompts are needed?
* What tone should the prompts have?
* What format should each prompt follow?
* Should examples be included?

### Expected output traits

* markdown
* numbered prompts
* reusable format
* examples if requested

### Example test answers

```json
{
  "packPurpose": "startup product planning",
  "userType": "indie hackers",
  "promptCount": "12",
  "tone": "clear and strategic",
  "promptFormat": "title, use case, prompt body, expected output",
  "includeExamples": "yes"
}
```

### Verification expectations

Tests should assert prompt includes:

* 12 prompts
* indie hackers
* examples included
* requested format string

---

## Prompt Builder Rules

Codex should implement a reusable prompt-building system that composes the final prompt from these possible sections:

1. Role
2. Task
3. Constraints
4. Output format rules
5. Resolved user answers
6. Template-based context block
7. Optional examples

### Final prompt shape example

```txt
ROLE:
You are a senior product architect.

TASK:
Generate a complete goal.md file.

INSTRUCTIONS:
- Write in markdown.
- Be implementation-ready.
- Include tests.

USER INPUT:
Project Name: Leumas Forge
Project Type: Node.js CLI tool
Main Goal: Build readable workflow JSON automations
```

The prompt builder should be deterministic and testable.

---

## Template Rendering Rules

Implement placeholder rendering for strings like:

* `{{projectName}}`
* `{{workflowName}}`
* `{{timestamp}}`
* `{{title}}`

Rules:

* unknown placeholders should resolve to empty string or configurable fallback
* rendering should work in prompt text
* rendering should work in file names
* rendering should work in output paths if needed

---

## Validation Rules

Implement workflow validation with clear errors.

Examples:

* missing `name`
* missing `questions`
* invalid `questions` structure
* invalid `output.extension`
* invalid prompt object format

Validation errors should help a human quickly fix the JSON.

Example:

* `Workflow generate-goal-md is missing required field: questions`
* `Question at index 2 is missing required field: message`

---

## Ollama Integration Requirements

The Ollama adapter should:

* support model selection from workflow or CLI
* send the prompt to Ollama locally
* return plain text output
* fail gracefully if Ollama is unavailable
* expose a clean function like:

```js
runOllamaPrompt({ model, prompt })
```

This should be abstract enough that later we can add:

* OpenAI
* Anthropic
* local custom providers

without rewriting core workflow logic.

---

## CLI Experience Requirements

The CLI should feel clean and minimal.

Example flow:

```txt
> node runWorkflow.js generate-goal-md

Loaded workflow: generate-goal-md
Description: Generate a detailed goal.md file for a coding project.

? What is the project name?
> Leumas Forge

? What type of project is this?
> Node.js CLI tool

? What should this tool do?
> Let me build readable Ollama workflows from JSON

Preview:
- Workflow: generate-goal-md
- Model: llama3
- Output: ./outputs/goals/leumas-forge-goal.md

Continue? (y/n)
> y

Generating...
Saved:
./outputs/goals/leumas-forge-goal.md
```

---

## Required Tests

Codex should scaffold tests that cover at minimum:

### 1. Workflow loader tests

* loads valid JSON workflow
* throws useful error when workflow missing
* throws useful error when JSON invalid

### 2. Validation tests

* rejects workflow with missing required keys
* accepts valid workflow fixture

### 3. Template renderer tests

* replaces placeholders correctly
* handles missing values safely
* supports timestamp injection

### 4. Prompt builder tests

* builds deterministic prompt from workflow + answers
* includes role/task/instructions when present
* omits optional sections when missing

### 5. Output path tests

* builds correct file names
* slugifies when needed
* avoids silent overwrite

### 6. Engine runner tests

* executes end-to-end with mocked Ollama adapter
* saves output file
* saves metadata file when enabled

### 7. CLI flow tests

* prefilled props skip prompts
* missing props trigger prompts
* cancel stops run cleanly

---

## Acceptance Criteria

The project is complete when:

1. I can create a new readable JSON workflow file in `workflows/`.
2. I can run it with:

```bash
node runWorkflow.js <workflowName>
```

3. The CLI asks the workflow’s questions.
4. The engine builds the correct prompt.
5. Ollama is called successfully.
6. The output is saved to disk.
7. Metadata can also be saved.
8. Demo workflows are included and usable.
9. Tests pass using mocked Ollama responses.
10. The architecture is clean enough to expand later.

---

## Bonus Features If Easy

Only include these if they do not overcomplicate the MVP:

* `listWorkflows` CLI command
* workflow tags or categories
* reusable question presets
* support for multiline answers
* support for `select` / `confirm` / `input` question types
* support for outputting `.txt`, `.md`, `.json`
* `dry-run` mode that shows the final prompt without calling Ollama

---

## Non-Goals For MVP

Do **not** overbuild this into a massive framework yet.

Avoid for now:

* frontend UI
* database
* cloud sync
* user accounts
* workflow marketplace
* visual workflow graph
* advanced plugin system

This first version should be a **simple local engine that works well**.

---

## README Expectations

Codex should also generate a clean README that explains:

* what the tool is
* how to install it
* how to run Ollama first
* how to add a new workflow JSON
* how to run demo workflows
* how to pass CLI props
* how outputs are saved
* how to run tests

---

## Final Build Intent

This project should become a reusable Leumas-friendly building block:

* simple enough to use daily
* readable enough to author new workflows fast
* structured enough to trust in production-like local workflows
* modular enough to later plug into bigger Leumas systems

The implementation should prioritize:

* clarity
* speed
* maintainability
* DRY architecture
* real working demo workflows
* strong tests around the workflow engine

---

## Direct Instruction To Codex

Build this project as a working Node.js CLI application using clean modular files.

Scaffold all core files, implement the workflow engine, add the 5 demo workflow JSON adapters, and include tests that mock Ollama so the system can be verified even without a live model call.

The result should be immediately usable for creating and running local Ollama workflows from readable JSON adapters.
