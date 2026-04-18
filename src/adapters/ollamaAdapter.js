export const ollamaAdapter = {
  runPrompt: async ({ model, prompt, system, options = {}, endpoint = 'http://localhost:11434/api/generate' }) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt,
          system,
          options,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      if (error.cause && error.cause.code === 'ECONNREFUSED') {
        throw new Error(`Ollama is not running at ${endpoint}. Please start Ollama first.`);
      }
      throw error;
    }
  }
};
