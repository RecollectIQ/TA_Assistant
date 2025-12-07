<template>
  <div class="configuration-view">
    <el-container>
      <el-main>
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>API Configuration</span>
              <el-button
                type="primary"
                :icon="Plus"
                @click="showSaveDialog = true"
              >
                Save Configuration
              </el-button>
            </div>
          </template>

          <el-form
            ref="configForm"
            :model="formData"
            :rules="validationRules"
            label-width="120px"
            @submit.prevent="handleSave"
          >
            <!-- API URL -->
            <el-form-item label="API URL" prop="apiUrl">
              <el-input
                v-model="formData.apiUrl"
                placeholder="https://api.openai.com/v1/chat/completions"
                :prefix-icon="Link"
              />
            </el-form-item>

            <!-- API Key -->
            <el-form-item label="API Key" prop="apiKey">
              <el-input
                v-model="formData.apiKey"
                type="password"
                placeholder="sk-..."
                show-password
                :prefix-icon="Key"
              />
            </el-form-item>

            <!-- Model Name -->
            <el-form-item label="Model" prop="modelName">
              <el-input
                v-model="formData.modelName"
                placeholder="e.g., gpt-4o, claude-3-5-sonnet-20241022, etc."
                :prefix-icon="Cpu"
              />
              <div class="model-suggestions">
                <small>Common models:</small>
                <el-space wrap>
                  <el-tag
                    size="small"
                    style="cursor: pointer"
                    @click="formData.modelName = 'gpt-4o'"
                  >
                    gpt-4o
                  </el-tag>
                  <el-tag
                    size="small"
                    style="cursor: pointer"
                    @click="formData.modelName = 'gpt-4o-mini'"
                  >
                    gpt-4o-mini
                  </el-tag>
                  <el-tag
                    size="small"
                    style="cursor: pointer"
                    @click="formData.modelName = 'claude-3-5-sonnet-20241022'"
                  >
                    claude-3-5-sonnet
                  </el-tag>
                  <el-tag
                    size="small"
                    style="cursor: pointer"
                    @click="formData.modelName = 'claude-3-5-haiku-20241022'"
                  >
                    claude-3-5-haiku
                  </el-tag>
                  <el-tag
                    size="small"
                    style="cursor: pointer"
                    @click="formData.modelName = 'gpt-4-turbo'"
                  >
                    gpt-4-turbo
                  </el-tag>
                </el-space>
              </div>
            </el-form-item>

            <!-- Advanced Settings -->
            <el-divider>Advanced Settings</el-divider>

            <el-form-item label="Max Tokens" prop="maxTokens">
              <el-input-number
                v-model="formData.maxTokens"
                :min="100"
                :max="32000"
                :step="100"
              />
            </el-form-item>

            <el-form-item label="Timeout (ms)" prop="timeout">
              <el-input-number
                v-model="formData.timeout"
                :min="5000"
                :max="120000"
                :step="5000"
              />
            </el-form-item>

            <!-- Actions -->
            <el-form-item>
              <el-space>
                <el-button
                  type="primary"
                  :loading="isTesting"
                  @click="handleTest"
                >
                  <el-icon><Connection /></el-icon>
                  Test Connection
                </el-button>

                <el-button
                  type="success"
                  :loading="isSaving"
                  @click="handleSave"
                >
                  <el-icon><Check /></el-icon>
                  Save Configuration
                </el-button>

                <el-button @click="handleReset">
                  <el-icon><Refresh /></el-icon>
                  Reset
                </el-button>
              </el-space>
            </el-form-item>
          </el-form>

          <!-- Connection Status -->
          <div v-if="connectionStatus" class="connection-status">
            <el-alert
              :type="connectionStatus.type"
              :title="connectionStatus.title"
              :description="connectionStatus.message"
              show-icon
              :closable="false"
            />
          </div>

          <!-- Saved Configurations -->
          <el-card class="saved-configs">
            <template #header>
              <div class="card-header">
                <el-icon><Document /></el-icon>
                <span>Saved Configurations</span>
              </div>
            </template>

            <div v-if="savedConfigs.length === 0" class="no-configs">
              <el-empty
                description="No saved configurations"
                :image-size="100"
              />
            </div>

            <div v-else class="config-list">
              <el-space direction="vertical" style="width: 100%">
                <el-card
                  v-for="config in savedConfigs"
                  :key="config.id"
                  :class="[
                    'config-item',
                    { active: isActiveConfig(config.id) },
                  ]"
                  shadow="hover"
                >
                  <div class="config-item-content">
                    <div class="config-info">
                      <h4>{{ config.name }}</h4>
                      <p class="config-url">{{ config.apiUrl }}</p>
                      <p class="config-meta">
                        Model: {{ config.modelName }} | Created:
                        {{ formatDate(config.createdAt) }}
                      </p>
                    </div>
                    <div class="config-actions">
                      <el-button
                        type="primary"
                        size="small"
                        :icon="Check"
                        @click="loadConfig(config)"
                      >
                        {{ isActiveConfig(config.id) ? 'Current' : 'Use This' }}
                      </el-button>
                      <el-button
                        type="warning"
                        size="small"
                        :icon="Edit"
                        @click="editConfig(config)"
                      >
                        Edit
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        :icon="Delete"
                        @click="deleteConfig(config.id)"
                      >
                        Delete
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-space>
            </div>
          </el-card>

          <!-- Configuration Info -->
          <el-card v-if="currentConfig" class="config-info">
            <template #header>
              <div class="card-header">
                <el-icon><InfoFilled /></el-icon>
                <span>Current Configuration Details</span>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="Configuration Name">
                {{ activeConfig?.name || 'Default Configuration' }}
              </el-descriptions-item>
              <el-descriptions-item label="API URL">
                {{ currentConfig.apiUrl }}
              </el-descriptions-item>
              <el-descriptions-item label="Model">
                {{ currentConfig.modelName }}
              </el-descriptions-item>
              <el-descriptions-item label="Max Tokens">
                {{ currentConfig.maxTokens }}
              </el-descriptions-item>
              <el-descriptions-item label="Timeout">
                {{ currentConfig.timeout }}ms
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-card>

        <!-- Save Config Dialog -->
        <el-dialog
          v-model="showSaveDialog"
          title="Save Configuration"
          width="400px"
          destroy-on-close
        >
          <el-form @submit.prevent="saveConfig">
            <el-form-item label="Configuration Name">
              <el-input
                v-model="configName"
                placeholder="e.g., OpenAI-GPT4, Custom API, etc."
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showSaveDialog = false">Cancel</el-button>
            <el-button
              type="primary"
              :disabled="!configName.trim()"
              @click="saveConfig"
            >
              Save
            </el-button>
          </template>
        </el-dialog>

        <!-- Edit Config Dialog -->
        <el-dialog
          v-model="showEditDialog"
          title="Edit Configuration"
          width="500px"
          destroy-on-close
        >
          <el-form v-if="editingConfig" @submit.prevent="updateConfig">
            <el-form-item label="Configuration Name">
              <el-input
                v-model="editingConfig.name"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="API URL">
              <el-input v-model="editingConfig.apiUrl" />
            </el-form-item>
            <el-form-item label="API Key">
              <el-input
                v-model="editingConfig.apiKey"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item label="Model Name">
              <el-input v-model="editingConfig.modelName" />
            </el-form-item>
            <el-form-item label="Max Tokens">
              <el-input-number
                v-model="editingConfig.maxTokens"
                :min="100"
                :max="32000"
              />
            </el-form-item>
            <el-form-item label="Timeout (ms)">
              <el-input-number
                v-model="editingConfig.timeout"
                :min="5000"
                :max="120000"
                step="1000"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showEditDialog = false">Cancel</el-button>
            <el-button type="primary" @click="updateConfig">Update</el-button>
          </template>
        </el-dialog>
      </el-main>
    </el-container>
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
    InfoFilled,
    Cpu,
    Plus,
    Document,
    Edit,
    Delete,
  } from '@element-plus/icons-vue';
  import { useGradingStore } from '@/stores/gradingStore';
  import { useApiConfigStore } from '@/stores/apiConfigStore';
  import { useConfigManagerStore } from '@/stores/configManager';
  import { apiService } from '@/services/apiService';
  import type { ApiConfig } from '@/types/api';
  import { ElMessage, ElMessageBox } from 'element-plus';

  interface ConnectionStatus {
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }

  const router = useRouter();
  const _gradingStore = useGradingStore();
  const configManagerStore = useConfigManagerStore();

  // 直接使用 apiConfigStore，避免从 gradingStore 透传导致的空值
  const apiConfigStore = useApiConfigStore();

  const configForm = ref();
  const isTesting = ref(false);
  const isSaving = ref(false);
  const connectionStatus = ref<ConnectionStatus | null>(null);
  const showSaveDialog = ref(false);
  const showEditDialog = ref(false);
  const configName = ref('');
  const editingConfig = ref<ApiConfig | null>(null);

  const formData = ref<ApiConfig>({
    apiUrl: '',
    apiKey: '',
    modelName: '',
    maxTokens: 8192,
    timeout: 30000,
  });

  const currentConfig = computed(() => apiConfigStore.apiConfig);
  const savedConfigs = computed(() => configManagerStore.configs);
  const activeConfig = computed(() => configManagerStore.activeConfig);

  const validationRules = {
    apiUrl: [
      { required: true, message: 'Please enter API URL', trigger: 'blur' },
      {
        type: 'url',
        message: 'Please enter a valid URL',
        trigger: ['blur', 'change'],
      },
    ],
    apiKey: [
      { required: true, message: 'Please enter API key', trigger: 'blur' },
      {
        min: 10,
        message: 'API key is too short',
        trigger: 'blur',
      },
    ],
    modelName: [
      { required: true, message: 'Please select a model', trigger: 'change' },
    ],
    maxTokens: [
      {
        type: 'number',
        min: 100,
        max: 32000,
        message: 'Must be between 100-32000',
        trigger: 'blur',
      },
    ],
    timeout: [
      {
        type: 'number',
        min: 5000,
        max: 120000,
        message: 'Must be between 5000-120000',
        trigger: 'blur',
      },
    ],
  };

  const loadCurrentConfig = () => {
    const config = apiConfigStore.apiConfig;
    formData.value = { ...config };
  };

  const handleTest = async () => {
    try {
      await configForm.value.validate();

      isTesting.value = true;
      connectionStatus.value = {
        type: 'info',
        title: 'Testing...',
        message: 'Testing API connection...',
      };

      const result = await apiService.testConnection(formData.value);

      if (result.success) {
        connectionStatus.value = {
          type: 'success',
          title: 'Success',
          message: 'API connection successful!',
        };
      } else {
        connectionStatus.value = {
          type: 'error',
          title: 'Connection Failed',
          message: result.error || 'Failed to connect to API',
        };
      }
    } catch (error) {
      connectionStatus.value = {
        type: 'error',
        title: 'Validation Error',
        message: 'Please check configuration',
      };
    } finally {
      isTesting.value = false;
    }
  };

  const handleSave = async () => {
    try {
      console.log('Starting to save configuration, form data:', formData.value);

      // Validate form
      await configForm.value.validate();
      console.log('Form validation passed');

      isSaving.value = true;

      // Update current configuration
      console.log('Saving API configuration...');
      apiConfigStore.saveApiConfig(formData.value);
      console.log('API configuration saved successfully');

      // If there's an active config, update it
      if (activeConfig.value) {
        console.log('Updating active config:', activeConfig.value.id);
        configManagerStore.updateConfig(activeConfig.value.id, formData.value);
        console.log('Active configuration updated successfully');
      }

      ElMessage.success('Configuration saved successfully!');
      router.push('/standard-answer');
    } catch (error) {
      console.error('Error saving configuration:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to save configuration';
      if (error instanceof Error) {
        errorMessage = `Failed to save configuration: ${error.message}`;
      }

      ElMessage.error(errorMessage);
    } finally {
      isSaving.value = false;
    }
  };

  const saveConfig = async () => {
    if (!configName.value.trim()) return;

    try {
      await configForm.value.validate();

      configManagerStore.addConfig(configName.value.trim(), formData.value);
      ElMessage.success(`Configuration "${configName.value}" saved`);

      showSaveDialog.value = false;
      configName.value = '';
    } catch (error) {
      ElMessage.error('Configuration validation failed');
    }
  };

  const loadConfig = (config: any) => {
    formData.value = {
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      modelName: config.modelName,
      maxTokens: config.maxTokens,
      timeout: config.timeout,
    };

    configManagerStore.setActiveConfig(config.id);
    apiConfigStore.saveApiConfig(formData.value);

    ElMessage.success(`Switched to configuration "${config.name}"`);
    connectionStatus.value = null;
  };

  const editConfig = (config: any) => {
    editingConfig.value = { ...config };
    showEditDialog.value = true;
  };

  const updateConfig = () => {
    if (!editingConfig.value?.name?.trim()) return;
    if (!editingConfig.value?.id) {
      ElMessage.error('Configuration ID is missing, cannot update');
      return;
    }

    console.log('Updating configuration:', editingConfig.value);

    configManagerStore.updateConfig(
      editingConfig.value.id,
      editingConfig.value,
    );

    // If it's the current active config, sync update
    if (activeConfig.value?.id === editingConfig.value.id) {
      formData.value = {
        apiUrl: editingConfig.value.apiUrl,
        apiKey: editingConfig.value.apiKey,
        modelName: editingConfig.value.modelName,
        maxTokens: editingConfig.value.maxTokens,
        timeout: editingConfig.value.timeout,
      };
      apiConfigStore.saveApiConfig(formData.value);
    }

    ElMessage.success('Configuration updated');
    showEditDialog.value = false;
  };

  const deleteConfig = (id: string) => {
    const config = configManagerStore.getConfig(id);
    if (!config) return;

    ElMessageBox.confirm(
      `Are you sure you want to delete configuration "${config.name}"?`,
      'Delete Configuration',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      },
    ).then(() => {
      configManagerStore.deleteConfig(id);
      ElMessage.success('Configuration deleted');
    });
  };

  const isActiveConfig = (id: string) => {
    return configManagerStore.activeConfigId === id;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const handleReset = () => {
    loadCurrentConfig();
    connectionStatus.value = null;
    ElMessage.info('Configuration reset to current values');
  };

  // Debug function: Clear corrupted configuration data
  const _handleClearCorruptedData = () => {
    ElMessageBox.confirm(
      'This will clear all saved configuration data. Are you sure you want to continue?',
      'Clear Configuration Data',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      },
    )
      .then(() => {
        configManagerStore.clearCorruptedStorage();
        loadCurrentConfig();
        ElMessage.success('Configuration data cleared');
      })
      .catch(() => {
        ElMessage.info('Operation cancelled');
      });
  };

  onMounted(() => {
    configManagerStore.loadFromStorage();
    loadCurrentConfig();
  });
