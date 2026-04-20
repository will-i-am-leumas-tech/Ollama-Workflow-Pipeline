# HUD Web Interface Guide

The HUD (Heads-Up Display) is a powerful web application that lets you manage, build, and run pipelines visually.

## Getting Started
To launch the HUD, run the following command in your terminal:
```bash
npm run server
```
Then, visit `http://localhost:3000` in your web browser.

---

## 1. Dashboard
The dashboard is the main entry point to your workflows.
- **Workflow Cards**: Each card displays a workflow's name, its file path, and its **Run Count**.
- **Search & Filter**: Use the search bar to find workflows by name or path. Filter by a minimum run count.
- **Star/Favorite**: Click the star icon to pin your most-used pipelines to the top.
- **Gallery**: Each workflow has a dedicated Gallery button to view its generated outputs.

---

## 2. Workflow Builder
Build and edit workflows visually without manually writing JSON.
- **Visual Blocks**: Each workflow step is represented as a block. You can add **Prompts** or **Loops**.
- **User Questions**: Add variables to the sidebar to define what information your pipeline needs from the user.
- **AI-Assisted Generation**: The HUD features an "Auto-Generate (AI)" button. Describe the workflow you want, and Ollama will build the initial structure for you.

---

## 3. Running Pipelines
The HUD features an integrated runner.
- **Input Forms**: When you click "Run Workflow," the HUD dynamically generates an input form based on your workflow's defined questions.
- **Live Logs**: Watch the pipeline execute in real-time through the built-in console logs.
- **Final Inspector**: Once finished, you can inspect the final JSON state of the entire pipeline run.

---

## 4. Output Gallery
The Gallery is where you view your results.
- **Live Preview**: Click "View Output" to read the content of any generated file directly in your browser.
- **Run Metadata**: Every run stores a detailed metadata file. Click "Details" to see exactly what prompts and models were used to generate that specific file.
- **Organization**: Outputs are grouped by workflow name and sorted by time (newest first).
