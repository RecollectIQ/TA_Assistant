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
                @click="showSaveDialog = true"
                :icon="Plus"
              >
                保存配置
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
                <small>常用模型示例：</small>
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
                <span>已保存的配置</span>
              </div>
            </template>

            <div v-if="savedConfigs.length === 0" class="no-configs">
              <el-empty description="暂无保存的配置" :image-size="100" />
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
                        模型: {{ config.modelName }} | 创建于:
                        {{ formatDate(config.createdAt) }}
                      </p>
                    </div>
                    <div class="config-actions">
                      <el-button
                        type="primary"
                        size="small"
                        @click="loadConfig(config)"
                        :icon="Check"
                      >
                        {{
                          isActiveConfig(config.id) ? '当前使用' : '使用此配置'
                        }}
                      </el-button>
                      <el-button
                        type="warning"
                        size="small"
                        @click="editConfig(config)"
                        :icon="Edit"
                      >
                        编辑
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        @click="deleteConfig(config.id)"
                        :icon="Delete"
                      >
                        删除
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
                <span>当前配置详情</span>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="配置名称">
                {{ activeConfig?.name || '默认配置' }}
              </el-descriptions-item>
              <el-descriptions-item label="API URL">
                {{ currentConfig.apiUrl }}
              </el-descriptions-item>
              <el-descriptions-item label="模型">
                {{ currentConfig.modelName }}
              </el-descriptions-item>
              <el-descriptions-item label="最大Token">
                {{ currentConfig.maxTokens }}
              </el-descriptions-item>
              <el-descriptions-item label="超时时间">
                {{ currentConfig.timeout }}ms
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-card>

        <!-- Save Config Dialog -->
        <el-dialog v-model="showSaveDialog" title="保存配置" width="400px">
          <el-form @submit.prevent="saveConfig">
            <el-form-item label="配置名称">
              <el-input
                v-model="configName"
                placeholder="例如：OpenAI-GPT4, 智谱GLM等"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showSaveDialog = false">取消</el-button>
            <el-button
              type="primary"
              @click="saveConfig"
              :disabled="!configName.trim()"
            >
              保存
            </el-button>
          </template>
        </el-dialog>

        <!-- Edit Config Dialog -->
        <el-dialog v-model="showEditDialog" title="编辑配置" width="500px">
          <el-form @submit.prevent="updateConfig">
            <el-form-item label="配置名称">
              <el-input
                v-model="editingConfig.name"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="API URL">
              <el-input v-model="editingConfig.apiUrl" />
            </el-form-item>
            <el-form-item label="API密钥">
              <el-input
                v-model="editingConfig.apiKey"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item label="模型名称">
              <el-input v-model="editingConfig.modelName" />
            </el-form-item>
            <el-form-item label="最大Token">
              <el-input-number
                v-model="editingConfig.maxTokens"
                :min="100"
                :max="32000"
              />
            </el-form-item>
            <el-form-item label="超时时间(ms)">
              <el-input-number
                v-model="editingConfig.timeout"
                :min="5000"
                :max="120000"
                step="1000"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showEditDialog = false">取消</el-button>
            <el-button type="primary" @click="updateConfig"> 更新 </el-button>
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
  import { useApiConfigStore } from '@/stores/apiConfigStore';
  import { useConfigManagerStore } from '@/stores/configManagerStore';
  import { apiService } from '@/services/apiService';
  import type { ApiConfig } from '@/types/api';
  import { ElMessage, ElMessageBox } from 'element-plus';

  interface ConnectionStatus {
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }

  const router = useRouter();
  const apiConfigStore = useApiConfigStore();
  const configManagerStore = useConfigManagerStore();

  const configForm = ref();
  const isTesting = ref(false);
  const isSaving = ref(false);
  const connectionStatus = ref<ConnectionStatus | null>(null);
  const showSaveDialog = ref(false);
  const showEditDialog = ref(false);
  const configName = ref('');
  const editingConfig = ref({});

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
      { required: true, message: '请输入API URL', trigger: 'blur' },
      {
        type: 'url',
        message: '请输入有效的URL',
        trigger: ['blur', 'change'],
      },
    ],
    apiKey: [
      { required: true, message: '请输入API key', trigger: 'blur' },
      {
        min: 10,
        message: 'API key 过短',
        trigger: 'blur',
      },
    ],
    modelName: [{ required: true, message: '请选择模型', trigger: 'change' }],
    maxTokens: [
      {
        type: 'number',
        min: 100,
        max: 32000,
        message: '必须在100-32000之间',
        trigger: 'blur',
      },
    ],
    timeout: [
      {
        type: 'number',
        min: 5000,
        max: 120000,
        message: '必须在5000-120000之间',
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
        title: '测试中...',
        message: '正在测试API连接...',
      };

      const result = await apiService.testConnection(formData.value);

      if (result.success) {
        connectionStatus.value = {
          type: 'success',
          title: '成功',
          message: 'API连接成功！',
        };
      } else {
        connectionStatus.value = {
          type: 'error',
          title: '连接失败',
          message: result.error || '连接API失败',
        };
      }
    } catch (error) {
      connectionStatus.value = {
        type: 'error',
        title: '验证错误',
        message: '请检查配置',
      };
    } finally {
      isTesting.value = false;
    }
  };

  const handleSave = async () => {
    try {
      await configForm.value.validate();

      isSaving.value = true;

      // 测试连接
      const testResult = await apiService.testConnection(formData.value);
      if (!testResult.success) {
        ElMessage.error('无法保存: ' + (testResult.error || '连接测试失败'));
        return;
      }

      // 更新当前配置
      apiConfigStore.saveApiConfig(formData.value);

      // 如果有活跃配置，更新它
      if (activeConfig.value) {
        configManagerStore.updateConfig(activeConfig.value.id, formData.value);
      }

      ElMessage.success('配置保存成功！');
      router.push('/standard-answer');
    } catch (error) {
      ElMessage.error('保存配置失败');
    } finally {
      isSaving.value = false;
    }
  };

  const saveConfig = async () => {
    if (!configName.value.trim()) return;

    try {
      await configForm.value.validate();

      const testResult = await apiService.testConnection(formData.value);
      if (!testResult.success) {
        ElMessage.error('无法保存：' + (testResult.error || '连接测试失败'));
        return;
      }

      configManagerStore.addConfig(configName.value.trim(), formData.value);
      ElMessage.success(`配置 "${configName.value}" 已保存`);

      showSaveDialog.value = false;
      configName.value = '';
    } catch (error) {
      ElMessage.error('验证配置失败');
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

    ElMessage.success(`已切换到配置 "${config.name}"`);
    connectionStatus.value = null;
  };

  const editConfig = (config: any) => {
    editingConfig.value = { ...config };
    showEditDialog.value = true;
  };

  const updateConfig = () => {
    if (!editingConfig.value.name?.trim()) return;

    configManagerStore.updateConfig(
      editingConfig.value.id,
      editingConfig.value,
    );

    // 如果是当前活跃配置，同步更新
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

    ElMessage.success('配置已更新');
    showEditDialog.value = false;
  };

  const deleteConfig = (id: string) => {
    const config = configManagerStore.getConfig(id);
    if (!config) return;

    ElMessageBox.confirm(`确定要删除配置 "${config.name}" 吗？`, '删除配置', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      configManagerStore.deleteConfig(id);
      ElMessage.success('配置已删除');
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
    ElMessage.info('配置已重置为当前值');
  };

  onMounted(() => {
    configManagerStore.loadConfigs();
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
