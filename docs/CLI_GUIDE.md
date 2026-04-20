# CLI Power User Guide

The CLI runner is the original way to interact with `ollama-pipeline`. It's fast, interactive, and easy to use in automated environments.

## Basic Usage
To run a workflow, use:
```bash
node runWorkflow.js <workflowName>
```
*Note: You don't need the `.json` extension.*

---

## 1. Passing Arguments
You can skip interactive questions by pre-filling them with the `--set` flag:
```bash
node runWorkflow.js creative/album-generator --set artistName="Neon Dreams" --set songCount=5
```

---

## 2. Advanced Overrides
- **`--model <name>`**: Temporarily use a different Ollama model.
- **`--output <dir>`**: Redirect the generated files to a different folder.
- **`--yes` or `-y`**: Skip the "Confirmation" preview. This is critical for automated cron jobs or CI/CD pipelines.

Example:
```bash
node runWorkflow.js business/meeting-minutes --model llama3:70b --yes
```

---

## 3. Interactive Workflow
If you don't provide answers via `--set`, the CLI will:
1.  **Ask Questions**: Based on the `questions` array in your JSON.
2.  **Confirmation Preview**: Show you the final structured prompt and the target file path before sending it to Ollama.
3.  **Real-time Progress**: Show you each step being executed and where the output is saved.

---

## 4. Automation Tips
For scheduled tasks or shell scripts:
- **Quiet Mode**: Use the `--yes` flag to disable user input entirely.
- **Environment Variables**: You can also wrap the CLI in shell scripts that pull from ENV vars or other data sources.
- **Pipeline Chaining**: Use the output of one CLI run as the input for another via file reading or `--set`.
