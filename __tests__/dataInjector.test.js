/**
 * Tests for Data Injector Utility
 */

import { injectData, previewInjection, validateData } from '../src/utils/dataInjector';

describe('Data Injector', () => {
  describe('injectData', () => {
    it('should inject data into text layers', () => {
      const mockLayers = [
        { name: '$title', type: 'Text', text: 'Old Title' },
        { name: '$description', type: 'Text', text: 'Old Description' }
      ];

      const mockData = {
        title: 'New Title',
        description: 'New Description'
      };

      const result = injectData(mockLayers, mockData);

      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(mockLayers[0].text).toBe('New Title');
      expect(mockLayers[1].text).toBe('New Description');
    });

    it('should inject data into symbol overrides', () => {
      const mockOverride = {
        id: 'override-1',
        affectedLayer: { name: '$symbolTitle' },
        value: 'Old Value'
      };

      const mockLayers = [
        {
          name: 'Symbol',
          type: 'SymbolInstance',
          overrides: [mockOverride]
        }
      ];

      const mockData = {
        symbolTitle: 'New Symbol Value'
      };

      const result = injectData(mockLayers, mockData);

      expect(result.successCount).toBe(1);
      expect(mockOverride.value).toBe('New Symbol Value');
    });

    it('should handle mixed layer types', () => {
      const mockLayers = [
        { name: '$title', type: 'Text', text: 'Title' },
        { name: 'normalLayer', type: 'Text', text: 'Normal' },
        {
          name: 'Symbol',
          type: 'SymbolInstance',
          overrides: [
            {
              id: 'override-1',
              affectedLayer: { name: '$price' },
              value: '0'
            }
          ]
        }
      ];

      const mockData = {
        title: 'New Title',
        price: '99'
      };

      const result = injectData(mockLayers, mockData);

      expect(result.successCount).toBe(2);
      expect(mockLayers[0].text).toBe('New Title');
      expect(mockLayers[2].overrides[0].value).toBe('99');
    });

    it('should skip layers without matching data', () => {
      const mockLayers = [
        { name: '$title', type: 'Text', text: 'Title' },
        { name: '$description', type: 'Text', text: 'Description' }
      ];

      const mockData = {
        title: 'New Title'
        // description is missing
      };

      const result = injectData(mockLayers, mockData);

      expect(result.successCount).toBe(1);
      expect(mockLayers[0].text).toBe('New Title');
      expect(mockLayers[1].text).toBe('Description'); // Unchanged
    });

    it('should return error when no variable layers found', () => {
      const mockLayers = [
        { name: 'normal1', type: 'Text', text: 'Normal' },
        { name: 'normal2', type: 'Text', text: 'Normal' }
      ];

      const mockData = { title: 'Test' };

      const result = injectData(mockLayers, mockData);

      expect(result.successCount).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('No variable layers found');
    });

    it('should handle nested layers', () => {
      const mockLayers = [
        {
          name: 'Group',
          type: 'Group',
          layers: [
            { name: '$nestedTitle', type: 'Text', text: 'Old' }
          ]
        }
      ];

      const mockData = {
        nestedTitle: 'New Nested'
      };

      const result = injectData(mockLayers, mockData);

      expect(result.successCount).toBe(1);
      expect(mockLayers[0].layers[0].text).toBe('New Nested');
    });

    it('should convert non-string values to strings', () => {
      const mockLayers = [
        { name: '$price', type: 'Text', text: '0' },
        { name: '$count', type: 'Text', text: '0' }
      ];

      const mockData = {
        price: 99.99,
        count: 42
      };

      const result = injectData(mockLayers, mockData);

      expect(result.successCount).toBe(2);
      expect(mockLayers[0].text).toBe('99.99');
      expect(mockLayers[1].text).toBe('42');
    });

    it('should provide detailed results', () => {
      const mockLayers = [
        { name: '$title', type: 'Text', text: 'Title' }
      ];

      const mockData = {
        title: 'New Title'
      };

      const result = injectData(mockLayers, mockData);

      expect(result.details).toHaveLength(1);
      expect(result.details[0]).toMatchObject({
        layerName: '$title',
        variableName: 'title',
        value: 'New Title',
        status: 'success'
      });
    });
  });

  describe('previewInjection', () => {
    it('should generate preview of data injection', () => {
      const mockLayers = [
        { name: '$title', type: 'Text', text: 'Old Title' },
        { name: '$price', type: 'Text', text: '$0' }
      ];

      const mockData = {
        title: 'New Title',
        price: '$99'
      };

      const preview = previewInjection(mockLayers, mockData);

      expect(preview).toHaveLength(2);
      expect(preview[0]).toMatchObject({
        layerName: '$title',
        layerType: 'Text',
        variableName: 'title',
        currentValue: 'Old Title',
        newValue: 'New Title',
        willUpdate: true
      });
    });

    it('should indicate when data is missing', () => {
      const mockLayers = [
        { name: '$title', type: 'Text', text: 'Old Title' }
      ];

      const mockData = {
        // title is missing
      };

      const preview = previewInjection(mockLayers, mockData);

      expect(preview[0].newValue).toBe('(no data)');
      expect(preview[0].willUpdate).toBe(false);
    });

    it('should handle symbol overrides', () => {
      const mockLayers = [
        {
          name: 'Symbol',
          type: 'SymbolInstance',
          overrides: [
            {
              id: 'override-1',
              affectedLayer: { name: '$symbolTitle' },
              value: 'Old'
            }
          ]
        }
      ];

      const mockData = {
        symbolTitle: 'New'
      };

      const preview = previewInjection(mockLayers, mockData);

      expect(preview[0].layerType).toBe('SymbolOverride');
      expect(preview[0].currentValue).toBe('(symbol override)');
      expect(preview[0].newValue).toBe('New');
    });

    it('should handle empty layers', () => {
      const preview = previewInjection([], {});
      expect(preview).toHaveLength(0);
    });
  });

  describe('validateData', () => {
    it('should validate data with all required keys', () => {
      const data = {
        title: 'Test',
        description: 'Description',
        price: '99'
      };

      const result = validateData(data, ['title', 'description', 'price']);

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Data is valid');
    });

    it('should invalidate data missing required keys', () => {
      const data = {
        title: 'Test'
      };

      const result = validateData(data, ['title', 'description', 'price']);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Missing required keys');
      expect(result.missingKeys).toEqual(['description', 'price']);
    });

    it('should invalidate non-object data', () => {
      const result = validateData('not an object', ['title']);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Data must be an object');
    });

    it('should invalidate null data', () => {
      const result = validateData(null, ['title']);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Data must be an object');
    });

    it('should handle empty required keys array', () => {
      const data = { title: 'Test' };
      const result = validateData(data, []);

      expect(result.isValid).toBe(true);
    });
  });
});
