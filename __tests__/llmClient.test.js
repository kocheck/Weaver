/**
 * Tests for LLM Client Utility
 */

import { generateMockData, testConnection } from '../src/utils/llmClient';

// Mock fetch globally
global.fetch = jest.fn();

describe('LLM Client', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('generateMockData', () => {
    it('should successfully generate mock data', async () => {
      const mockResponse = {
        response: JSON.stringify({
          title: 'Cyber Ramen',
          description: 'Neon-infused noodles with synthetic proteins',
          price: '45 credits'
        })
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generateMockData({
        keys: ['title', 'description', 'price'],
        prompt: 'Menu items for a cyberpunk noodle bar'
      });

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('price');
      expect(result.title).toBe('Cyber Ramen');
    });

    it('should handle JSON wrapped in markdown code blocks', async () => {
      const mockResponse = {
        response: '```json\n{"title": "Test", "price": "10"}\n```'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generateMockData({
        keys: ['title', 'price'],
        prompt: 'Test items'
      });

      expect(result.title).toBe('Test');
      expect(result.price).toBe('10');
    });

    it('should throw error if keys array is empty', async () => {
      await expect(
        generateMockData({
          keys: [],
          prompt: 'Test prompt'
        })
      ).rejects.toThrow('Keys array is required and must not be empty');
    });

    it('should throw error if prompt is empty', async () => {
      await expect(
        generateMockData({
          keys: ['title'],
          prompt: ''
        })
      ).rejects.toThrow('Prompt is required and must be a non-empty string');
    });

    it('should throw error on HTTP error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error'
      });

      await expect(
        generateMockData({
          keys: ['title'],
          prompt: 'Test'
        })
      ).rejects.toThrow('HTTP 500');
    });

    it('should throw error on invalid JSON response', async () => {
      const mockResponse = {
        response: 'This is not valid JSON'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await expect(
        generateMockData({
          keys: ['title'],
          prompt: 'Test'
        })
      ).rejects.toThrow('Failed to parse JSON');
    });

    it('should throw error on network failure', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        generateMockData({
          keys: ['title'],
          prompt: 'Test'
        })
      ).rejects.toThrow();
    });

    it('should handle timeout', async () => {
      // Mock a delayed response
      global.fetch.mockImplementationOnce(() =>
        new Promise(() => {}) // Never resolves
      );

      const promise = generateMockData({
        keys: ['title'],
        prompt: 'Test'
      });

      // Fast-forward time
      jest.useFakeTimers();
      setTimeout(() => {
        jest.advanceTimersByTime(61000);
      }, 0);

      await expect(promise).rejects.toThrow();
      jest.useRealTimers();
    });

    it('should use custom endpoint and model', async () => {
      const mockResponse = {
        response: JSON.stringify({ title: 'Test' })
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await generateMockData({
        keys: ['title'],
        prompt: 'Test',
        endpoint: 'http://custom:11434/api/generate',
        model: 'llama3.1'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://custom:11434/api/generate',
        expect.objectContaining({
          method: 'POST'
        })
      );

      const callArgs = global.fetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.model).toBe('llama3.1');
    });

    it('should warn about missing keys in response', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const mockResponse = {
        response: JSON.stringify({ title: 'Test' })
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await generateMockData({
        keys: ['title', 'description', 'price'],
        prompt: 'Test'
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing keys')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('testConnection', () => {
    it('should return true on successful connection', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true
      });

      const result = await testConnection();
      expect(result).toBe(true);
    });

    it('should return false on failed connection', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await testConnection();
      expect(result).toBe(false);
    });

    it('should return false on non-ok response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false
      });

      const result = await testConnection();
      expect(result).toBe(false);
    });

    it('should use custom endpoint', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true
      });

      await testConnection('http://custom:11434/api/generate');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://custom:11434/api/tags',
        expect.any(Object)
      );
    });
  });
});
