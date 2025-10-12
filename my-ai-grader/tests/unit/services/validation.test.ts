import { describe, it, expect } from 'vitest';
import { InputValidator } from '@/utils/validation';

describe('InputValidator', () => {
  describe('validateApiConfig', () => {
    it('should validate correct API config', () => {
      const config = {
        apiUrl: 'https://api.openai.com',
        apiKey: 'sk-test1234567890',
        modelName: 'gpt-4',
      };

      const result = InputValidator.validateApiConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid URL', () => {
      const config = {
        apiUrl: 'invalid-url',
        apiKey: 'sk-test1234567890',
        modelName: 'gpt-4',
      };

      const result = InputValidator.validateApiConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('apiUrl');
    });

    it('should reject short API key', () => {
      const config = {
        apiUrl: 'https://api.openai.com',
        apiKey: 'short',
        modelName: 'gpt-4',
      };

      const result = InputValidator.validateApiConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('apiKey');
    });
  });

  describe('validateFileUpload', () => {
    it('should validate correct image file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      const result = InputValidator.validateFileUpload(file);
      expect(result.isValid).toBe(true);
    });

    it('should reject large files', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 15 * 1024 * 1024 }); // 15MB

      const result = InputValidator.validateFileUpload(file);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe('size');
    });

    it('should reject invalid file types', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      const result = InputValidator.validateFileUpload(file);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe('type');
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML tags', () => {
      const input = '<script>alert("xss")</script>';
      const result = InputValidator.sanitizeInput(input);
      expect(result).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
      );
    });
  });

  describe('validateImages', () => {
    it('should validate image array', () => {
      const images = ['data:image/jpeg;base64,abc123'];
      const result = InputValidator.validateImages(images);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid image format', () => {
      const images = ['invalid-data'];
      const result = InputValidator.validateImages(images);
      expect(result.isValid).toBe(false);
    });
  });
});
