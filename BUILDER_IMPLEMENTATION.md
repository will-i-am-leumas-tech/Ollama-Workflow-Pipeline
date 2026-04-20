# Workflow Builder HUD Implementation Plan

This document outlines the architecture and file structures for a minimalist, HUD-like web interface to manage and build `ollama-pipeline` workflows.

## 1. Directory Structure
```text
server/
├── server.js             # Main Express application
├── routes/
│   └── workflows.js      # CRUD API for workflow JSON files
└── public/
    ├── index.html        # Dashboard / Workflow Index
    ├── builder.html      # HUD Block Builder Interface
    ├── css/
    │   └── style.css     # Minimalist HUD Aesthetic (Dark, Glassmorphic)
    └── js/
        ├── api.js        # API Wrapper for CRUD and Ollama
        ├── builder.js    # Block Building & UI Logic
        └── ai.js         # Intelligent Generation & Refinement Logic
```

## 2. Server Architecture (Node.js/Express)
- **Static Hosting**: Serve the `public` folder.
- **Workflow CRUD**:
  - `GET /api/workflows`: List all workflows (scans `workflows/` recursively).
  - `GET /api/workflows/:path`: Read a specific JSON file.
  - `POST /api/workflows`: Create/Save a workflow.
  - `DELETE /api/workflows/:path`: Remove a workflow.
- **Ollama Proxy**: `POST /api/ai/generate` to communicate with the local Ollama instance for workflow suggestions.

## 3. Frontend: HUD Block Builder
### Visual Design
- **Dark Aesthetic**: Deep grays/blacks with neon accents (cyan/amber).
- **Glassmorphism**: Semi-transparent backgrounds for blocks.
- **HUD Layout**: Sidebars for global settings (name, model, questions) and a central "Infinity Canvas" or vertical stack for Steps.

### Core Components
1. **The Question Block**: Inputs for `name`, `message`, and `required` toggle.
2. **The Step Block**: 
   - Type Selector (Prompt/Loop).
   - Template Editor (for Role, Task, Instructions).
   - Output Config (Directory, FileName, Format).
3. **The Loop Block**: Specialized container that allows nesting other steps.

## 4. AI-Assisted Generation
- **Intelligent Scaffold**: A "Generate Workflow" button that takes a simple prompt (e.g., "A pipeline for checking code for security vulnerabilities") and returns a full JSON structure.
- **Field Refinement**: Small AI icons next to text areas (like "Instructions") to expand or refine the text using Ollama.
- **Auto-Question Suggestion**: Analyze a prompt and suggest the necessary variables/questions.

## 5. File implementation Details

### `server/server.js`
- Express setup.
- Recursively read `workflows/` directory to build an index.
- Handle JSON file writing with safety checks.

### `server/public/builder.html`
- Minimal HTML structure with containers for `questions-list` and `steps-list`.
- Template elements for creating new blocks dynamically.

### `server/public/css/style.css`
- Modern CSS using variables.
- `inter` or `roboto mono` fonts.
- Transitions for smooth block adding/removing.

### `server/public/js/builder.js`
- State management for the current workflow.
- Functions to render blocks from JSON.
- Drag-and-drop support (via native HTML5 or a light library).
- Serialization logic to convert the UI back into the tool's JSON format.

## 6. Execution Strategy
In the next session, implement all files in the `server/` directory in one turn to provide a fully functional HUD builder that integrates seamlessly with the existing `ollama-pipeline` core.
