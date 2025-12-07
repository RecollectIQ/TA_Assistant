import type {
  ApiConfig,
  ApiResponse,
  TestConnectionRequest,
  ConfigureApiRequest,
} from '@/types/api';
import type {
  MultiAnalyzeRequest,
  MultiAnalyzeResponse,
  BatchGradeRequest,
  BatchGradeResponse,
} from '@/types/grading';
import { InputValidator } from '@/utils/validation';
import { cacheService } from '@/services/cacheService';
import { asyncProcessor } from '@/services/asyncProcessor';

class ApiService {
  // Configure API settings
  async configureApi(config: ConfigureApiRequest): Promise<ApiResponse> {
    try {
      const sanitizedConfig = InputValidator.sanitizeConfig(config);
      const validation = InputValidator.validateApiConfig(sanitizedConfig);

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.map((e) => e.message).join(', '),
          timestamp: new Date().toISOString(),
        };
      }

      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedConfig),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Configuration failed');
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Configuration error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Test API connection
  async testConnection(config: TestConnectionRequest): Promise<ApiResponse> {
    try {
      const sanitizedConfig = InputValidator.sanitizeConfig(config);
      const validation = InputValidator.validateApiConfig(sanitizedConfig);

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.map((e) => e.message).join(', '),
          timestamp: new Date().toISOString(),
        };
      }

      const response = await fetch('/api/test_connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiUrl: sanitizedConfig.apiUrl,
          apiKey: sanitizedConfig.apiKey,
          modelName: sanitizedConfig.modelName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Connection test failed');
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Analyze multi-image standard answer
  async analyzeMultiAnswer(
    images: MultiAnalyzeRequest['images'],
    apiConfig: ApiConfig,
  ): Promise<ApiResponse<MultiAnalyzeResponse>> {
    try {
      const sanitizedConfig = InputValidator.sanitizeConfig(apiConfig);
      const configValidation =
        InputValidator.validateApiConfig(sanitizedConfig);
      const imageValidation = InputValidator.validateImages(images);

      if (!configValidation.isValid) {
        return {
          success: false,
          error: configValidation.errors.map((e) => e.message).join(', '),
          timestamp: new Date().toISOString(),
        };
      }

      if (!imageValidation.isValid) {
        return {
          success: false,
          error: imageValidation.errors.map((e) => e.message).join(', '),
          timestamp: new Date().toISOString(),
        };
      }

      // Check cache first
      const cacheKey = cacheService.generateKey('analysis', { images });
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          timestamp: new Date().toISOString(),
        };
      }

      const requestData: MultiAnalyzeRequest = { images };

      const response = await fetch('/api/analyze_multi_answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': sanitizedConfig.apiKey,
          'X-API-Url': sanitizedConfig.apiUrl,
          'X-Model-Name': sanitizedConfig.modelName,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Multi-image analysis failed');
      }

      // Cache the result
      cacheService.set(cacheKey, data, 2 * 60 * 60 * 1000); // 2 hours

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Batch grade student submissions
  async batchGrade(
    requestData: BatchGradeRequest,
    apiConfig: ApiConfig,
  ): Promise<ApiResponse<BatchGradeResponse>> {
    try {
      const sanitizedConfig = InputValidator.sanitizeConfig(apiConfig);
      const configValidation =
        InputValidator.validateApiConfig(sanitizedConfig);
      const requestValidation =
        InputValidator.validateBatchGradeRequest(requestData);

      if (!configValidation.isValid) {
        return {
          success: false,
          error: configValidation.errors.map((e) => e.message).join(', '),
          timestamp: new Date().toISOString(),
        };
      }

      if (!requestValidation.isValid) {
        return {
          success: false,
          error: requestValidation.errors.map((e) => e.message).join(', '),
          timestamp: new Date().toISOString(),
        };
      }

      const response = await fetch('/api/batch_grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': sanitizedConfig.apiKey,
          'X-API-Url': sanitizedConfig.apiUrl,
          'X-Model-Name': sanitizedConfig.modelName,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Batch grading failed');
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch grading error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Legacy single-image grading
  async gradeSingleAnswer(
    studentImage: string,
    rubric: string,
    standardAnswer: string,
    apiConfig: ApiConfig,
  ): Promise<ApiResponse<{ feedback: string }>> {
    try {
      const sanitizedConfig = InputValidator.sanitizeConfig(apiConfig);
      const configValidation =
        InputValidator.validateApiConfig(sanitizedConfig);

      if (!configValidation.isValid) {
        return {
          success: false,
          error: configValidation.errors.map((e) => e.message).join(', '),
          timestamp: new Date().toISOString(),
        };
      }

      if (!studentImage || typeof studentImage !== 'string') {
        return {
          success: false,
          error: 'Student image is required',
          timestamp: new Date().toISOString(),
        };
      }

      if (!rubric || typeof rubric !== 'string') {
        return {
          success: false,
          error: 'Rubric is required',
          timestamp: new Date().toISOString(),
        };
      }

      if (!standardAnswer || typeof standardAnswer !== 'string') {
        return {
          success: false,
          error: 'Standard answer is required',
          timestamp: new Date().toISOString(),
        };
      }

      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': sanitizedConfig.apiKey,
          'X-API-Url': sanitizedConfig.apiUrl,
          'X-Model-Name': sanitizedConfig.modelName,
        },
        body: JSON.stringify({
          student_image: studentImage,
          rubric: InputValidator.sanitizeInput(rubric),
          standard_answer: InputValidator.sanitizeInput(standardAnswer),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Grading failed');
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Grading error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Health check for API
  async healthCheck(apiConfig: ApiConfig): Promise<ApiResponse> {
    return await this.testConnection({
      apiUrl: apiConfig.apiUrl,
      apiKey: apiConfig.apiKey,
      modelName: apiConfig.modelName,
    });
  }

  // Async processing methods
  async batchGradeAsync(
    requestData: BatchGradeRequest,
    apiConfig: ApiConfig,
  ): Promise<string> {
    const sanitizedConfig = InputValidator.sanitizeConfig(apiConfig);
    const configValidation = InputValidator.validateApiConfig(sanitizedConfig);
    const requestValidation =
      InputValidator.validateBatchGradeRequest(requestData);

    if (!configValidation.isValid || !requestValidation.isValid) {
      throw new Error('Invalid configuration or request data');
    }

    return await asyncProcessor.processBatch(
      requestData,
      apiConfig,
      this.batchGrade.bind(this),
    );
  }

  async analyzeMultiAnswerAsync(
    images: MultiAnalyzeRequest['images'],
    apiConfig: ApiConfig,
  ): Promise<string> {
    const sanitizedConfig = InputValidator.sanitizeConfig(apiConfig);
    const configValidation = InputValidator.validateApiConfig(sanitizedConfig);
    const imageValidation = InputValidator.validateImages(images);

    if (!configValidation.isValid || !imageValidation.isValid) {
      throw new Error('Invalid configuration or images');
    }

    return await asyncProcessor.processAnalysis(
      images,
      apiConfig,
      this.analyzeMultiAnswer.bind(this),
    );
  }

  getProcessingStatus(taskId: string) {
    return asyncProcessor.getTask(taskId);
  }

  getAllProcessingTasks() {
    return asyncProcessor.getAllTasks();
  }

  cancelProcessingTask(taskId: string): boolean {
    return asyncProcessor.cancelTask(taskId);
  }

  // Get batch status
  async getBatchStatus(
    batchId: string,
    apiConfig: ApiConfig,
  ): Promise<ApiResponse> {
    try {
      const response = await fetch(`/api/batch_status/${batchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiConfig.apiKey,
          'X-API-Url': apiConfig.apiUrl,
          'X-Model-Name': apiConfig.modelName,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get batch status');
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Status check error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const apiService = new ApiService();
