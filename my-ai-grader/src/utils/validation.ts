import type { FileValidationResult, ValidationRule } from '@/types/common';

export function validateFile(
  file: File,
  rules: ValidationRule[],
): FileValidationResult {
  for (const rule of rules) {
    switch (rule.type) {
      case 'size':
        if (rule.maxSize && file.size > rule.maxSize) {
          return {
            isValid: false,
            error: `File size must be less than ${formatFileSize(rule.maxSize)}`,
          };
        }
        break;

      case 'type':
        if (rule.allowedTypes && !rule.allowedTypes.includes(file.type)) {
          const allowed = rule.allowedTypes.join(', ');
          return {
            isValid: false,
            error: `File type must be one of: ${allowed}`,
          };
        }
        break;

      case 'count':
        // This is handled at the collection level
        break;

      case 'dimensions':
        // Image dimensions validation is handled separately
        break;
    }
  }

  return { isValid: true };
}

export function validateApiUrl(url: string): FileValidationResult {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:'
      ? { isValid: true }
      : { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

export function validateApiKey(key: string): FileValidationResult {
  if (!key || key.trim().length === 0) {
    return { isValid: false, error: 'API key is required' };
  }

  if (key.length < 10) {
    return { isValid: false, error: 'API key appears to be too short' };
  }

  return { isValid: true };
}

export function validateModelName(model: string): FileValidationResult {
  const validModels = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
  ];

  if (!model || model.trim().length === 0) {
    return { isValid: false, error: 'Model name is required' };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
}
