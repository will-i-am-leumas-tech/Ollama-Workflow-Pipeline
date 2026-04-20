const questionsList = document.getElementById('questions-list');
const stepsList = document.getElementById('steps-list');
const wfPathInput = document.getElementById('wf-path');
const wfModelInput = document.getElementById('wf-model');

// State
let currentWorkflow = {
    model: 'llama3',
    questions: [],
    steps: []
};

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path');
    
    if (path) {
        wfPathInput.value = path;
        wfPathInput.disabled = true;
        try {
            const wf = await API.getWorkflow(path);
            loadWorkflowIntoUI(wf);
        } catch (err) {
            console.error('Failed to load workflow', err);
        }
    }
});

function loadWorkflowIntoUI(wf) {
    currentWorkflow = wf;
    wfModelInput.value = wf.model || 'llama3';
    
    questionsList.innerHTML = '';
    stepsList.innerHTML = '';
    
    (wf.questions || []).forEach(q => addQuestion(q));
    (wf.steps || []).forEach(s => addStep(s.type || 'prompt', s));
}

function addQuestion(data = {}) {
    const template = document.getElementById('question-template').content.cloneNode(true);
    const block = template.querySelector('.block');
    
    if (data.name) block.querySelector('.q-name').value = data.name;
    if (data.message) block.querySelector('.q-message').value = data.message;
    
    questionsList.appendChild(block);
}

function addStep(type, data = {}) {
    const template = document.getElementById('step-template').content.cloneNode(true);
    const block = template.querySelector('.block');
    block.dataset.type = type;
    
    if (type === 'loop') {
        block.querySelector('.step-type-label').innerText = 'Loop Step';
        block.classList.add('loop-step');
        block.style.borderLeftColor = 'var(--accent-primary)';
    }
    
    if (data.name) block.querySelector('.s-name').value = data.name;
    if (data.template) block.querySelector('.s-template').value = data.template;
    if (data.output?.directory) block.querySelector('.s-outdir').value = data.output.directory;
    if (data.output?.filename) block.querySelector('.s-filename').value = data.output.filename;
    
    stepsList.appendChild(block);
}

async function saveWorkflow() {
    const path = wfPathInput.value;
    if (!path) return alert('Please specify a workflow path');
    
    const workflow = {
        model: wfModelInput.value,
        questions: [],
        steps: []
    };
    
    // Serialize Questions
    document.querySelectorAll('.question-block').forEach(block => {
        workflow.questions.push({
            name: block.querySelector('.q-name').value,
            message: block.querySelector('.q-message').value,
            type: 'input'
        });
    });
    
    // Serialize Steps
    document.querySelectorAll('.step-block').forEach(block => {
        workflow.steps.push({
            name: block.querySelector('.s-name').value,
            type: block.dataset.type,
            template: block.querySelector('.s-template').value,
            output: {
                directory: block.querySelector('.s-outdir').value,
                filename: block.querySelector('.s-filename').value
            }
        });
    });
    
    try {
        await API.saveWorkflow(path, workflow);
        alert('Workflow saved successfully!');
    } catch (err) {
        alert('Error saving: ' + err.message);
    }
}

// Run Workflow Logic
const runModal = document.getElementById('run-modal');
const runQuestionsList = document.getElementById('run-questions-list');
const runStatus = document.getElementById('run-status');
const runInputs = document.getElementById('run-inputs');
const runLogs = document.getElementById('run-logs');
const runResults = document.getElementById('run-results');
const runOutputJson = document.getElementById('run-output-json');

function openRunModal() {
    runModal.style.display = 'flex';
    runInputs.style.display = 'block';
    runStatus.style.display = 'none';
    runQuestionsList.innerHTML = '';
    
    // Generate input fields based on workflow questions
    document.querySelectorAll('.question-block').forEach(block => {
        const name = block.querySelector('.q-name').value;
        const msg = block.querySelector('.q-message').value;
        if (!name) return;

        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label>${msg || name}</label>
            <input type="text" class="run-answer" data-name="${name}" placeholder="Enter value for ${name}...">
        `;
        runQuestionsList.appendChild(div);
    });
}

function closeRunModal() {
    runModal.style.display = 'none';
}

async function startExecution() {
    const path = wfPathInput.value;
    if (!path) return alert('Workflow must be saved first!');

    const answers = {};
    document.querySelectorAll('.run-answer').forEach(input => {
        answers[input.dataset.name] = input.value;
    });

    runInputs.style.display = 'none';
    runStatus.style.display = 'block';
    runLogs.innerHTML = '<div class="log-entry log-info">Initializing execution...</div>';
    runResults.style.display = 'none';

    try {
        const response = await API.runWorkflow(path, answers);
        
        // Display Logs
        if (response.logs) {
            runLogs.innerHTML = response.logs.map(log => `
                <div class="log-entry log-${log.type}">
                    <span class="log-timestamp">${new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span class="log-msg">${log.msg}</span>
                </div>
            `).join('');
        }

        if (response.success) {
            runResults.style.display = 'block';
            runOutputJson.textContent = JSON.stringify(response.state, null, 2);
            runLogs.innerHTML += '<div class="log-entry log-info" style="color: #0f0; margin-top: 1rem;">>>> PIPELINE COMPLETED SUCCESSFULLY</div>';
        } else {
            runLogs.innerHTML += `<div class="log-entry log-error">>>> EXECUTION FAILED: ${response.error}</div>`;
        }
    } catch (err) {
        runLogs.innerHTML += `<div class="log-entry log-error">>>> NETWORK ERROR: ${err.message}</div>`;
    }
}
