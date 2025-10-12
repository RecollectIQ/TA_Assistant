export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'size' | 'type' | 'security';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class InputValidator {
  // API configuration validation
  static validateApiConfig(config: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!config || typeof config !== 'object') {
      errors.push({
        field: 'config',
        message: 'Configuration is required',
        type: 'required',
      });
      return { isValid: false, errors };
    }

    if (!config.apiUrl || typeof config.apiUrl !== 'string') {
      errors.push({
        field: 'apiUrl',
        message: 'API URL is required',
        type: 'required',
      });
    } else {
      try {
        new URL(config.apiUrl);
      } catch {
        errors.push({
          field: 'apiUrl',
          message: 'Invalid URL format',
          type: 'format',
        });
      }
    }

    if (!config.apiKey || typeof config.apiKey !== 'string') {
      errors.push({
        field: 'apiKey',
        message: 'API key is required',
        type: 'required',
      });
    } else if (config.apiKey.length < 10) {
      errors.push({
        field: 'apiKey',
        message: 'API key appears to be invalid',
        type: 'format',
      });
    }

    if (!config.modelName || typeof config.modelName !== 'string') {
      errors.push({
        field: 'modelName',
        message: 'Model name is required',
        type: 'required',
      });
    }

    return { isValid: errors.length === 0, errors };
  }

  // Image validation
  static validateImages(images: any[]): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Array.isArray(images) || images.length === 0) {
      errors.push({
        field: 'images',
        message: 'At least one image is required',
        type: 'required',
      });
      return { isValid: false, errors };
    }

    if (images.length > 50) {
      errors.push({
        field: 'images',
        message: 'Maximum 50 images allowed',
        type: 'size',
      });
    }

    images.forEach((image, index) => {
      if (!image || typeof image !== 'string') {
        errors.push({
          field: `images[${index}]`,
          message: 'Invalid image data',
          type: 'format',
        });
      } else if (!image.startsWith('data:image/')) {
        errors.push({
          field: `images[${index}]`,
          message: 'Invalid image format',
          type: 'format',
        });
      }

      // Check base64 size (rough estimation)
      const base64Length = image.length - (image.indexOf(',') + 1);
      const sizeInBytes = base64Length * 0.75;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      if (sizeInMB > 10) {
        errors.push({
          field: `images[${index}]`,
          message: 'Image size exceeds 10MB limit',
          type: 'size',
        });
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  // Batch grading request validation
  static validateBatchGradeRequest(request: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!request || typeof request !== 'object') {
      errors.push({
        field: 'request',
        message: 'Request data is required',
        type: 'required',
      });
      return { isValid: false, errors };
    }

    if (!request.standardAnswer || typeof request.standardAnswer !== 'string') {
      errors.push({
        field: 'standardAnswer',
        message: 'Standard answer is required',
        type: 'required',
      });
    } else if (request.standardAnswer.length > 5000) {
      errors.push({
        field: 'standardAnswer',
        message: 'Standard answer too long (max 5000 chars)',
        type: 'size',
      });
    }

    if (!request.rubric || typeof request.rubric !== 'string') {
      errors.push({
        field: 'rubric',
        message: 'Rubric is required',
        type: 'required',
      });
    } else if (request.rubric.length > 2000) {
      errors.push({
        field: 'rubric',
        message: 'Rubric too long (max 2000 chars)',
        type: 'size',
      });
    }

    if (!Array.isArray(request.studentSubmissions)) {
      errors.push({
        field: 'studentSubmissions',
        message: 'Student submissions must be an array',
        type: 'type',
      });
    } else if (request.studentSubmissions.length === 0) {
      errors.push({
        field: 'studentSubmissions',
        message: 'At least one student submission is required',
        type: 'required',
      });
    } else if (request.studentSubmissions.length > 100) {
      errors.push({
        field: 'studentSubmissions',
        message: 'Maximum 100 submissions allowed',
        type: 'size',
      });
    }

    request.studentSubmissions?.forEach((submission: any, index: number) => {
      if (!submission || typeof submission !== 'object') {
        errors.push({
          field: `studentSubmissions[${index}]`,
          message: 'Invalid submission format',
          type: 'format',
        });
      } else {
        if (!submission.image || typeof submission.image !== 'string') {
          errors.push({
            field: `studentSubmissions[${index}].image`,
            message: 'Submission image is required',
            type: 'required',
          });
        }

        if (
          submission.studentName &&
          typeof submission.studentName !== 'string'
        ) {
          errors.push({
            field: `studentSubmissions[${index}].studentName`,
            message: 'Student name must be a string',
            type: 'type',
          });
        }

        if (submission.studentName && submission.studentName.length > 100) {
          errors.push({
            field: `studentSubmissions[${index}].studentName`,
            message: 'Student name too long (max 100 chars)',
            type: 'size',
          });
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  // Security validation for file uploads
  static validateFileUpload(file: File): ValidationResult {
    const errors: ValidationError[] = [];

    if (!file) {
      errors.push({
        field: 'file',
        message: 'File is required',
        type: 'required',
      });
      return { isValid: false, errors };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push({
        field: 'file',
        message: 'Only JPEG, PNG, GIF, and WebP images are allowed',
        type: 'type',
      });
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push({
        field: 'file',
        message: 'File size exceeds 10MB limit',
        type: 'size',
      });
    }

    // Check filename for security
    const filename = file.name;
    if (filename.length > 255) {
      errors.push({
        field: 'file',
        message: 'Filename too long',
        type: 'size',
      });
    }

    // Check for suspicious patterns - avoid control characters
    const invalidChars = [
      '\u0000',
      '\u0001',
      '\u0002',
      '\u0003',
      '\u0004',
      '\u0005',
      '\u0006',
      '\u0007',
      '\u0008',
      '\u0009',
      '\u000A',
      '\u000B',
      '\u000C',
      '\u000D',
      '\u000E',
      '\u000F',
      '\u0010',
      '\u0011',
      '\u0012',
      '\u0013',
      '\u0014',
      '\u0015',
      '\u0016',
      '\u0017',
      '\u0018',
      '\u0019',
      '\u001A',
      '\u001B',
      '\u001C',
      '\u001D',
      '\u001E',
      '\u001F',
      '\u007F',
      '<',
      '>',
      ':',
      '*',
      '?',
      '"',
      '|',
    ];
    const hasInvalidChars = invalidChars.some((char) =>
      filename.includes(char),
    );
    if (hasInvalidChars) {
      errors.push({
        field: 'file',
        message: 'Filename contains invalid characters',
        type: 'security',
      });
    }

    return { isValid: errors.length === 0, errors };
  }

  // Sanitize input to prevent XSS
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate and sanitize configuration
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  static sanitizeConfig(config: any): any {
    const sanitized = { ...config };

    if (sanitized.apiUrl) {
      sanitized.apiUrl = sanitized.apiUrl.trim();
    }

    if (sanitized.apiKey) {
      // Don't log or expose the actual API key
      sanitized.apiKey = sanitized.apiKey.trim();
    }

    if (sanitized.modelName) {
      sanitized.modelName = this.sanitizeInput(sanitized.modelName.trim());
    }

    return sanitized;
  }
}
