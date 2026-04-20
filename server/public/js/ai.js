async function generateWithAI(event) {
    const userPrompt = prompt("What kind of workflow do you want to build?");
    if (!userPrompt) return;

    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = 'GENERATING...';
    btn.disabled = true;

    try {
        const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userPrompt })
        });
        
        const data = await response.json();
        if (data.workflow) {
            loadWorkflowIntoUI(data.workflow);
        } else {
            alert('AI failed to generate workflow structure.');
        }
    } catch (err) {
        alert('AI Error: ' + err.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}