</script>

<style scoped>
  .configuration-view {
    @apply h-full;
  }

  .card-header {
    @apply flex items-center gap-2;
  }

  .connection-status {
    @apply mt-4;
  }

  .config-info {
    @apply mt-6;
  }

  :deep(.el-form-item__label) {
    @apply font-medium;
  }

  .model-suggestions {
    margin-top: 8px;
  }

  .model-suggestions small {
    color: #666;
    margin-bottom: 4px;
    display: block;
  }

  .model-suggestions .el-tag {
    transition: all 0.2s;
  }

  .model-suggestions .el-tag:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .saved-configs {
    margin-top: 24px;
  }

  .no-configs {
    text-align: center;
    padding: 20px 0;
  }

  .config-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .config-item {
    margin-bottom: 12px;
    border: 1px solid #e4e7ed;
    transition: all 0.3s ease;
  }

  .config-item.active {
    border-color: #409eff;
    background-color: #f0f9ff;
  }

  .config-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .config-item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .config-info h4 {
    margin: 0 0 4px 0;
    color: #303133;
    font-size: 16px;
  }

  .config-url {
    margin: 0 0 4px 0;
    color: #606266;
    font-size: 13px;
    word-break: break-all;
  }

  .config-meta {
    margin: 0;
    color: #909399;
    font-size: 12px;
  }

  .config-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .config-item-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .config-actions {
      margin-top: 12px;
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
