import { defineStore } from 'pinia';
import type { ApiConfig } from '@/types/api';

export interface SavedConfig extends ApiConfig {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigManagerState {
  configs: SavedConfig[];
  activeConfigId: string | null;
}

export const useConfigManagerStore = defineStore('configManager', {
  state: (): ConfigManagerState => ({
    configs: [],
    activeConfigId: null,
  }),

  getters: {
    activeConfig(): SavedConfig | null {
      return (
        this.configs.find((config) => config.id === this.activeConfigId) || null
      );
    },

    configNames(): { id: string; name: string }[] {
      return this.configs.map((config) => ({
        id: config.id,
        name: config.name,
      }));
    },
  },

  actions: {
    loadConfigs() {
      try {
        const stored = localStorage.getItem('ai-grader-configs');
        if (stored) {
          const data = JSON.parse(stored);
          this.configs = data.configs || [];
          this.activeConfigId = data.activeConfigId || null;
        }
      } catch (error) {
        console.error('Failed to load configs:', error);
      }
    },

    saveConfigs() {
      try {
        const data = {
          configs: this.configs,
          activeConfigId: this.activeConfigId,
        };
        localStorage.setItem('ai-grader-configs', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save configs:', error);
      }
    },

    addConfig(name: string, config: ApiConfig): SavedConfig {
      const newConfig: SavedConfig = {
        ...config,
        id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.configs.push(newConfig);
      this.saveConfigs();
      return newConfig;
    },

    updateConfig(id: string, updates: Partial<SavedConfig>) {
      const index = this.configs.findIndex((config) => config.id === id);
      if (index !== -1) {
        this.configs[index] = {
          ...this.configs[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.saveConfigs();
      }
    },

    deleteConfig(id: string) {
      this.configs = this.configs.filter((config) => config.id !== id);
      if (this.activeConfigId === id) {
        this.activeConfigId =
          this.configs.length > 0 ? this.configs[0].id : null;
      }
      this.saveConfigs();
    },

    setActiveConfig(id: string) {
      if (this.configs.some((config) => config.id === id)) {
        this.activeConfigId = id;
        this.saveConfigs();
      }
    },

    getConfig(id: string): SavedConfig | null {
      return this.configs.find((config) => config.id === id) || null;
    },
  },
});
