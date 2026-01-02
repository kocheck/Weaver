/**
 * LocalMock Data - Main Plugin Commands
 *
 * This file contains the main command handlers for the Sketch plugin.
 * It coordinates between the UI, LLM client, and data injection utilities.
 */

import sketch from 'sketch';
import BrowserWindow from 'sketch-module-web-view';
import { extractVariableNames, validateLayers } from './utils/layerTraversal';
import { generateMockData, testConnection } from './utils/llmClient';
import { injectData, previewInjection } from './utils/dataInjector';

const SETTINGS_KEY = 'com.localmock.sketch.settings';

/**
 * Sanitize error message for user display
 * Removes potentially sensitive information like file paths, API keys, etc.
 * @param {string} errorMessage - Raw error message
 * @returns {string} Sanitized error message
 */
function sanitizeErrorMessage(errorMessage) {
  if (!errorMessage || typeof errorMessage !== 'string') {
    return 'An unknown error occurred';
  }

  // Remove file paths (Unix and Windows style)
  let sanitized = errorMessage.replace(/\/[^\s]+/g, '[path]');
  sanitized = sanitized.replace(/[A-Z]:\\[^\s]+/g, '[path]');

  // Remove potential API keys or tokens with common prefixes
  // Matches keys like: sk-..., Bearer ..., token_..., api_key_...
  sanitized = sanitized.replace(/\b(sk-|Bearer\s+|token[_-]|api[_-]key[_-])[A-Za-z0-9_-]{16,}\b/gi, '[redacted]');

  // If the message is empty after sanitization, provide a generic message
  if (!sanitized.trim()) {
    return 'An error occurred during the operation';
  }

  return sanitized;
}

/**
 * Validate settings structure and types
 * @param {*} settings - Settings to validate
 * @returns {boolean} True if settings are valid
 */
function validateSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    return false;
  }

  // Validate endpoint is a string and looks like a URL
  if (settings.endpoint && typeof settings.endpoint === 'string') {
    try {
      new URL(settings.endpoint);
    } catch {
      return false;
    }
  }

  // Validate model is a string
  if (settings.model && typeof settings.model !== 'string') {
    return false;
  }

  // Validate lastPrompt is a string
  if (settings.lastPrompt && typeof settings.lastPrompt !== 'string') {
    return false;
  }

  // Validate lastKeys is an array of strings
  if (settings.lastKeys) {
    if (!Array.isArray(settings.lastKeys)) {
      return false;
    }
    if (!settings.lastKeys.every(key => typeof key === 'string')) {
      return false;
    }
  }

  return true;
}

/**
 * Load saved settings from Sketch preferences
 * @returns {Object} Settings object
 */
