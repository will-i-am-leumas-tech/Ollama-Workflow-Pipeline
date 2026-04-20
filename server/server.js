import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import workflowRoutes from './routes/workflows.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/outputs', express.static(path.join(__dirname, '../outputs')));

app.use('/api/workflows', workflowRoutes);

// Get available Ollama models
app.get('/api/ai/models', async (req, res) => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    // Return only names
    const models = (data.models || []).map(m => m.name);
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

app.post('/api/ai/generate', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        model: 'llama3',
        prompt: `Output ONLY a JSON workflow for: ${prompt}. Schema: { "model": "llama3", "questions": [], "steps": [] }`,
        stream: false,
        format: 'json'
      })
    });
    const data = await response.json();
    res.json({ workflow: JSON.parse(data.response) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`HUD Workflow Builder running at http://localhost:${PORT}`);
});
