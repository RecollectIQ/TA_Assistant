export interface ApiConfig {
  id?: string;
  apiUrl: string;
  apiKey: string;
  modelName: string;
  maxTokens?: number;
  timeout?: number;
  createdAt?: string;
  name?: string;
}

export interface ApiTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ConfigureApiRequest {
  apiUrl: string;
  apiKey: string;
  modelName: string;
  maxTokens?: number;
  timeout?: number;
}

export interface TestConnectionRequest {
  apiUrl: string;
  apiKey: string;
  modelName: string;
}
