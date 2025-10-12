<template>
  <div class="theme-switcher">
    <el-dropdown placement="bottom-end" @command="handleThemeChange">
      <el-button class="theme-btn" type="text">
        <el-icon><Brush /></el-icon>
        主题
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="(theme, key) in themes"
            :key="key"
            :command="key"
            :class="{ 'is-active': currentTheme === key }"
          >
            <div class="theme-option">
              <div class="theme-preview" :class="`preview-${key}`"></div>
              <div class="theme-info">
                <span class="theme-name">{{ theme.name }}</span>
                <span class="theme-desc">{{ theme.description }}</span>
              </div>
              <el-icon v-if="currentTheme === key" class="check-icon">
                <Check />
              </el-icon>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Brush, ArrowDown, Check } from '@element-plus/icons-vue';
  import { useThemeStore, type ThemeType } from '@/stores/themeStore';
  import { ElMessage } from 'element-plus';

  const themeStore = useThemeStore();

  const currentTheme = computed(() => themeStore.currentTheme);
  const themes = computed(() => themeStore.themes);

  const handleThemeChange = (theme: ThemeType) => {
    themeStore.setTheme(theme);
    ElMessage.success(`已切换到${themes.value[theme].name}`);
  };
</script>

<style scoped>
  .theme-switcher {
    margin-left: 20px;
  }

  .theme-btn {
    color: var(--el-color-primary);
    padding: 8px 12px;
  }

  .theme-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    min-width: 250px;
  }

  .theme-preview {
    width: 30px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #ddd;
    flex-shrink: 0;
  }

  .preview-default {
    background: linear-gradient(45deg, #409eff, #67c23a);
  }

  .preview-modern {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .preview-glass {
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.8),
      rgba(255, 255, 255, 0.4)
    );
    border: 1px solid rgba(255, 255, 255, 0.6);
    position: relative;
  }

  .preview-glass::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, #667eea, #764ba2);
    opacity: 0.3;
    border-radius: 3px;
  }

  .preview-neon {
    background: #0a0a0a;
    border: 1px solid #00ffff;
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
    position: relative;
  }

  .preview-neon::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    background: linear-gradient(45deg, #00ffff, #ff00ff);
    opacity: 0.6;
    border-radius: 2px;
  }

  .theme-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .theme-name {
    font-weight: 500;
    margin-bottom: 2px;
    color: var(--el-text-color-primary);
  }

  .theme-desc {
    font-size: 0.8rem;
    color: var(--el-text-color-secondary);
  }

  .check-icon {
    color: var(--el-color-primary);
    flex-shrink: 0;
  }

  :deep(.el-dropdown-menu__item.is-active) {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }

  :deep(.el-dropdown-menu__item:hover) {
    background-color: var(--el-color-primary-light-9);
  }
</style>
