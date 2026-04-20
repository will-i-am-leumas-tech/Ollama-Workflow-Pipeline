export const ollamaAdapter = {
  runPrompt: async ({ 
    model, 
    prompt, 
    system, 
    options = {}, 
    endpoint = 'http://localhost:11434/api/generate',
    retries = 2
  }) => {
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 minute timeout

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            prompt,
            system,
            options,
            stream: false
          })
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ollama API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data.response;
      } catch (error) {
        lastError = error;
        if (error.name === 'AbortError') {
          console.error(`Attempt ${attempt + 1} failed: Request timed out after 10 minutes.`);
        } else if (error.cause && error.cause.code === 'ECONNREFUSED') {
          throw new Error(`Ollama is not running at ${endpoint}.`);
        } else {
          console.error(`Attempt ${attempt + 1} failed: ${error.message}`);
        }
        
        if (attempt < retries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.info(`Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    throw lastError;
  }
};
