import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKFLOWS_DIR = path.resolve(__dirname, '../../workflows');

async function getFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files).filter(f => f.endsWith('.json'));
}

const OUTPUTS_DIR = path.resolve(__dirname, '../../outputs');

async function getMetadataFiles(dir) {
  try {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getMetadataFiles(res) : res;
    }));
    return Array.prototype.concat(...files).filter(f => f.endsWith('.json'));
  } catch (err) {
    return [];
  }
}

router.get('/outputs', async (req, res) => {
  const { workflowName } = req.query;
  if (!workflowName) return res.status(400).json({ error: 'Workflow name required' });

  try {
    const allMetadataFiles = await getMetadataFiles(OUTPUTS_DIR);
    const filteredOutputs = [];

    for (const f of allMetadataFiles) {
      try {
        const content = await fs.readFile(f, 'utf8');
        const metadata = JSON.parse(content);
        if (metadata.workflowName === workflowName) {
          const relativePath = path.relative(OUTPUTS_DIR, f).replace(/\\/g, '/');
          const dataFilePath = relativePath.replace(/\.json$/, '');
          filteredOutputs.push({
            metadata,
            filePath: dataFilePath,
            fullPath: `/outputs/${dataFilePath}`
          });
        }
      } catch (e) {
        // Skip malformed or irrelevant JSON
      }
    }

    // Sort by timestamp newest first
    filteredOutputs.sort((a, b) => new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp));
    res.json(filteredOutputs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list outputs' });
  }
});

router.get('/list', async (req, res) => {
  try {
    const allFiles = await getFiles(WORKFLOWS_DIR);
    
    // Pre-calculate output counts for all workflows
    const allMetadataFiles = await getMetadataFiles(OUTPUTS_DIR);
    const counts = {};
    
    for (const f of allMetadataFiles) {
      try {
        const content = await fs.readFile(f, 'utf8');
        const metadata = JSON.parse(content);
        if (metadata.workflowName) {
          counts[metadata.workflowName] = (counts[metadata.workflowName] || 0) + 1;
        }
      } catch (e) {}
    }

    const workflows = await Promise.all(allFiles.map(async f => {
      const content = await fs.readFile(f, 'utf8');
      const json = JSON.parse(content);
      const name = json.name || path.basename(f, '.json');
      return {
        path: path.relative(WORKFLOWS_DIR, f).replace(/\\/g, '/'),
        filename: path.basename(f, '.json'),
        name: name,
        outputCount: counts[name] || 0
      };
    }));
    res.json(workflows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list workflows' });
  }
});

router.get('/get', async (req, res) => {
  try {
    const relPath = req.query.path;
    const filePath = path.join(WORKFLOWS_DIR, relPath);
    const data = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ error: 'Workflow not found' });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { path: relPath, content } = req.body;
    const filePath = path.join(WORKFLOWS_DIR, relPath.endsWith('.json') ? relPath : `${relPath}.json`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save workflow' });
  }
});

import { runEngine } from '../../src/core/runEngine.js';
import { ollamaAdapter } from '../../src/adapters/ollamaAdapter.js';

// ... (existing code)

router.get('/delete', async (req, res) => {
  try {
    const relPath = req.query.path;
    const filePath = path.join(WORKFLOWS_DIR, relPath);
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

router.post('/run', async (req, res) => {
  const { path: relPath, answers } = req.body;
  if (!relPath) return res.status(400).json({ error: 'Workflow path required' });

  const logs = [];
  const originalInfo = console.info;
  const originalLog = console.log;
  const originalError = console.error;

  // Simple log capture
  const capture = (type, ...args) => {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    logs.push({ type, msg, timestamp: new Date().toISOString() });
    originalLog(`[${type}] ${msg}`);
  };

  console.info = (...args) => capture('info', ...args);
  console.log = (...args) => capture('log', ...args);
  console.error = (...args) => capture('error', ...args);

  try {
    const workflowName = relPath.replace(/\.json$/, '');
    const result = await runEngine(workflowName, {
      cliAnswers: answers,
      ollamaAdapter: ollamaAdapter,
      // No askQuestionsFn or confirmRunFn to keep it automated for the HUD
    });

    res.json({ success: true, logs, state: result.state });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, logs });
  } finally {
    console.info = originalInfo;
    console.log = originalLog;
    console.error = originalError;
  }
});

export default router;
