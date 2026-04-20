/**
 * Dummy Tool Template
 * 
 * All tools must export a 'run' function.
 * @param {Object} params - Rendered parameters from the workflow JSON
 * @param {Object} context - The full internal state of the pipeline
 * @returns {Promise<any>} - The result to be saved to state or file
 */
export const run = async (params, context) => {
  console.log('[TOOL: DUMMY] Executing with params:', params);
  
  // Simulate some async processing
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return a structured result
  return {
    status: 'success',
    received_message: params.message || 'No message provided',
    timestamp: new Date().toISOString(),
    dummy_data: [1, 2, 3]
  };
};
