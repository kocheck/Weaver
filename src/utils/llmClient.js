/**
 * LLM Client Utility
 *
 * Handles communication with the local Ollama API to generate
 * JSON-formatted mock data based on user-defined structure and prompts.
 */

const DEFAULT_ENDPOINT = 'http://localhost:11434/api/generate';
const DEFAULT_MODEL = 'llama3';
const REQUEST_TIMEOUT = 60000; // 60 seconds
const CONNECTION_TEST_TIMEOUT = 5000; // 5 seconds

/**
 * Build the prompt for the LLM based on user input
 * 
 * This function constructs a carefully crafted prompt that instructs the LLM
 * to generate valid JSON data without any markdown formatting or explanations.
 * The prompt engineering strategy focuses on:
 * 1. Explicitly requesting JSON-only output (no markdown code blocks)
 * 2. Providing the exact structure the LLM should follow
 * 3. Giving context to generate realistic, appropriate data
 * 
 * This approach is critical for reliability as it reduces the need for
 * post-processing and parsing of the LLM response, ensuring that the generated
 * data can be directly injected into Sketch layers.
 * 
 * @param {Array} keys - Array of JSON keys to generate (e.g., ['title', 'description', 'price'])
 * @param {string} userPrompt - Natural language context (e.g., "Menu items for a noodle bar")
 * @returns {string} Complete prompt for the LLM
 */
function buildPrompt(keys, userPrompt) {
  const structure = keys.reduce((obj, key) => {
    obj[key] = `<${key}>`;
    return obj;
  }, {});

  return `You are a data generator assistant. Your task is to generate realistic mock data in JSON format.

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown, no explanations, no code blocks
2. Do NOT wrap the output in \`\`\`json or any other formatting
3. The JSON must match this exact structure: ${JSON.stringify(structure)}
4. Generate creative, realistic data based on the context below

CONTEXT: ${userPrompt}

REQUIRED STRUCTURE: Each key should contain appropriate data:
${keys.map(key => `- ${key}: Generate appropriate content for this field`).join('\n')}

OUTPUT (JSON only):`;
}

/**
 * Call the Ollama API to generate mock data
 * @param {Object} config - Configuration object
 * @param {Array} config.keys - Array of JSON keys
 * @param {string} config.prompt - User's natural language prompt
 * @param {string} config.endpoint - Ollama API endpoint (optional)
 * @param {string} config.model - Model name (optional)
 * @param {number} config.temperature - Temperature for generation (optional, default: 0.7)
 * @param {number} config.topP - Top P for nucleus sampling (optional, default: 0.9)
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function generateMockData(config) {
  const {
    keys,
    prompt,
    endpoint = DEFAULT_ENDPOINT,
    model = DEFAULT_MODEL,
    temperature = 0.7,
    topP = 0.9
  } = config;

  // Validate inputs
  if (!keys || !Array.isArray(keys) || keys.length === 0) {
    throw new Error('Keys array is required and must not be empty');
  }

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error('Prompt is required and must be a non-empty string');
  }

  const llmPrompt = buildPrompt(keys, prompt);

  const payload = {
    model,
    prompt: llmPrompt,
    format: 'json',
    stream: false,
    options: {
      temperature,
      top_p: topP
    }
  };

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json();

    // Ollama returns the generated text in the 'response' field
    if (!data.response) {
      throw new Error('Invalid response from Ollama: missing response field');
    }

    // Parse the JSON from the response
    let generatedData;
    try {
      // Clean potential markdown formatting
      let jsonString = data.response.trim();

      // Remove markdown code blocks if present
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      generatedData = JSON.parse(jsonString);
    } catch (parseError) {
      throw new Error(`Failed to parse JSON from LLM response: ${parseError.message}\nResponse: ${data.response}`);
    }

    // Validate that the response contains the expected keys
    const missingKeys = keys.filter(key => !(key in generatedData));
    if (missingKeys.length > 0) {
      console.warn(`Generated data is missing keys: ${missingKeys.join(', ')}`);
    }

    return generatedData;

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${REQUEST_TIMEOUT / 1000} seconds. Please check if Ollama is running.`);
    }

    if (
      error.name === 'TypeError' ||
      (typeof error.message === 'string' && error.message.toLowerCase().includes('fetch'))
    ) {
      throw new Error(`Failed to connect to Ollama at ${endpoint}. Please ensure Ollama is running and accessible.`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Test connection to Ollama
 * @param {string} endpoint - Ollama API endpoint
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testConnection(endpoint = DEFAULT_ENDPOINT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TEST_TIMEOUT);

  try {
    const response = await fetch(endpoint.replace('/api/generate', '/api/tags'), {
      method: 'GET',
      signal: controller.signal
    });

    return response.ok;
  } catch (error) {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get available models from Ollama
 * @param {string} endpoint - Ollama API endpoint
 * @returns {Promise<Array>} Array of available model names
 */
export async function getAvailableModels(endpoint = DEFAULT_ENDPOINT) {
  try {
    const tagsEndpoint = endpoint.replace('/api/generate', '/api/tags');
    const response = await fetch(tagsEndpoint);

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    return data.models ? data.models.map(m => m.name) : [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}
