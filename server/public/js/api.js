const API = {
    async getWorkflows() {
        const res = await fetch('/api/workflows/list');
        return res.json();
    },
    async getWorkflow(path) {
        const res = await fetch(`/api/workflows/get?path=${encodeURIComponent(path)}`);
        return res.json();
    },
    async saveWorkflow(path, content) {
        const res = await fetch('/api/workflows/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, content })
        });
        return res.json();
    },
    async deleteWorkflow(path) {
        const res = await fetch(`/api/workflows/delete?path=${encodeURIComponent(path)}`);
        return res.json();
    },

    async runWorkflow(path, answers, model) {
        const res = await fetch('/api/workflows/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, answers, model })
        });
        return res.json();
    },

    async getOutputs(workflowName) {
        const res = await fetch(`/api/workflows/outputs?workflowName=${encodeURIComponent(workflowName)}`);
        return res.json();
    },

    async getModels() {
        const res = await fetch('/api/ai/models');
        return res.json();
    }
};
