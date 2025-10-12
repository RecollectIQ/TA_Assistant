import { defineStore } from 'pinia';
import { ref, watch, nextTick } from 'vue';

export type ThemeType = 'default' | 'modern' | 'glass' | 'neon';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeType>('default');
  const isReady = ref(false);

  const themes = {
    default: {
      name: '默认主题',
      description: '经典Element Plus风格',
      preview: '/themes/default.jpg',
    },
    modern: {
      name: '现代渐变',
      description: '动态渐变背景，现代商务风格',
      preview: '/themes/modern.jpg',
    },
    glass: {
      name: '毛玻璃',
      description: '半透明效果，高端科技感',
      preview: '/themes/glass.jpg',
    },
    neon: {
      name: '霓虹赛博',
      description: '深色霓虹，科幻游戏风格',
      preview: '/themes/neon.jpg',
    },
  };

  // Vue-compliant theme application using watch and nextTick
  const applyTheme = (theme: ThemeType) => {
    nextTick(() => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.className = `theme-${theme}`;
      }
    });
  };

  const setTheme = (theme: ThemeType) => {
    currentTheme.value = theme;
    applyTheme(theme);

    try {
      localStorage.setItem('ai-grader-theme', theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  // Reactive theme loading
  const loadTheme = () => {
    try {
      const saved = localStorage.getItem('ai-grader-theme') as ThemeType;
      if (saved && themes[saved]) {
        currentTheme.value = saved;
      } else {
        currentTheme.value = 'default';
      }
      isReady.value = true;
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      currentTheme.value = 'default';
      isReady.value = true;
    }
  };

  // Watch for theme changes and apply them reactively
  watch(currentTheme, (newTheme) => {
    if (isReady.value) {
      applyTheme(newTheme);
    }
  });

  // Initialize on store creation
  loadTheme();

  return {
    currentTheme,
    themes,
    setTheme,
    loadTheme,
    isReady,
  };
});
