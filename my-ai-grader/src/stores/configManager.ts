import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ApiConfig } from '@/types/api';

export const useConfigManagerStore = defineStore('configManager', () => {
  // 配置存储
  const configs = ref<ApiConfig[]>([]);
  const activeConfigId = ref<string | null>(null);

  // 从localStorage加载
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('ai-grader-configs');
      if (stored) {
        const parsed = JSON.parse(stored);
        // 确保解析的数据是数组
        if (Array.isArray(parsed)) {
          configs.value = parsed;
        } else {
          console.warn('存储的配置数据不是数组，重置为空数组');
          configs.value = [];
        }
      } else {
        configs.value = [];
      }

      const activeId = localStorage.getItem('ai-grader-active-config');
      if (activeId && configs.value.find((c) => c.id === activeId)) {
        activeConfigId.value = activeId;
      }
    } catch (error) {
      console.error('Failed to load configs from storage:', error);
      // 发生错误时重置为空数组
      configs.value = [];
    }
  };

  // 保存到localStorage
  const saveToStorage = () => {
    try {
      console.log('保存配置到localStorage:', configs.value);
      localStorage.setItem('ai-grader-configs', JSON.stringify(configs.value));
      if (activeConfigId.value) {
        localStorage.setItem('ai-grader-active-config', activeConfigId.value);
      }
      console.log('配置保存到localStorage成功');
    } catch (error) {
      console.error('Failed to save configs to storage:', error);
      throw new Error(
        `保存配置失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  };

  // 当前活跃配置
  const activeConfig = computed(() => {
    if (!activeConfigId.value) return null;
    return configs.value.find((c) => c.id === activeConfigId.value) || null;
  });

  // 添加新配置
  const addConfig = (
    name: string,
    config: Omit<ApiConfig, 'id' | 'createdAt' | 'name'>,
  ) => {
    const newConfig: ApiConfig = {
      ...config,
      id: Date.now().toString(),
      name: name,
      createdAt: new Date().toISOString(),
    };
    configs.value.push(newConfig);
    saveToStorage();
    return newConfig;
  };

  // 更新配置
  const updateConfig = (id: string, config: Partial<ApiConfig>) => {
    // 确保 configs.value 是数组
    if (!Array.isArray(configs.value)) {
      console.error('configs.value 不是数组，重置为空数组');
      configs.value = [];
      return;
    }

    const index = configs.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      configs.value[index] = { ...configs.value[index], ...config };
      saveToStorage();
    } else {
      console.warn(`未找到ID为 ${id} 的配置`);
    }
  };

  // 删除配置
  const deleteConfig = (id: string) => {
    // 确保 configs.value 是数组
    if (!Array.isArray(configs.value)) {
      console.error('configs.value 不是数组，重置为空数组');
      configs.value = [];
      return;
    }

    configs.value = configs.value.filter((c) => c.id !== id);
    if (activeConfigId.value === id) {
      activeConfigId.value =
        configs.value.length > 0 ? configs.value[0].id! : null;
    }
    saveToStorage();
  };

  // Sync configuration to backend
  const syncToBackend = async (config: ApiConfig): Promise<boolean> => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
        }),
      });

      if (response.ok) {
        console.log('配置已同步到后端');
        return true;
      } else {
        console.warn('同步到后端失败');
        return false;
      }
    } catch (error) {
      console.error('后端同步失败:', error);
      return false;
    }
  };

  // 设置活跃配置
  const setActiveConfig = async (id: string): Promise<boolean> => {
    // 确保 configs.value 是数组
    if (!Array.isArray(configs.value)) {
      console.error('configs.value 不是数组，重置为空数组');
      configs.value = [];
      return false;
    }

    const config = configs.value.find((c) => c.id === id);
    if (config) {
      activeConfigId.value = id;
      saveToStorage();

      // Sync to backend
      await syncToBackend(config);
      return true;
    }
    return false;
  };

  // 获取配置
  const getConfig = (id: string) => {
    // 确保 configs.value 是数组
    if (!Array.isArray(configs.value)) {
      console.error('configs.value 不是数组，重置为空数组');
      configs.value = [];
      return undefined;
    }

    return configs.value.find((c) => c.id === id);
  };

  // 清理损坏的localStorage数据
  const clearCorruptedStorage = () => {
    try {
      localStorage.removeItem('ai-grader-configs');
      localStorage.removeItem('ai-grader-active-config');
      configs.value = [];
      activeConfigId.value = null;
      console.log('已清理损坏的配置数据');
    } catch (error) {
      console.error('清理配置数据失败:', error);
    }
  };

  // 初始化
  loadFromStorage();

  return {
    configs,
    activeConfig,
    activeConfigId,
    addConfig,
    updateConfig,
    deleteConfig,
    setActiveConfig,
    getConfig,
    loadFromStorage,
    clearCorruptedStorage,
    syncToBackend,
  };
});
