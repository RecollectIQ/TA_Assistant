import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ApiConfig } from '@/types/api';

const STORAGE_KEY = 'ai-grader-api-config';
const DEFAULT_CONFIG: ApiConfig = {
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  modelName: 'gpt-4o',
  maxTokens: 8192,
  timeout: 30000,
};

export const useApiConfigStore = defineStore('apiConfig', () => {
  // State
  const apiConfig = ref<ApiConfig>(DEFAULT_CONFIG);
  const isConfigured = ref(false);
  const connectionStatus = ref<'untested' | 'testing' | 'success' | 'failed'>(
    'untested',
  );
  const lastTestError = ref<string | null>(null);
  const isTestingConnection = ref(false);

  // Getters
  const isValidConfig = computed(() => {
    return !!(
      apiConfig.value.apiUrl.trim() &&
      apiConfig.value.apiKey.trim() &&
      apiConfig.value.modelName.trim()
    );
  });

  const shouldShowConfigPrompt = computed(() => {
    return !isConfigured.value || !isValidConfig.value;
  });

  // Actions
  const loadApiConfig = (): ApiConfig | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        apiConfig.value = { ...DEFAULT_CONFIG, ...config };
        isConfigured.value = true;
        return apiConfig.value;
      }
    } catch (error) {
      console.error('Failed to load API config from localStorage:', error);
    }
    return null;
  };

  const saveApiConfig = (config: ApiConfig): void => {
    try {
      apiConfig.value = config;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      isConfigured.value = true;
      connectionStatus.value = 'untested';
      lastTestError.value = null;
    } catch (error) {
      console.error('Failed to save API config to localStorage:', error);
      throw new Error('Failed to save configuration');
    }
  };

  const clearConfig = (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      apiConfig.value = { ...DEFAULT_CONFIG };
      isConfigured.value = false;
      connectionStatus.value = 'untested';
      lastTestError.value = null;
    } catch (error) {
      console.error('Failed to clear API config:', error);
    }
  };

  const testConnection = async (config?: ApiConfig): Promise<boolean> => {
    const testConfig = config || apiConfig.value;

    if (!isValidConfig.value && !config) {
      connectionStatus.value = 'failed';
      lastTestError.value = 'Invalid configuration';
      return false;
    }

    isTestingConnection.value = true;
    connectionStatus.value = 'testing';
    lastTestError.value = null;

    try {
      // Test API connection with a simple request
      const response = await fetch(testConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: testConfig.modelName,
          messages: [
            {
              role: 'user',
              content: 'Test connection - please respond with "OK"',
            },
          ],
          max_tokens: 5,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        connectionStatus.value = 'success';
        lastTestError.value = null;
        return true;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      connectionStatus.value = 'failed';
      lastTestError.value =
        error instanceof Error ? error.message : 'Connection failed';
      return false;
    } finally {
      isTestingConnection.value = false;
    }
  };

  const updateConfig = (updates: Partial<ApiConfig>): void => {
    const newConfig = { ...apiConfig.value, ...updates };
    saveApiConfig(newConfig);
  };

  const resetToDefaults = (): void => {
    saveApiConfig(DEFAULT_CONFIG);
  };

  // Initialize store
  const initialize = (): void => {
    loadApiConfig();
  };

  return {
    // State
    apiConfig,
    isConfigured,
    connectionStatus,
    lastTestError,
    isTestingConnection,

    // Getters
    isValidConfig,
    shouldShowConfigPrompt,

    // Actions
    loadApiConfig,
    saveApiConfig,
    clearConfig,
    testConnection,
    updateConfig,
    resetToDefaults,
    initialize,
  };
});
