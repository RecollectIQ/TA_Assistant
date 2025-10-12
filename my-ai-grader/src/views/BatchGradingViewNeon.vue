<template>
  <div class="neon-grading">
    <!-- Animated Background -->
    <div class="neon-background">
      <div class="grid-overlay"></div>
      <div class="neon-particles">
        <div
          v-for="i in 20"
          :key="i"
          class="particle"
          :style="getParticleStyle(i)"
        ></div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="neon-container">
      <!-- Header -->
      <div class="neon-header">
        <div class="header-content">
          <div class="header-icon">
            <el-icon :size="50"><Files /></el-icon>
          </div>
          <div class="header-text">
            <h1>批量批改系统</h1>
            <p>AI驱动的智能批改流水线</p>
          </div>
        </div>

        <!-- Progress Indicator -->
        <div class="progress-indicator">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="step-dot"
            :class="{
              active: currentStep === index + 1,
              completed: currentStep > index + 1,
            }"
          >
            <div class="dot-inner">
              <el-icon><component :is="step.icon" /></el-icon>
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Upload -->
      <div v-if="currentStep === 1" class="step-container">
        <div class="neon-card upload-card">
          <div class="card-header">
            <h2>
              <span class="neon-text">上传学生作业</span>
            </h2>
            <div class="upload-stats">
              <div class="stat-item">
                <span class="stat-number">{{ submissions.length }}</span>
                <span class="stat-label">已上传</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{
                  submissionSettings.maxSubmissions
                }}</span>
                <span class="stat-label">最大数量</span>
              </div>
            </div>
          </div>

          <!-- Upload Zone -->
          <div class="upload-zone" :class="{ 'drag-over': isDragOver }">
            <div class="upload-content">
              <div class="upload-icon">
                <el-icon :size="80"><Upload /></el-icon>
              </div>
              <h3>拖拽文件到此处</h3>
              <p>支持 JPG, PNG, PDF 格式，单个文件最大 5MB</p>

              <div class="upload-actions">
                <el-button
                  type="primary"
                  size="large"
                  class="neon-btn primary"
                  @click="triggerFileSelect"
                >
                  <el-icon><FolderOpened /></el-icon>
                  选择文件
                </el-button>
                <el-button
                  size="large"
                  class="neon-btn secondary"
                  @click="uploadZip"
                >
                  <el-icon><Document /></el-icon>
                  上传ZIP
                </el-button>
              </div>
            </div>
          </div>

          <!-- File List -->
          <div v-if="submissions.length > 0" class="file-list">
            <div class="list-header">
              <h4>已上传文件 ({{ submissions.length }})</h4>
              <el-button size="small" class="neon-btn danger" @click="clearAll">
                <el-icon><Delete /></el-icon>
                清空
              </el-button>
            </div>

            <div class="file-grid">
              <div
                v-for="(file, index) in submissions"
                :key="file.id"
                class="file-item"
              >
                <div class="file-preview">
                  <img :src="file.imageUrl" :alt="file.fileName" />
                  <div class="file-overlay">
                    <el-button
                      size="small"
                      class="neon-btn mini"
                      @click="removeFile(index)"
                    >
                      <el-icon><Close /></el-icon>
                    </el-button>
                  </div>
                </div>
                <div class="file-info">
                  <span class="file-name">{{ file.studentId }}</span>
                  <span class="file-size">{{
                    formatFileSize(file.fileSize)
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Next Button -->
          <div class="step-actions">
            <el-button
              type="primary"
              size="large"
              class="neon-btn primary large"
              :disabled="submissions.length === 0"
              @click="nextStep"
            >
              下一步：配置批改
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- Step 2: Configure -->
      <div v-if="currentStep === 2" class="step-container">
        <div class="neon-card config-card">
          <div class="card-header">
            <h2>
              <span class="neon-text">批改配置</span>
            </h2>
          </div>

          <div class="config-grid">
            <!-- Standard Answer Selection -->
            <div class="config-section">
              <h3>标准答案</h3>
              <div v-if="!standardAnswer" class="no-answer">
                <div class="empty-icon">
                  <el-icon :size="60"><QuestionFilled /></el-icon>
                </div>
                <p>请选择标准答案</p>
                <el-button
                  type="primary"
                  class="neon-btn primary"
                  @click="selectStandardAnswer"
                >
                  选择标准答案
                </el-button>
              </div>
              <div v-else class="answer-preview">
                <div class="answer-card">
                  <div class="answer-image">
                    <img :src="standardAnswer.images[0]" alt="标准答案" />
                  </div>
                  <div class="answer-info">
                    <h4>{{ standardAnswer.title }}</h4>
                    <p>{{ standardAnswer.description }}</p>
                    <div class="answer-meta">
                      <span>{{ standardAnswer.images.length }} 张图片</span>
                      <span
                        >{{
                          standardAnswer.rubric.criteria.length
                        }}
                        个评分点</span
                      >
                    </div>
                  </div>
                  <el-button
                    size="small"
                    class="neon-btn secondary"
                    @click="selectStandardAnswer"
                  >
                    更换
                  </el-button>
                </div>
              </div>
            </div>

            <!-- Grading Options -->
            <div class="config-section">
              <h3>批改选项</h3>
              <div class="options-grid">
                <div class="option-item">
                  <div class="option-header">
                    <el-icon><DocumentChecked /></el-icon>
                    <span>详细反馈</span>
                  </div>
                  <p>为每份作业生成详细的批改意见</p>
                  <el-switch
                    v-model="gradingOptions.detailedFeedback"
                    class="neon-switch"
                  />
                </div>

                <div class="option-item">
                  <div class="option-header">
                    <el-icon><TrendCharts /></el-icon>
                    <span>置信度评分</span>
                  </div>
                  <p>显示AI批改的置信度分数</p>
                  <el-switch
                    v-model="gradingOptions.showConfidence"
                    class="neon-switch"
                  />
                </div>

                <div class="option-item">
                  <div class="option-header">
                    <el-icon><Lightning /></el-icon>
                    <span>并行处理</span>
                  </div>
                  <p>同时处理多份作业，提升速度</p>
                  <el-switch
                    v-model="gradingOptions.parallelProcessing"
                    class="neon-switch"
                  />
                </div>

                <div class="option-item">
                  <div class="option-header">
                    <el-icon><FolderAdd /></el-icon>
                    <span>保存结果</span>
                  </div>
                  <p>将批改结果保存到历史记录</p>
                  <el-switch
                    v-model="gradingOptions.saveResults"
                    class="neon-switch"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Batch Summary -->
          <div class="batch-summary">
            <div class="summary-header">
              <h3>批改概览</h3>
            </div>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-icon">
                  <el-icon><Files /></el-icon>
                </div>
                <div class="summary-content">
                  <span class="summary-number">{{ submissions.length }}</span>
                  <span class="summary-label">待批改作业</span>
                </div>
              </div>
              <div class="summary-item">
                <div class="summary-icon">
                  <el-icon><Timer /></el-icon>
                </div>
                <div class="summary-content">
                  <span class="summary-number">~{{ estimatedTime }}</span>
                  <span class="summary-label">预计时间(分钟)</span>
                </div>
              </div>
              <div class="summary-item">
                <div class="summary-icon">
                  <el-icon><Cpu /></el-icon>
                </div>
                <div class="summary-content">
                  <span class="summary-number">{{
                    standardAnswer?.title || 'N/A'
                  }}</span>
                  <span class="summary-label">使用标准</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="step-actions">
            <el-button
              size="large"
              class="neon-btn secondary"
              @click="prevStep"
            >
              <el-icon><ArrowLeft /></el-icon>
              上一步
            </el-button>
            <el-button
              type="primary"
              size="large"
              class="neon-btn primary large"
              :disabled="!standardAnswer"
              :loading="isGrading"
              @click="startGrading"
            >
              <el-icon><Magic /></el-icon>
              开始批改
            </el-button>
          </div>
        </div>
      </div>

      <!-- Step 3: Results -->
      <div v-if="currentStep === 3" class="step-container">
        <div class="neon-card results-card">
          <div class="card-header">
            <h2>
              <span class="neon-text">批改结果</span>
            </h2>
          </div>

          <!-- Progress Display -->
          <div v-if="isGrading" class="grading-progress">
            <div class="progress-circle">
              <svg class="progress-svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" class="progress-bg" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  class="progress-fill"
                  :style="{
                    strokeDasharray: `${gradingProgress * 2.83} 283`,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                  }"
                />
              </svg>
              <div class="progress-text">
                <span class="progress-number">{{ gradingProgress }}%</span>
                <span class="progress-label">已完成</span>
              </div>
            </div>

            <div class="progress-info">
              <h3>{{ gradingMessage }}</h3>
              <p>{{ processedCount }} / {{ submissions.length }} 已处理</p>

              <div class="processing-animation">
                <div class="processing-dots">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Results Display -->
          <div v-else class="results-display">
            <!-- Summary Cards -->
            <div class="results-summary">
              <div class="summary-card passed">
                <div class="card-icon">
                  <el-icon><SuccessFilled /></el-icon>
                </div>
                <div class="card-content">
                  <span class="card-number">{{ resultsSummary.passed }}</span>
                  <span class="card-label">通过</span>
                </div>
              </div>

              <div class="summary-card failed">
                <div class="card-icon">
                  <el-icon><CircleCloseFilled /></el-icon>
                </div>
                <div class="card-content">
                  <span class="card-number">{{ resultsSummary.failed }}</span>
                  <span class="card-label">未通过</span>
                </div>
              </div>

              <div class="summary-card pending">
                <div class="card-icon">
                  <el-icon><WarningFilled /></el-icon>
                </div>
                <div class="card-content">
                  <span class="card-number">{{ resultsSummary.pending }}</span>
                  <span class="card-label">待处理</span>
                </div>
              </div>
            </div>

            <!-- Results Table -->
            <div class="results-table">
              <div class="table-header">
                <h4>详细结果</h4>
                <div class="table-actions">
                  <el-button
                    size="small"
                    class="neon-btn secondary"
                    @click="exportResults('csv')"
                  >
                    <el-icon><Download /></el-icon>
                    导出CSV
                  </el-button>
                  <el-button
                    size="small"
                    class="neon-btn secondary"
                    @click="exportResults('pdf')"
                  >
                    <el-icon><Document /></el-icon>
                    导出PDF
                  </el-button>
                </div>
              </div>

              <div class="table-content">
                <div
                  v-for="result in detailedResults"
                  :key="result.studentId"
                  class="result-row"
                  @click="viewDetailedResult(result)"
                >
                  <div class="student-info">
                    <div class="student-avatar">
                      {{ result.studentId.charAt(0).toUpperCase() }}
                    </div>
                    <div class="student-details">
                      <span class="student-id">{{ result.studentId }}</span>
                      <span class="student-status" :class="result.status">
                        {{ getStatusText(result.status) }}
                      </span>
                    </div>
                  </div>

                  <div class="score-display">
                    <div
                      class="score-circle"
                      :class="getScoreClass(result.score)"
                    >
                      <span>{{ result.score }}%</span>
                    </div>
                  </div>

                  <div class="confidence-bar">
                    <div
                      class="confidence-fill"
                      :style="{ width: `${result.confidence * 100}%` }"
                    ></div>
                    <span class="confidence-text"
                      >{{ Math.round(result.confidence * 100) }}%</span
                    >
                  </div>

                  <div class="result-actions">
                    <el-icon class="view-icon"><View /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="step-actions">
            <el-button
              size="large"
              class="neon-btn secondary"
              @click="prevStep"
            >
              <el-icon><ArrowLeft /></el-icon>
              返回配置
            </el-button>
            <el-button
              type="primary"
              size="large"
              class="neon-btn primary large"
              @click="resetGrading"
            >
              <el-icon><Refresh /></el-icon>
              重新开始
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import {
    Files,
    Upload,
    FolderOpened,
    Document,
    Delete,
    Close,
    ArrowRight,
    ArrowLeft,
    QuestionFilled,
    DocumentChecked,
    TrendCharts,
    Lightning,
    FolderAdd,
    Timer,
    Cpu,
    Magic,
    SuccessFilled,
    CircleCloseFilled,
    WarningFilled,
    Download,
    View,
    Refresh,
  } from '@element-plus/icons-vue';

  // ... (保持原有逻辑，主要是样式改变)

  const steps = [
    { label: '上传作业', icon: 'Upload' },
    { label: '配置批改', icon: 'Setting' },
    { label: '查看结果', icon: 'TrendCharts' },
  ];

  const getParticleStyle = (index: number) => {
    const delay = Math.random() * 5;
    const duration = 3 + Math.random() * 4;
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    return {
      left: `${x}%`,
      top: `${y}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    };
  };

  // ... (其他逻辑保持不变)
</script>

<style scoped>
  .neon-grading {
    min-height: 100vh;
    background: #0a0a0a;
    color: #ffffff;
    position: relative;
    overflow-x: hidden;
  }

  .neon-background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
  }

  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: gridMove 20s linear infinite;
  }

  @keyframes gridMove {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(50px, 50px);
    }
  }

  .neon-particles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: #00ffff;
    border-radius: 50%;
    box-shadow: 0 0 10px #00ffff;
    animation: particleFloat linear infinite;
  }

  @keyframes particleFloat {
    0% {
      transform: translateY(100vh) scale(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100px) scale(1);
      opacity: 0;
    }
  }

  .neon-container {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .neon-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 30px;
  }

  .header-icon {
    color: #00ffff;
    filter: drop-shadow(0 0 10px #00ffff);
  }

  .header-text h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(45deg, #00ffff, #ff00ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
  }

  .header-text p {
    margin: 5px 0 0 0;
    color: #888;
    font-size: 1.1rem;
  }

  .progress-indicator {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 30px;
  }

  .step-dot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    position: relative;
  }

  .dot-inner {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .step-dot.active .dot-inner {
    background: #00ffff;
    border-color: #00ffff;
    box-shadow: 0 0 20px #00ffff;
    color: #000;
  }

  .step-dot.completed .dot-inner {
    background: #00ff88;
    border-color: #00ff88;
    box-shadow: 0 0 15px #00ff88;
    color: #000;
  }

  .step-label {
    font-size: 0.9rem;
    color: #888;
  }

  .step-dot.active .step-label {
    color: #00ffff;
  }

  .step-dot.completed .step-label {
    color: #00ff88;
  }

  .neon-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 20px;
    padding: 30px;
    box-shadow:
      0 0 30px rgba(0, 255, 255, 0.1),
      inset 0 0 30px rgba(0, 255, 255, 0.05);
    backdrop-filter: blur(10px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .neon-text {
    background: linear-gradient(45deg, #00ffff, #ff00ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 1.8rem;
    font-weight: 600;
  }

  .upload-stats {
    display: flex;
    gap: 30px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-number {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: #00ffff;
    text-shadow: 0 0 10px #00ffff;
  }

  .stat-label {
    display: block;
    font-size: 0.9rem;
    color: #888;
    margin-top: 5px;
  }

  .upload-zone {
    border: 2px dashed rgba(0, 255, 255, 0.3);
    border-radius: 15px;
    padding: 60px 30px;
    text-align: center;
    transition: all 0.3s ease;
    margin-bottom: 30px;
  }

  .upload-zone:hover,
  .upload-zone.drag-over {
    border-color: #00ffff;
    background: rgba(0, 255, 255, 0.05);
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
  }

  .upload-icon {
    color: #00ffff;
    margin-bottom: 20px;
    filter: drop-shadow(0 0 10px #00ffff);
  }

  .upload-zone h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #fff;
  }

  .upload-zone p {
    color: #888;
    margin-bottom: 30px;
  }

  .upload-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
  }

  .neon-btn {
    padding: 12px 24px;
    border-radius: 25px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    position: relative;
    overflow: hidden;
  }

  .neon-btn.primary {
    background: linear-gradient(45deg, #00ffff, #0088ff);
    color: #000;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
  }

  .neon-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 25px rgba(0, 255, 255, 0.6);
  }

  .neon-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(0, 255, 255, 0.3);
  }

  .neon-btn.secondary:hover {
    background: rgba(0, 255, 255, 0.1);
    border-color: #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }

  .neon-btn.danger {
    background: linear-gradient(45deg, #ff0066, #ff3366);
    color: #fff;
  }

  .neon-btn.large {
    padding: 15px 30px;
    font-size: 1.1rem;
  }

  .neon-btn.mini {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .file-list {
    margin-top: 30px;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .list-header h4 {
    color: #00ffff;
    margin: 0;
  }

  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .file-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 255, 255, 0.2);
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .file-item:hover {
    border-color: #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }

  .file-preview {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
  }

  .file-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .file-overlay {
    position: absolute;
    top: 5px;
    right: 5px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .file-item:hover .file-overlay {
    opacity: 1;
  }

  .file-info {
    padding: 10px;
    text-align: center;
  }

  .file-name {
    display: block;
    font-weight: 500;
    color: #fff;
    margin-bottom: 3px;
    font-size: 0.9rem;
  }

  .file-size {
    display: block;
    color: #888;
    font-size: 0.8rem;
  }

  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 30px;
  }

  .config-section h3 {
    color: #00ffff;
    margin-bottom: 20px;
    font-size: 1.3rem;
  }

  .no-answer {
    text-align: center;
    padding: 40px 20px;
    border: 1px dashed rgba(0, 255, 255, 0.3);
    border-radius: 10px;
  }

  .empty-icon {
    color: #666;
    margin-bottom: 15px;
  }

  .answer-preview .answer-card {
    display: flex;
    gap: 15px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(0, 255, 255, 0.2);
  }

  .answer-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
  }

  .answer-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .answer-info {
    flex: 1;
  }

  .answer-info h4 {
    color: #fff;
    margin: 0 0 5px 0;
  }

  .answer-info p {
    color: #888;
    margin: 0 0 10px 0;
    font-size: 0.9rem;
  }

  .answer-meta {
    display: flex;
    gap: 15px;
    font-size: 0.8rem;
    color: #666;
  }

  .options-grid {
    display: grid;
    gap: 20px;
  }

  .option-item {
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(0, 255, 255, 0.1);
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .option-header {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #00ffff;
    font-weight: 500;
    margin-bottom: 5px;
  }

  .option-item p {
    color: #888;
    margin: 0;
    font-size: 0.9rem;
  }

  :deep(.neon-switch .el-switch__core) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.3);
  }

  :deep(.neon-switch.is-checked .el-switch__core) {
    background: #00ffff;
  }

  .batch-summary {
    margin-top: 30px;
    padding: 20px;
    background: rgba(0, 255, 255, 0.05);
    border: 1px solid rgba(0, 255, 255, 0.2);
    border-radius: 15px;
  }

  .summary-header h3 {
    color: #00ffff;
    margin: 0 0 20px 0;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .summary-item {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .summary-icon {
    width: 50px;
    height: 50px;
    background: rgba(0, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00ffff;
  }

  .summary-content {
    flex: 1;
  }

  .summary-number {
    display: block;
    font-size: 1.2rem;
    font-weight: 600;
    color: #fff;
  }

  .summary-label {
    display: block;
    font-size: 0.9rem;
    color: #888;
  }

  .step-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
  }

  .grading-progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 20px;
  }

  .progress-circle {
    position: relative;
    width: 200px;
    height: 200px;
    margin-bottom: 30px;
  }

  .progress-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .progress-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 8;
  }

  .progress-fill {
    fill: none;
    stroke: #00ffff;
    stroke-width: 8;
    stroke-linecap: round;
    filter: drop-shadow(0 0 10px #00ffff);
    transition: stroke-dasharray 0.3s ease;
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .progress-number {
    display: block;
    font-size: 2.5rem;
    font-weight: 700;
    color: #00ffff;
    text-shadow: 0 0 10px #00ffff;
  }

  .progress-label {
    display: block;
    color: #888;
    margin-top: 5px;
  }

  .progress-info {
    text-align: center;
  }

  .progress-info h3 {
    color: #fff;
    margin-bottom: 10px;
  }

  .progress-info p {
    color: #888;
    margin-bottom: 20px;
  }

  .processing-animation {
    display: flex;
    justify-content: center;
  }

  .processing-dots {
    display: flex;
    gap: 8px;
  }

  .processing-dots .dot {
    width: 8px;
    height: 8px;
    background: #00ffff;
    border-radius: 50%;
    animation: processingPulse 1.5s ease-in-out infinite;
  }

  .processing-dots .dot:nth-child(2) {
    animation-delay: 0.3s;
  }

  .processing-dots .dot:nth-child(3) {
    animation-delay: 0.6s;
  }

  @keyframes processingPulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.5);
      opacity: 1;
    }
  }

  .results-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 30px;
  }

  .summary-card {
    padding: 25px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 20px;
    border: 1px solid;
  }

  .summary-card.passed {
    background: rgba(0, 255, 136, 0.1);
    border-color: rgba(0, 255, 136, 0.3);
  }

  .summary-card.failed {
    background: rgba(255, 102, 102, 0.1);
    border-color: rgba(255, 102, 102, 0.3);
  }

  .summary-card.pending {
    background: rgba(255, 193, 7, 0.1);
    border-color: rgba(255, 193, 7, 0.3);
  }

  .card-icon {
    font-size: 2rem;
  }

  .summary-card.passed .card-icon {
    color: #00ff88;
  }

  .summary-card.failed .card-icon {
    color: #ff6666;
  }

  .summary-card.pending .card-icon {
    color: #ffc107;
  }

  .card-number {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
  }

  .card-label {
    display: block;
    color: #888;
    margin-top: 5px;
  }

  .results-table {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(0, 255, 255, 0.2);
    border-radius: 15px;
    overflow: hidden;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  }

  .table-header h4 {
    color: #00ffff;
    margin: 0;
  }

  .table-actions {
    display: flex;
    gap: 10px;
  }

  .table-content {
    max-height: 400px;
    overflow-y: auto;
  }

  .result-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr auto;
    gap: 20px;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .result-row:hover {
    background: rgba(0, 255, 255, 0.05);
  }

  .student-info {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .student-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(45deg, #00ffff, #0088ff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-weight: 600;
  }

  .student-details {
    display: flex;
    flex-direction: column;
  }

  .student-id {
    color: #fff;
    font-weight: 500;
  }

  .student-status {
    font-size: 0.8rem;
    margin-top: 2px;
  }

  .student-status.completed {
    color: #00ff88;
  }

  .student-status.failed {
    color: #ff6666;
  }

  .score-display {
    text-align: center;
  }

  .score-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    border: 2px solid;
  }

  .score-circle.high {
    background: rgba(0, 255, 136, 0.2);
    border-color: #00ff88;
    color: #00ff88;
  }

  .score-circle.medium {
    background: rgba(255, 193, 7, 0.2);
    border-color: #ffc107;
    color: #ffc107;
  }

  .score-circle.low {
    background: rgba(255, 102, 102, 0.2);
    border-color: #ff6666;
    color: #ff6666;
  }

  .confidence-bar {
    position: relative;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    overflow: hidden;
  }

  .confidence-fill {
    height: 100%;
    background: linear-gradient(90deg, #00ffff, #0088ff);
    border-radius: 10px;
    transition: width 0.3s ease;
  }

  .confidence-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.8rem;
    color: #fff;
    font-weight: 500;
  }

  .result-actions {
    display: flex;
    justify-content: center;
  }

  .view-icon {
    color: #00ffff;
    font-size: 1.2rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .neon-container {
      padding: 10px;
    }

    .header-content {
      flex-direction: column;
      gap: 10px;
    }

    .progress-indicator {
      gap: 20px;
    }

    .config-grid {
      grid-template-columns: 1fr;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .results-summary {
      grid-template-columns: 1fr;
    }

    .result-row {
      grid-template-columns: 1fr;
      gap: 10px;
      text-align: center;
    }

    .step-actions {
      flex-direction: column;
      gap: 15px;
    }
  }
</style>
