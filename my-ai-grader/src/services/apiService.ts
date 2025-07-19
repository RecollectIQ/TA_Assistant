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

class ApiService {
  private baseUrl = '';

  // Configure API settings
  async configureApi(config: ConfigureApiRequest): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
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
      const response = await fetch('/api/test_connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
          modelName: config.modelName,
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
      const requestData: MultiAnalyzeRequest = { images };

      const response = await fetch('/api/analyze_multi_answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestData,
          apiUrl: apiConfig.apiUrl,
          apiKey: apiConfig.apiKey,
          modelName: apiConfig.modelName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Multi-image analysis failed');
      }

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
      const response = await fetch('/api/batch_grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestData,
          apiUrl: apiConfig.apiUrl,
          apiKey: apiConfig.apiKey,
          modelName: apiConfig.modelName,
        }),
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
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_image: studentImage,
          rubric,
          standard_answer: standardAnswer,
          apiUrl: apiConfig.apiUrl,
          apiKey: apiConfig.apiKey,
          modelName: apiConfig.modelName,
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

  // Get batch status
  async getBatchStatus(
    batchId: string,
    apiConfig: ApiConfig,
  ): Promise<ApiResponse> {
    try {
      const response = await fetch(`/api/batch_status/${batchId}?apiUrl=${encodeURIComponent(apiConfig.apiUrl)}&apiKey=${encodeURIComponent(apiConfig.apiKey)}&modelName=${encodeURIComponent(apiConfig.modelName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
