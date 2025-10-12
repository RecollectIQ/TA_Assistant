<template>
  <div class="glass-config">
    <!-- Background -->
    <div class="glass-background">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <!-- Main Content -->
    <div class="glass-container">
      <div class="glass-header">
        <div class="header-icon">
          <el-icon :size="40"><Setting /></el-icon>
        </div>
        <h1>API 配置中心</h1>
        <p>配置您的AI模型接口</p>
      </div>

      <!-- Configuration Form -->
      <div class="glass-card main-card">
        <div class="card-header">
          <h2>基础配置</h2>
          <div class="header-actions">
            <el-button
              type="primary"
              class="glass-btn"
              :loading="isTesting"
              @click="handleTest"
            >
              <el-icon><Connection /></el-icon>
              测试连接
            </el-button>
          </div>
        </div>

        <el-form
          ref="configForm"
          :model="formData"
          :rules="validationRules"
          label-width="120px"
          class="glass-form"
        >
          <!-- API URL -->
          <div class="form-group">
            <label class="glass-label">API 地址</label>
            <div class="glass-input-wrapper">
              <el-input
                v-model="formData.apiUrl"
                placeholder="https://api.openai.com/v1/chat/completions"
                class="glass-input"
                :prefix-icon="Link"
              />
            </div>
          </div>

          <!-- API Key -->
          <div class="form-group">
            <label class="glass-label">API 密钥</label>
            <div class="glass-input-wrapper">
              <el-input
                v-model="formData.apiKey"
                type="password"
                placeholder="sk-..."
                show-password
                class="glass-input"
                :prefix-icon="Key"
              />
            </div>
          </div>

          <!-- Model Selection -->
          <div class="form-group">
            <label class="glass-label">AI 模型</label>
            <div class="glass-input-wrapper">
              <el-input
                v-model="formData.modelName"
                placeholder="选择或输入模型名称"
                class="glass-input"
                :prefix-icon="Cpu"
              />
            </div>

            <!-- Model Tags -->
            <div class="model-tags">
              <div
                v-for="model in popularModels"
                :key="model.name"
                class="model-tag"
                :class="{ active: formData.modelName === model.name }"
                @click="formData.modelName = model.name"
              >
                <div class="tag-icon" :style="{ background: model.color }">
                  <el-icon><component :is="model.icon" /></el-icon>
                </div>
                <div class="tag-content">
                  <span class="tag-name">{{ model.name }}</span>
                  <span class="tag-desc">{{ model.description }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div class="form-group">
            <label class="glass-label">高级设置</label>
            <div class="advanced-grid">
              <div class="advanced-item">
                <span class="advanced-label">最大Token</span>
                <el-input-number
                  v-model="formData.maxTokens"
                  :min="100"
                  :max="32000"
                  :step="100"
                  class="glass-number"
                />
              </div>
              <div class="advanced-item">
                <span class="advanced-label">超时时间(ms)</span>
                <el-input-number
                  v-model="formData.timeout"
                  :min="5000"
                  :max="120000"
                  :step="5000"
                  class="glass-number"
                />
              </div>
            </div>
          </div>
        </el-form>

        <!-- Connection Status -->
        <div v-if="connectionStatus" class="connection-status">
          <div class="status-indicator" :class="connectionStatus.type">
            <el-icon>
              <Check v-if="connectionStatus.type === 'success'" />
              <Close v-else-if="connectionStatus.type === 'error'" />
              <Loading v-else />
            </el-icon>
          </div>
          <div class="status-content">
            <h4>{{ connectionStatus.title }}</h4>
            <p>{{ connectionStatus.message }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <el-button class="glass-btn secondary" @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button
            type="primary"
            class="glass-btn primary"
            :loading="isSaving"
            @click="handleSave"
          >
            <el-icon><Check /></el-icon>
            保存配置
          </el-button>
        </div>
      </div>

      <!-- Saved Configurations -->
      <div class="glass-card configs-card">
        <div class="card-header">
          <h2>已保存配置</h2>
          <el-button class="glass-btn small" @click="showSaveDialog = true">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>

        <div v-if="savedConfigs.length === 0" class="empty-state">
          <div class="empty-icon">
            <el-icon :size="60"><Document /></el-icon>
          </div>
          <h3>暂无保存的配置</h3>
          <p>创建您的第一个配置</p>
        </div>

        <div v-else class="configs-list">
          <div
            v-for="config in savedConfigs"
            :key="config.id"
            class="config-item"
            :class="{ active: isActiveConfig(config.id) }"
          >
            <div class="config-avatar">
              <span>{{ config.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="config-info">
              <h4>{{ config.name }}</h4>
              <p class="config-model">{{ config.modelName }}</p>
              <p class="config-date">{{ formatDate(config.createdAt) }}</p>
            </div>
            <div class="config-actions">
              <el-button
                v-if="!isActiveConfig(config.id)"
                type="primary"
                size="small"
                class="glass-btn mini"
                @click="loadConfig(config)"
              >
                使用
              </el-button>
              <span v-else class="active-badge">当前使用</span>
              <el-dropdown>
                <el-button size="small" class="glass-btn mini">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="editConfig(config)">
                      <el-icon><Edit /></el-icon>编辑
                    </el-dropdown-item>
                    <el-dropdown-item @click="deleteConfig(config.id)">
                      <el-icon><Delete /></el-icon>删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Dialog -->
    <el-dialog
      v-model="showSaveDialog"
      title="保存配置"
      width="400px"
      class="glass-dialog"
    >
      <div class="dialog-content">
        <el-input
          v-model="configName"
          placeholder="输入配置名称"
          size="large"
          class="glass-input"
        />
      </div>
      <template #footer>
        <div class="dialog-actions">
          <el-button
            class="glass-btn secondary"
            @click="showSaveDialog = false"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            class="glass-btn primary"
            :disabled="!configName.trim()"
            @click="saveConfig"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    Setting,
    Link,
    Key,
    Connection,
    Check,
    Refresh,
    Plus,
    Document,
    Edit,
    Delete,
    MoreFilled,
    Cpu,
    Close,
    Loading,
  } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  // ... (保持原有的script逻辑，只是样式改变)

  const popularModels = [
    {
      name: 'gpt-4o',
      description: 'OpenAI 最新模型',
      color: 'linear-gradient(45deg, #10a37f, #1a7f64)',
      icon: 'Cpu',
    },
    {
      name: 'claude-3-5-sonnet-20241022',
      description: 'Anthropic Claude',
      color: 'linear-gradient(45deg, #ff6b35, #f7931e)',
      icon: 'Cpu',
    },
    {
      name: 'gpt-4o-mini',
      description: '轻量级版本',
      color: 'linear-gradient(45deg, #667eea, #764ba2)',
      icon: 'Cpu',
    },
  ];

  // ... (其他逻辑保持不变)
</script>

<style scoped>
  .glass-config {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    padding: 20px;
  }

  .glass-background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    z-index: 0;
  }

  .bg-shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.3;
  }

  .shape-1 {
    width: 400px;
    height: 400px;
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    top: -200px;
    left: -200px;
    animation: float 8s ease-in-out infinite;
  }

  .shape-2 {
    width: 300px;
    height: 300px;
    background: linear-gradient(45deg, #48cae4, #023e8a);
    top: 50%;
    right: -150px;
    animation: float 8s ease-in-out infinite reverse;
  }

  .shape-3 {
    width: 350px;
    height: 350px;
    background: linear-gradient(45deg, #06ffa5, #0077b6);
    bottom: -175px;
    left: 50%;
    animation: float 8s ease-in-out infinite 2s;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-30px) rotate(180deg);
    }
  }

  .glass-container {
    position: relative;
    z-index: 1;
    max-width: 1000px;
    margin: 0 auto;
  }

  .glass-header {
    text-align: center;
    margin-bottom: 40px;
    color: white;
  }

  .header-icon {
    margin-bottom: 20px;
    opacity: 0.9;
  }

  .glass-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 10px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .glass-header p {
    font-size: 1.2rem;
    opacity: 0.8;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    color: white;
  }

  .card-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .form-group {
    margin-bottom: 25px;
  }

  .glass-label {
    display: block;
    color: white;
    font-weight: 500;
    margin-bottom: 10px;
    font-size: 1rem;
  }

  .glass-input-wrapper {
    position: relative;
  }

  :deep(.glass-input .el-input__wrapper) {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    box-shadow: none;
    color: white;
  }

  :deep(.glass-input .el-input__inner) {
    color: white;
  }

  :deep(.glass-input .el-input__inner::placeholder) {
    color: rgba(255, 255, 255, 0.6);
  }

  .model-tags {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin-top: 15px;
  }

  .model-tag {
    display: flex;
    align-items: center;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .model-tag:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  .model-tag.active {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .tag-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-right: 12px;
  }

  .tag-content {
    flex: 1;
  }

  .tag-name {
    display: block;
    color: white;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .tag-desc {
    display: block;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
  }

  .advanced-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .advanced-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .advanced-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
  }

  :deep(.glass-number .el-input-number__wrapper) {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
  }

  .connection-status {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    margin: 20px 0;
  }

  .status-indicator {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .status-indicator.success {
    background: linear-gradient(45deg, #06ffa5, #0077b6);
  }

  .status-indicator.error {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  }

  .status-indicator.info {
    background: linear-gradient(45deg, #48cae4, #023e8a);
  }

  .status-content h4 {
    color: white;
    margin: 0 0 5px 0;
    font-weight: 500;
  }

  .status-content p {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-size: 0.9rem;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
  }

  .glass-btn {
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    position: relative;
    overflow: hidden;
  }

  .glass-btn.primary {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
  }

  .glass-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  .glass-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .glass-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .glass-btn.small {
    padding: 8px 16px;
    font-size: 0.9rem;
  }

  .glass-btn.mini {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: rgba(255, 255, 255, 0.8);
  }

  .empty-icon {
    margin-bottom: 20px;
    opacity: 0.6;
  }

  .empty-state h3 {
    margin-bottom: 10px;
    color: white;
  }

  .configs-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .config-item {
    display: flex;
    align-items: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .config-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  .config-item.active {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .config-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(45deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    margin-right: 15px;
  }

  .config-info {
    flex: 1;
  }

  .config-info h4 {
    color: white;
    margin: 0 0 5px 0;
    font-weight: 500;
  }

  .config-model {
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 3px 0;
    font-size: 0.9rem;
  }

  .config-date {
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    font-size: 0.8rem;
  }

  .config-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .active-badge {
    color: #06ffa5;
    font-size: 0.9rem;
    font-weight: 500;
  }

  :deep(.glass-dialog .el-dialog) {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
  }

  :deep(.glass-dialog .el-dialog__header) {
    color: white;
  }

  :deep(.glass-dialog .el-dialog__body) {
    color: white;
  }

  .dialog-content {
    padding: 20px 0;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .glass-container {
      padding: 0 10px;
    }

    .glass-card {
      padding: 20px;
    }

    .card-header {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }

    .model-tags {
      grid-template-columns: 1fr;
    }

    .advanced-grid {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column;
    }

    .config-item {
      flex-direction: column;
      text-align: center;
      gap: 15px;
    }
  }
</style>
