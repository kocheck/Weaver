/**
 * Data Injector Utility
 *
 * Handles the injection of generated mock data into Sketch layers.
 * Supports both direct text layers and symbol instance overrides.
 */

import { findVariableLayers } from './layerTraversal';

/**
 * Inject data into a single text layer
 * @param {Layer} layer - Sketch text layer
 * @param {string} value - Value to inject
 * @returns {boolean} True if successful
 */
function injectTextLayer(layer, value) {
  try {
    if (layer.type === 'Text') {
      layer.text = String(value);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error injecting text into layer ${layer.name}:`, error);
    return false;
  }
}

/**
 * Inject data into a symbol override
 * @param {Layer} layer - Symbol instance layer
 * @param {Object} overrideInfo - Override information
 * @param {string} value - Value to inject
 * @returns {boolean} True if successful
 */
function injectSymbolOverride(layer, overrideInfo, value) {
  try {
    if (layer.type !== 'SymbolInstance' || !layer.overrides) {
      return false;
    }

    // Find the override by ID
    const override = layer.overrides.find(o => o.id === overrideInfo.overrideId);

    if (!override) {
      console.warn(`Override not found: ${overrideInfo.overrideId}`);
      return false;
    }

    // Set the override value
    override.value = String(value);
    return true;

  } catch (error) {
    console.error(`Error injecting symbol override:`, error);
    return false;
  }
}

/**
 * Inject generated data into layers
 * @param {Array|Layer} layers - Sketch layer(s) to update
 * @param {Object} data - Generated mock data object
 * @returns {Object} Results object with success count and errors
 */
export function injectData(layers, data) {
  const results = {
    totalUpdated: 0,
    successCount: 0,
    failureCount: 0,
    errors: [],
    details: []
  };

  // Find all variable layers
  const variableLayers = findVariableLayers(layers);

  if (variableLayers.length === 0) {
    results.errors.push('No variable layers found to update');
    return results;
  }

  // Iterate through each variable layer and inject data
  variableLayers.forEach(item => {
    const { layer, variableName, type } = item;
    const value = data[variableName];

    // Skip if no data available for this variable
    if (value === undefined || value === null) {
      results.details.push({
        layerName: layer.name,
        variableName: variableName,
        status: 'skipped',
        reason: 'No data available'
      });
      return;
    }

    let success = false;

    // Handle different layer types
    if (type === 'SymbolOverride') {
      success = injectSymbolOverride(layer, item, value);
    } else if (type === 'Text') {
      success = injectTextLayer(layer, value);
    } else {
      // Try to inject as text for other layer types
      success = injectTextLayer(layer, value);
    }

    if (success) {
      results.successCount++;
      results.details.push({
        layerName: layer.name,
        variableName: variableName,
        value: value,
        status: 'success'
      });
    } else {
      results.failureCount++;
      results.details.push({
        layerName: layer.name,
        variableName: variableName,
        status: 'failed',
        reason: 'Injection failed'
      });
    }
  });

  results.totalUpdated = results.successCount;

  return results;
}

/**
 * Preview what data would be injected without actually updating layers
 * @param {Array|Layer} layers - Sketch layer(s) to preview
 * @param {Object} data - Mock data object
 * @returns {Array} Array of preview objects
 */
export function previewInjection(layers, data) {
  const variableLayers = findVariableLayers(layers);

  return variableLayers.map(item => {
    const { layer, variableName, type } = item;
    const value = data[variableName];

    return {
      layerName: layer.name,
      layerType: type,
      variableName: variableName,
      currentValue: type === 'Text' ? layer.text : '(symbol override)',
      newValue: value !== undefined ? String(value) : '(no data)',
      willUpdate: value !== undefined
    };
  });
}

/**
 * Validate that data object contains required keys
 * @param {Object} data - Data object to validate
 * @param {Array} requiredKeys - Array of required key names
 * @returns {Object} Validation result
 */
export function validateData(data, requiredKeys) {
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      message: 'Data must be an object'
    };
  }

  const missingKeys = requiredKeys.filter(key => !(key in data));

  if (missingKeys.length > 0) {
    return {
      isValid: false,
      message: `Missing required keys: ${missingKeys.join(', ')}`,
      missingKeys
    };
  }

  return {
    isValid: true,
    message: 'Data is valid'
  };
}
