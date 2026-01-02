/**
 * Tests for Layer Traversal Utility
 */

import {
  isVariableLayer,
  extractVariableName,
  findVariableLayers,
  groupLayersByVariable,
  extractVariableNames,
  validateLayers
} from '../src/utils/layerTraversal';

describe('Layer Traversal', () => {
  describe('isVariableLayer', () => {
    it('should return true for names starting with $', () => {
      expect(isVariableLayer('$cardTitle')).toBe(true);
      expect(isVariableLayer('$price')).toBe(true);
      expect(isVariableLayer('$description')).toBe(true);
    });

    it('should return false for names not starting with $', () => {
      expect(isVariableLayer('cardTitle')).toBe(false);
      expect(isVariableLayer('price')).toBe(false);
      expect(isVariableLayer('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isVariableLayer(null)).toBe(false);
      expect(isVariableLayer(undefined)).toBe(false);
      expect(isVariableLayer('$')).toBe(true);
    });
  });

  describe('extractVariableName', () => {
    it('should remove $ prefix from variable names', () => {
      expect(extractVariableName('$cardTitle')).toBe('cardTitle');
      expect(extractVariableName('$price')).toBe('price');
      expect(extractVariableName('$description')).toBe('description');
    });

    it('should return unchanged if no $ prefix', () => {
      expect(extractVariableName('cardTitle')).toBe('cardTitle');
      expect(extractVariableName('price')).toBe('price');
    });

    it('should handle edge cases', () => {
      expect(extractVariableName('$')).toBe('');
      expect(extractVariableName('$$test')).toBe('$test');
    });
  });

  describe('findVariableLayers', () => {
    it('should find text layers with variable names', () => {
      const mockLayers = [
        { name: '$cardTitle', type: 'Text', text: 'Title' },
        { name: 'normalLayer', type: 'Text', text: 'Normal' },
        { name: '$price', type: 'Text', text: '$10' }
      ];

      const result = findVariableLayers(mockLayers);

      expect(result).toHaveLength(2);
      expect(result[0].variableName).toBe('cardTitle');
      expect(result[1].variableName).toBe('price');
    });

    it('should find nested variable layers', () => {
      const mockLayers = [
        {
          name: 'Group',
          type: 'Group',
          layers: [
            { name: '$nestedTitle', type: 'Text', text: 'Nested' },
            {
              name: 'SubGroup',
              type: 'Group',
              layers: [
                { name: '$deepNested', type: 'Text', text: 'Deep' }
              ]
            }
          ]
        }
      ];

      const result = findVariableLayers(mockLayers);

      expect(result).toHaveLength(2);
      expect(result[0].variableName).toBe('nestedTitle');
      expect(result[1].variableName).toBe('deepNested');
    });

    it('should find symbol overrides with variable names', () => {
      const mockLayers = [
        {
          name: 'SymbolInstance',
          type: 'SymbolInstance',
          overrides: [
            {
              id: 'override-1',
              affectedLayer: { name: '$symbolTitle' }
            },
            {
              id: 'override-2',
              affectedLayer: { name: 'normalOverride' }
            }
          ]
        }
      ];

      const result = findVariableLayers(mockLayers);

      expect(result).toHaveLength(1);
      expect(result[0].variableName).toBe('symbolTitle');
      expect(result[0].type).toBe('SymbolOverride');
      expect(result[0].overrideId).toBe('override-1');
    });

    it('should handle empty layers array', () => {
      const result = findVariableLayers([]);
      expect(result).toHaveLength(0);
    });

    it('should handle single layer (not array)', () => {
      const mockLayer = { name: '$singleLayer', type: 'Text', text: 'Single' };
      const result = findVariableLayers(mockLayer);

      expect(result).toHaveLength(1);
      expect(result[0].variableName).toBe('singleLayer');
    });
  });

  describe('groupLayersByVariable', () => {
    it('should group layers by variable name', () => {
      const variableLayers = [
        { variableName: 'title', layer: { name: '$title1' } },
        { variableName: 'title', layer: { name: '$title2' } },
        { variableName: 'price', layer: { name: '$price1' } }
      ];

      const result = groupLayersByVariable(variableLayers);

      expect(Object.keys(result)).toHaveLength(2);
      expect(result.title).toHaveLength(2);
      expect(result.price).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const result = groupLayersByVariable([]);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('extractVariableNames', () => {
    it('should extract unique variable names', () => {
      const mockLayers = [
        { name: '$title', type: 'Text' },
        { name: '$title', type: 'Text' },
        { name: '$price', type: 'Text' },
        { name: '$description', type: 'Text' }
      ];

      const result = extractVariableNames(mockLayers);

      expect(result).toHaveLength(3);
      expect(result).toContain('title');
      expect(result).toContain('price');
      expect(result).toContain('description');
    });

    it('should handle layers without variables', () => {
      const mockLayers = [
        { name: 'normal1', type: 'Text' },
        { name: 'normal2', type: 'Text' }
      ];

      const result = extractVariableNames(mockLayers);
      expect(result).toHaveLength(0);
    });
  });

  describe('validateLayers', () => {
    it('should validate layers with variables', () => {
      const mockLayers = [
        { name: '$title', type: 'Text' },
        { name: '$price', type: 'Text' }
      ];

      const result = validateLayers(mockLayers);

      expect(result.isValid).toBe(true);
      expect(result.count).toBe(2);
      expect(result.variables).toHaveLength(2);
    });

    it('should invalidate layers without variables', () => {
      const mockLayers = [
        { name: 'normal1', type: 'Text' },
        { name: 'normal2', type: 'Text' }
      ];

      const result = validateLayers(mockLayers);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('No variable layers found');
    });

    it('should handle empty layers', () => {
      const result = validateLayers([]);

      expect(result.isValid).toBe(false);
    });
  });
});
