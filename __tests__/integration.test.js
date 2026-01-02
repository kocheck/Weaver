/**
 * Integration Tests
 *
 * Tests the complete flow from layer detection to data injection
 */

import { findVariableLayers, extractVariableNames } from '../src/utils/layerTraversal';
import { injectData } from '../src/utils/dataInjector';

// Mock fetch for integration tests
global.fetch = jest.fn();

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete workflow', () => {
    it('should handle complete mock data generation workflow', async () => {
      // Step 1: Create mock Sketch layers
      const mockLayers = [
        {
          name: 'Card Group',
          type: 'Group',
          layers: [
            { name: '$cardTitle', type: 'Text', text: 'Placeholder Title' },
            { name: '$description', type: 'Text', text: 'Placeholder Description' },
            { name: '$price', type: 'Text', text: '$0' }
          ]
        },
        {
          name: 'Symbol Instance',
          type: 'SymbolInstance',
          overrides: [
            {
              id: 'override-1',
              affectedLayer: { name: '$author' },
              value: 'Unknown'
            }
          ]
        }
      ];

      // Step 2: Extract variable names
      const variableNames = extractVariableNames(mockLayers);
      expect(variableNames).toHaveLength(4);
      expect(variableNames).toContain('cardTitle');
      expect(variableNames).toContain('description');
      expect(variableNames).toContain('price');
      expect(variableNames).toContain('author');

      // Step 3: Simulate generated data from LLM
      const generatedData = {
        cardTitle: 'Cyber Ramen Deluxe',
        description: 'Neon-infused noodles with synthetic proteins',
        price: '45 credits',
        author: 'Chef Tanaka'
      };

      // Step 4: Inject data into layers
      const result = injectData(mockLayers, generatedData);

      // Step 5: Verify results
      expect(result.successCount).toBe(4);
      expect(result.failureCount).toBe(0);

      // Verify text layers were updated
      expect(mockLayers[0].layers[0].text).toBe('Cyber Ramen Deluxe');
      expect(mockLayers[0].layers[1].text).toBe('Neon-infused noodles with synthetic proteins');
      expect(mockLayers[0].layers[2].text).toBe('45 credits');

      // Verify symbol override was updated
      expect(mockLayers[1].overrides[0].value).toBe('Chef Tanaka');
    });

    it('should handle partial data matches', async () => {
      const mockLayers = [
        { name: '$title', type: 'Text', text: 'Old' },
        { name: '$subtitle', type: 'Text', text: 'Old' },
        { name: '$description', type: 'Text', text: 'Old' }
      ];

      // Only provide data for some variables
      const partialData = {
        title: 'New Title',
        description: 'New Description'
        // subtitle is missing
      };

      const result = injectData(mockLayers, partialData);

      expect(result.successCount).toBe(2);
      expect(mockLayers[0].text).toBe('New Title');
      expect(mockLayers[1].text).toBe('Old'); // Unchanged
      expect(mockLayers[2].text).toBe('New Description');
    });

    it('should handle complex nested layer structures', () => {
      const complexLayers = [
        {
          name: 'Page',
          type: 'Page',
          layers: [
            {
              name: 'Artboard',
              type: 'Artboard',
              layers: [
                {
                  name: 'Group 1',
                  type: 'Group',
                  layers: [
                    { name: '$header', type: 'Text', text: 'Header' },
                    {
                      name: 'Nested Group',
                      type: 'Group',
                      layers: [
                        { name: '$nested', type: 'Text', text: 'Nested' }
                      ]
                    }
                  ]
                },
                {
                  name: 'Group 2',
                  type: 'Group',
                  layers: [
                    { name: '$footer', type: 'Text', text: 'Footer' }
                  ]
                }
              ]
            }
          ]
        }
      ];

      const data = {
        header: 'New Header',
        nested: 'New Nested',
        footer: 'New Footer'
      };

      const result = injectData(complexLayers, data);

      expect(result.successCount).toBe(3);
    });

    it('should handle mixed variable and non-variable layers', () => {
      const mixedLayers = [
        { name: 'normalLayer1', type: 'Text', text: 'Normal 1' },
        { name: '$variable1', type: 'Text', text: 'Var 1' },
        { name: 'normalLayer2', type: 'Text', text: 'Normal 2' },
        { name: '$variable2', type: 'Text', text: 'Var 2' },
        { name: 'normalLayer3', type: 'Text', text: 'Normal 3' }
      ];

      const data = {
        variable1: 'Updated Var 1',
        variable2: 'Updated Var 2'
      };

      const result = injectData(mixedLayers, data);

      expect(result.successCount).toBe(2);
      expect(mixedLayers[0].text).toBe('Normal 1'); // Unchanged
      expect(mixedLayers[1].text).toBe('Updated Var 1');
      expect(mixedLayers[2].text).toBe('Normal 2'); // Unchanged
      expect(mixedLayers[3].text).toBe('Updated Var 2');
      expect(mixedLayers[4].text).toBe('Normal 3'); // Unchanged
    });

    it('should find all variable layers in a realistic Sketch structure', () => {
      const realisticStructure = [
        {
          name: 'Product Card',
          type: 'Group',
          layers: [
            { name: 'Background', type: 'Rectangle' },
            { name: '$productName', type: 'Text', text: 'Product' },
            { name: '$productPrice', type: 'Text', text: '$0' },
            {
              name: 'Details',
              type: 'Group',
              layers: [
                { name: '$description', type: 'Text', text: 'Description' },
                { name: '$rating', type: 'Text', text: '0' }
              ]
            },
            {
              name: 'Author Symbol',
              type: 'SymbolInstance',
              overrides: [
                {
                  id: 'author-name',
                  affectedLayer: { name: '$authorName' },
                  value: 'Author'
                },
                {
                  id: 'author-role',
                  affectedLayer: { name: '$authorRole' },
                  value: 'Role'
                }
              ]
            }
          ]
        }
      ];

      const variableLayers = findVariableLayers(realisticStructure);

      expect(variableLayers).toHaveLength(6);

      const variableNames = variableLayers.map(v => v.variableName);
      expect(variableNames).toContain('productName');
      expect(variableNames).toContain('productPrice');
      expect(variableNames).toContain('description');
      expect(variableNames).toContain('rating');
      expect(variableNames).toContain('authorName');
      expect(variableNames).toContain('authorRole');
    });
  });

  describe('Error handling', () => {
    it('should handle layers with undefined properties gracefully', () => {
      const problematicLayers = [
        { name: undefined, type: 'Text', text: 'Test' },
        { name: null, type: 'Text', text: 'Test' },
        { name: '$valid', type: 'Text', text: 'Test' }
      ];

      const variableLayers = findVariableLayers(problematicLayers);

      expect(variableLayers).toHaveLength(1);
      expect(variableLayers[0].variableName).toBe('valid');
    });

    it('should handle empty overrides array', () => {
      const layersWithEmptyOverrides = [
        {
          name: 'Symbol',
          type: 'SymbolInstance',
          overrides: []
        }
      ];

      const variableLayers = findVariableLayers(layersWithEmptyOverrides);
      expect(variableLayers).toHaveLength(0);
    });

    it('should handle symbol without overrides property', () => {
      const symbolWithoutOverrides = [
        {
          name: 'Symbol',
          type: 'SymbolInstance'
          // No overrides property
        }
      ];

      expect(() => findVariableLayers(symbolWithoutOverrides)).not.toThrow();
    });
  });
});
