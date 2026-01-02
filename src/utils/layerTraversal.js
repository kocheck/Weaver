/**
 * Layer Traversal Utility
 *
 * Provides functions to recursively traverse Sketch layers and identify
 * variable-named layers (e.g., $cardTitle, $price) that should be populated
 * with generated mock data.
 */

/**
 * Check if a layer name represents a variable (starts with $)
 * @param {string} name - The layer name
 * @returns {boolean} True if the layer name is a variable
 */
export function isVariableLayer(name) {
  return name && typeof name === 'string' && name.startsWith('$');
}

/**
 * Extract the variable name from a layer name (removes the $ prefix)
 * @param {string} name - The layer name (e.g., "$cardTitle")
 * @returns {string} The variable name (e.g., "cardTitle")
 */
export function extractVariableName(name) {
  return name.startsWith('$') ? name.substring(1) : name;
}

/**
 * Recursively traverse layers to find all variable-named layers
 * @param {Array|Layer} layers - Sketch layer(s) to traverse
 * @param {Array} results - Accumulator for found variable layers
 * @returns {Array} Array of objects with layer and variableName properties
 */
export function findVariableLayers(layers, results = []) {
  // Handle both single layer and array of layers
  const layersArray = Array.isArray(layers) ? layers : [layers];

  layersArray.forEach(layer => {
    if (!layer) return;

    // Check if this layer is a variable layer
    if (isVariableLayer(layer.name)) {
      results.push({
        layer: layer,
        variableName: extractVariableName(layer.name),
        type: layer.type
      });
    }

    // Check symbol overrides for variable names
    if (layer.type === 'SymbolInstance' && layer.overrides) {
      layer.overrides.forEach(override => {
        if (override.affectedLayer && isVariableLayer(override.affectedLayer.name)) {
          results.push({
            layer: layer,
            variableName: extractVariableName(override.affectedLayer.name),
            type: 'SymbolOverride',
            override: override,
            overrideId: override.id
          });
        }
      });
    }

    // Recursively traverse child layers
    if (layer.layers && layer.layers.length > 0) {
      findVariableLayers(layer.layers, results);
    }
  });

  return results;
}

/**
 * Group variable layers by their variable names
 * @param {Array} variableLayers - Array of variable layer objects
 * @returns {Object} Object with variable names as keys and arrays of layers as values
 */
export function groupLayersByVariable(variableLayers) {
  return variableLayers.reduce((groups, item) => {
    const varName = item.variableName;
    if (!groups[varName]) {
      groups[varName] = [];
    }
    groups[varName].push(item);
    return groups;
  }, {});
}

/**
 * Extract unique variable names from layers
 * @param {Array|Layer} layers - Sketch layer(s) to analyze
 * @returns {Array} Array of unique variable names (without $ prefix)
 */
export function extractVariableNames(layers) {
  const variableLayers = findVariableLayers(layers);
  const uniqueNames = new Set(variableLayers.map(item => item.variableName));
  return Array.from(uniqueNames);
}

/**
 * Validate that layers contain at least one variable layer
 * @param {Array|Layer} layers - Sketch layer(s) to validate
 * @returns {Object} Object with isValid and message properties
 */
export function validateLayers(layers) {
  const variableLayers = findVariableLayers(layers);

  if (variableLayers.length === 0) {
    return {
      isValid: false,
      message: 'No variable layers found. Please name layers with $ prefix (e.g., $cardTitle, $price).'
    };
  }

  // Extract unique variable names from the already-found layers
  const uniqueNames = new Set(variableLayers.map(item => item.variableName));
  const variables = Array.from(uniqueNames);

  return {
    isValid: true,
    message: `Found ${variableLayers.length} variable layer(s).`,
    count: variableLayers.length,
    variables: variables
  };
}