function loadSettings() {
  const defaultSettings = {
    endpoint: 'http://localhost:11434/api/generate',
    model: 'llama3',
    lastPrompt: '',
    lastKeys: []
  };

  try {
    const saved = sketch.Settings.settingForKey(SETTINGS_KEY);
    if (saved && validateSettings(saved)) {
      return { ...defaultSettings, ...saved };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
}

/**
 * Save settings to Sketch preferences
 * @param {Object} settings - Settings to save
 */
function saveSettings(settings) {
  try {
    sketch.Settings.setSettingForKey(SETTINGS_KEY, settings);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

/**
 * Show native Sketch UI alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {string} type - Alert type (info, error, warning)
 */
function showAlert(title, message, type = 'info') {
  const UI = require('sketch/ui');
  const icon = type === 'error' ? '⚠️' : type === 'warning' ? '⚡' : 'ℹ️';

  UI.message(`${icon} ${title}: ${message}`);

  if (type === 'error') {
    UI.alert(title, message);
  }
}

/**
 * Main command: Generate Mock Data
 * Opens a UI to configure and generate mock data for selected layers
 */
export function onGenerateMockData(context) {
  const document = sketch.getSelectedDocument();

  if (!document) {
    showAlert('No Document', 'Please open a Sketch document first.', 'error');
    return;
  }

  const selection = document.selectedLayers;

  if (selection.isEmpty) {
    showAlert('No Selection', 'Please select at least one layer containing variable names (e.g., $cardTitle).', 'warning');
    return;
  }

  // Validate that selection contains variable layers
  const validation = validateLayers(selection.layers);

  if (!validation.isValid) {
    showAlert('No Variables Found', validation.message, 'warning');
    return;
  }

  // Extract variable names from selection
  const variableNames = extractVariableNames(selection.layers);
  const settings = loadSettings();

  // Create and show WebView window
  const options = {
    identifier: 'localmock.webview',
    width: 600,
    height: 700,
    show: false,
    resizable: true,
    title: 'LocalMock Data Generator',
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true
  };

  const browserWindow = new BrowserWindow(options);

  // Load the UI HTML file
  browserWindow.loadURL(require('./ui.html'));

  // Handle messages from the WebView
  browserWindow.webContents.on('did-finish-load', () => {
    // Send initial data to UI
    browserWindow.webContents.executeJavaScript(
      `window.initializeUI(${JSON.stringify({
        variables: variableNames,
        settings: settings,
        layerCount: validation.count
      })})`
    ).then(() => {
      browserWindow.show();
    });
  });

  // Handle message from WebView: Generate Data
  browserWindow.webContents.on('generate', async (config) => {
    try {
      // Save settings for next time
      saveSettings({
        endpoint: config.endpoint,
        model: config.model,
        lastPrompt: config.prompt,
        lastKeys: config.keys,
        temperature: config.temperature,
        topP: config.topP
      });

      // Show loading state
      browserWindow.webContents.executeJavaScript(
        `window.setLoadingState(true, 'Generating data with Ollama...')`
      );

      // Generate mock data using LLM
      const mockData = await generateMockData({
        keys: config.keys,
        prompt: config.prompt,
        endpoint: config.endpoint,
        model: config.model,
        temperature: config.temperature,
        topP: config.topP
      });

      // Inject data into layers
      const results = injectData(selection.layers, mockData);

      // Update UI with results
      browserWindow.webContents.executeJavaScript(
        `window.setLoadingState(false); window.showResults(${JSON.stringify({
          success: true,
          data: mockData,
          results: results
        })})`
      );

      // Show success message
      showAlert(
        'Success',
        `Updated ${results.successCount} layer(s) with generated data.`,
        'info'
      );

    } catch (error) {
      console.error('Error generating mock data:', error);

      const sanitizedMessage = sanitizeErrorMessage(error.message || 'An error occurred');

      browserWindow.webContents.executeJavaScript(
        `window.setLoadingState(false); window.showError(${JSON.stringify(sanitizedMessage)})`
      );

      showAlert('Generation Failed', sanitizedMessage, 'error');
    }
  });

  // Handle message from WebView: Test Connection
  browserWindow.webContents.on('test-connection', async (endpoint) => {
    try {
      const isConnected = await testConnection(endpoint);

      browserWindow.webContents.executeJavaScript(
        `window.showConnectionStatus(${JSON.stringify({
          success: isConnected,
          endpoint: endpoint
        })})`
      );

    } catch (error) {
      const sanitizedMessage = sanitizeErrorMessage(error.message || 'Connection failed');
      
      browserWindow.webContents.executeJavaScript(
        `window.showConnectionStatus(${JSON.stringify({
          success: false,
          endpoint: endpoint,
          error: sanitizedMessage
        })})`
      );
    }
  });

  // Handle message from WebView: Preview
  browserWindow.webContents.on('preview', (config) => {
    try {
      // Create mock data for preview
      const mockData = config.keys.reduce((obj, key) => {
        obj[key] = `<${key} data>`;
        return obj;
      }, {});

      const preview = previewInjection(selection.layers, mockData);

      browserWindow.webContents.executeJavaScript(
        `window.showPreview(${JSON.stringify(preview)})`
      );

    } catch (error) {
      console.error('Error generating preview:', error);
    }
  });
}

/**
 * Configuration command: Open settings panel
 */
export function onConfigure(context) {
  const UI = require('sketch/ui');

  UI.message('Settings loaded. Use "Generate Mock Data" command to configure per-generation settings.');

  // Could open a dedicated settings panel here
  // For now, settings are managed through the main UI
  onGenerateMockData(context);
}

/**
 * Export for testing
 */
export const testExports = {
  loadSettings,
  saveSettings,
  showAlert
};
