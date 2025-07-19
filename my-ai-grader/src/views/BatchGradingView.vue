<template>
  <div class="batch-grading-view">
    <el-container>
      <el-main>
        <div class="page-header">
          <h1>Batch Grading</h1>
          <p class="page-subtitle">
            Upload and grade multiple student submissions at once
          </p>
        </div>

        <el-card>
          <!-- Progress Steps -->
          <div class="progress-steps">
            <el-steps
              :active="currentStep"
              finish-status="success"
              align-center
            >
              <el-step title="Upload Submissions" :icon="Upload" />
              <el-step title="Configure Grading" :icon="Setting" />
              <el-step title="Review Results" :icon="Document" />
            </el-steps>
          </div>

          <!-- Step 1: Upload Submissions -->
          <div v-if="currentStep === 1" class="step-content">
            <h2>Upload Student Submissions</h2>
            <p class="step-description">
              Upload multiple student submissions as images. Each submission
              will be graded against your standard answer.
            </p>

            <BaseCard title="Submission Settings" class="settings-card">
              <el-form :model="submissionSettings" label-width="150px">
                <el-form-item label="Submission Type">
                  <el-radio-group v-model="submissionSettings.type">
                    <el-radio value="individual">Individual Images</el-radio>
                    <el-radio value="zip">ZIP Archive</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="Student ID Source">
                  <el-select
                    v-model="submissionSettings.idSource"
                    style="width: 200px"
                  >
                    <el-option label="Filename" value="filename" />
                    <el-option label="Image Content" value="content" />
                    <el-option label="Manual Entry" value="manual" />
                  </el-select>
                </el-form-item>

                <el-form-item label="Max Submissions">
                  <el-input-number
                    v-model="submissionSettings.maxSubmissions"
                    :min="1"
                    :max="100"
                  />
                </el-form-item>
              </el-form>
            </BaseCard>

            <MultiImageUploader
              :max-images="submissionSettings.maxSubmissions"
              :max-file-size="5 * 1024 * 1024"
              @images-change="handleSubmissionsChange"
              ref="uploaderRef"
            />

            <div class="step-actions">
              <el-button
                type="primary"
                :disabled="!canProceedToGrading"
                @click="proceedToGrading"
                size="large"
              >
                Next: Configure Grading
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- Step 2: Configure Grading -->
          <div v-if="currentStep === 2" class="step-content">
            <h2>Configure Batch Grading</h2>
            <p class="step-description">
              Set up grading parameters and select the standard answer to use
              for batch grading.
            </p>

            <div class="grading-config">
              <BaseCard title="Standard Answer" class="config-card">
                <div v-if="!standardAnswer" class="no-standard-answer">
                  <el-empty description="No standard answer selected">
                    <el-button type="primary" @click="selectStandardAnswer">
                      Select Standard Answer
                    </el-button>
                  </el-empty>
                </div>
                <div v-else class="standard-answer-preview">
                  <div class="answer-info">
                    <h4>{{ standardAnswer.title }}</h4>
                    <p class="answer-description">
                      {{ standardAnswer.description }}
                    </p>
                    <p class="answer-stats">
                      {{ standardAnswer.images.length }} reference images •
                      {{ standardAnswer.rubric.criteria.length }} criteria
                    </p>
                  </div>
                  <el-button type="text" @click="selectStandardAnswer">
                    Change
                  </el-button>
                </div>
              </BaseCard>

              <BaseCard title="Grading Options" class="config-card">
                <el-form :model="gradingOptions" label-width="180px">
                  <el-form-item label="Detailed Feedback">
                    <el-switch v-model="gradingOptions.detailedFeedback" />
                    <span class="form-help">
                      Generate detailed feedback for each submission
                    </span>
                  </el-form-item>

                  <el-form-item label="Show Confidence Score">
                    <el-switch v-model="gradingOptions.showConfidence" />
                    <span class="form-help">
                      Include AI confidence scores in results
                    </span>
                  </el-form-item>

                  <el-form-item label="Parallel Processing">
                    <el-switch v-model="gradingOptions.parallelProcessing" />
                    <span class="form-help">
                      Process multiple submissions simultaneously (faster)
                    </span>
                  </el-form-item>

                  <el-form-item label="Save Results">
                    <el-switch v-model="gradingOptions.saveResults" />
                    <span class="form-help">
                      Save grading results for future reference
                    </span>
                  </el-form-item>
                </el-form>
              </BaseCard>

              <BaseCard title="Grading Summary" class="config-card">
                <div class="summary-stats">
                  <div class="stat-item">
                    <span class="stat-label">Submissions:</span>
                    <span class="stat-value">{{ submissions.length }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Standard Answer:</span>
                    <span class="stat-value">{{
                      standardAnswer?.title || 'Not selected'
                    }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Estimated Time:</span>
                    <span class="stat-value">~{{ estimatedTime }} minutes</span>
                  </div>
                </div>
              </BaseCard>
            </div>

            <div class="step-actions">
              <el-button @click="currentStep = 1" size="large">
                <el-icon><ArrowLeft /></el-icon>
                Back
              </el-button>
              <el-button
                type="primary"
                :disabled="!canStartGrading"
                :loading="isGrading"
                @click="startBatchGrading"
                size="large"
              >
                Start Batch Grading
                <el-icon><Check /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- Step 3: Review Results -->
          <div v-if="currentStep === 3" class="step-content">
            <h2>Batch Grading Results</h2>
            <p class="step-description">
              Review the grading results for all submissions. You can export the
              results or re-grade specific submissions.
            </p>

            <!-- Grading Progress -->
            <div v-if="isGrading" class="grading-progress">
              <el-progress
                type="circle"
                :percentage="gradingProgress"
                :status="gradingStatus"
              />
              <div class="progress-info">
                <p>{{ gradingMessage }}</p>
                <p class="progress-details">
                  {{ processedCount }} / {{ submissions.length }} processed
                </p>
              </div>
            </div>

            <!-- Results Summary -->
            <div v-else class="results-section">
              <BaseCard title="Overall Results" class="results-card">
                <div class="results-summary">
                  <div class="summary-grid">
                    <div class="summary-item passed">
                      <el-icon><SuccessFilled /></el-icon>
                      <div class="summary-info">
                        <span class="summary-number">{{
                          resultsSummary.passed
                        }}</span>
                        <span class="summary-label">Passed</span>
                      </div>
                    </div>
                    <div class="summary-item failed">
                      <el-icon><CircleCloseFilled /></el-icon>
                      <div class="summary-info">
                        <span class="summary-number">{{
                          resultsSummary.failed
                        }}</span>
                        <span class="summary-label">Failed</span>
                      </div>
                    </div>
                    <div class="summary-item pending">
                      <el-icon><WarningFilled /></el-icon>
                      <div class="summary-info">
                        <span class="summary-number">{{
                          resultsSummary.pending
                        }}</span>
                        <span class="summary-label">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </BaseCard>

              <!-- Detailed Results Table -->
              <BaseCard title="Detailed Results" class="results-card">
                <div class="results-table">
                  <el-table
                    :data="detailedResults"
                    style="width: 100%"
                    :default-sort="{ prop: 'studentId', order: 'ascending' }"
                  >
                    <el-table-column
                      prop="studentId"
                      label="Student ID"
                      sortable
                    />
                    <el-table-column prop="score" label="Score" sortable>
                      <template #default="{ row }">
                        <el-tag :type="getScoreType(row.score)">
                          {{ row.score }}%
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="status" label="Status" sortable>
                      <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)">
                          {{ row.status }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="confidence"
                      label="Confidence"
                      sortable
                    >
                      <template #default="{ row }">
                        <el-progress
                          :percentage="Math.round(row.confidence * 100)"
                          :stroke-width="15"
                          :text-inside="true"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="Actions" width="120">
                      <template #default="{ row }">
                        <el-button
                          type="text"
                          size="small"
                          @click="viewDetailedResult(row)"
                        >
                          View
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </BaseCard>

              <!-- Export Options -->
              <BaseCard title="Export Results" class="results-card">
                <div class="export-options">
                  <el-button @click="exportResults('csv')">
                    <el-icon><Document /></el-icon>
                    Export CSV
                  </el-button>
                  <el-button @click="exportResults('json')">
                    <el-icon><Document /></el-icon>
                    Export JSON
                  </el-button>
                  <el-button @click="exportResults('pdf')">
                    <el-icon><Document /></el-icon>
                    Export PDF Report
                  </el-button>
                </div>
              </BaseCard>
            </div>

            <div class="step-actions">
              <el-button @click="currentStep = 2" size="large">
                <el-icon><ArrowLeft /></el-icon>
                Back
              </el-button>
              <el-button type="primary" @click="resetBatchGrading" size="large">
                Grade Another Batch
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>

    <!-- Standard Answer Selection Modal -->
    <BaseModal
      v-model:isOpen="showStandardAnswerModal"
      title="Select Standard Answer"
      size="large"
    >
      <div class="standard-answer-list">
        <div
          v-for="answer in availableStandardAnswers"
          :key="answer.id"
          class="answer-option"
          :class="{ selected: selectedAnswerId === answer.id }"
          @click="selectedAnswerId = answer.id"
        >
          <div class="answer-option-content">
            <h4>{{ answer.title }}</h4>
            <p>{{ answer.description }}</p>
            <div class="answer-meta">
              <span>{{ answer.images.length }} images</span>
              <span>{{ answer.rubric.criteria.length }} criteria</span>
            </div>
          </div>
          <el-icon v-if="selectedAnswerId === answer.id" class="check-icon">
            <Check />
          </el-icon>
        </div>
      </div>

      <template #footer>
        <el-button @click="showStandardAnswerModal = false">Cancel</el-button>
        <el-button
          type="primary"
          :disabled="!selectedAnswerId"
          @click="confirmStandardAnswer"
        >
          Select
        </el-button>
      </template>
    </BaseModal>

    <!-- Detailed Result Modal -->
    <BaseModal
      v-model:isOpen="showResultModal"
      title="Detailed Grading Result"
      size="large"
    >
      <div v-if="selectedResult" class="detailed-result">
        <div class="result-header">
          <h3>Student: {{ selectedResult.studentId }}</h3>
          <el-tag :type="getScoreType(selectedResult.score)" size="large">
            Score: {{ selectedResult.score }}%
          </el-tag>
        </div>

        <div class="result-content">
          <div class="result-section">
            <h4>Submission Image</h4>
            <img
              :src="selectedResult.submissionImage"
              :alt="`Submission by ${selectedResult.studentId}`"
              class="submission-preview"
            />
          </div>

          <div class="result-section">
            <h4>AI Feedback</h4>
            <div
              class="feedback-content"
              v-html="selectedResult.feedback"
            ></div>
          </div>

          <div class="result-section">
            <h4>Grading Details</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Confidence">
                {{ Math.round(selectedResult.confidence * 100) }}%
              </el-descriptions-item>
              <el-descriptions-item label="Processing Time">
                {{ selectedResult.processingTime }}ms
              </el-descriptions-item>
              <el-descriptions-item label="Status">
                <el-tag :type="getStatusType(selectedResult.status)">
                  {{ selectedResult.status }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item
                label="Error Message"
                v-if="selectedResult.error"
              >
                {{ selectedResult.error }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    Upload,
    Setting,
    Document,
    ArrowRight,
    ArrowLeft,
    Check,
    Refresh,
    SuccessFilled,
    CircleCloseFilled,
    WarningFilled,
    Close,
  } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import BaseCard from '@/components/common/BaseCard.vue';
  import BaseModal from '@/components/common/BaseModal.vue';
  import MultiImageUploader from '@/components/upload/MultiImageUploader.vue';
  import { useEnhancedGradingStore } from '@/stores/enhancedGradingStore';
  import { apiService } from '@/services/apiService';
  import type {
    StandardAnswer,
    StudentSubmission,
    BatchGradeResponse,
    BatchGradingResult,
  } from '@/types/grading';

  const router = useRouter();
  const gradingStore = useEnhancedGradingStore();

  // State
  const currentStep = ref(1);
  const submissions = ref<StudentSubmission[]>([]);
  const standardAnswer = ref<StandardAnswer | null>(null);
  const isGrading = ref(false);
  const gradingProgress = ref(0);
  const gradingMessage = ref('');
  const processedCount = ref(0);
  const detailedResults = ref<BatchGradingResult[]>([]);

  // Modals
  const showStandardAnswerModal = ref(false);
  const showResultModal = ref(false);
  const selectedAnswerId = ref<string>('');
  const selectedResult = ref<BatchGradingResult | null>(null);

  // Settings
  const submissionSettings = ref({
    type: 'individual' as 'individual' | 'zip',
    idSource: 'filename' as 'filename' | 'content' | 'manual',
    maxSubmissions: 50,
  });

  const gradingOptions = ref({
    detailedFeedback: true,
    showConfidence: true,
    parallelProcessing: true,
    saveResults: true,
  });

  // Computed
  const uploaderRef = ref<InstanceType<typeof MultiImageUploader>>();

  const canProceedToGrading = computed(() => submissions.value.length > 0);

  const canStartGrading = computed(
    () => standardAnswer.value !== null && submissions.value.length > 0,
  );

  const estimatedTime = computed(() => {
    const baseTime = submissions.value.length * 2;
    return gradingOptions.value.parallelProcessing
      ? Math.ceil(baseTime / 3)
      : baseTime;
  });

  const gradingStatus = computed(() => {
    if (gradingProgress.value === 100) return 'success';
    if (isGrading.value) return '';
    return 'exception';
  });

  const resultsSummary = computed(() => {
    const passed = detailedResults.value.filter((r) => r.score >= 70).length;
    const failed = detailedResults.value.filter((r) => r.score < 70).length;
    const pending = submissions.value.length - detailedResults.value.length;

    return { passed, failed, pending };
  });

  const availableStandardAnswers = computed(() => gradingStore.standardAnswers);

  // Methods
  const handleSubmissionsChange = (newSubmissions: any[]) => {
    submissions.value = newSubmissions.map((image, index) => ({
      id: image.id,
      studentId: extractStudentId(image.name, index),
      imageUrl: image.dataUrl,
      fileName: image.name,
      fileSize: image.size,
      uploadTime: new Date().toISOString(),
    }));
  };

  const extractStudentId = (fileName: string, index: number): string => {
    switch (submissionSettings.value.idSource) {
      case 'filename': {
        // Extract from filename (before first dot or underscore)
        const nameWithoutExt = fileName.split('.')[0];
        return nameWithoutExt.split('_')[0] || `student_${index + 1}`;
      }
      case 'content': {
        // Placeholder for OCR extraction
        return `student_${index + 1}`;
      }
      case 'manual': {
        return `student_${index + 1}`;
      }
      default: {
        return `student_${index + 1}`;
      }
    }
  };

  const proceedToGrading = () => {
    if (canProceedToGrading.value) {
      currentStep.value = 2;
    }
  };

  const selectStandardAnswer = () => {
    selectedAnswerId.value = standardAnswer.value?.id || '';
    showStandardAnswerModal.value = true;
  };

  const confirmStandardAnswer = () => {
    const selected = availableStandardAnswers.value.find(
      (answer) => answer.id === selectedAnswerId.value,
    );
    if (selected) {
      standardAnswer.value = selected;
    }
    showStandardAnswerModal.value = false;
  };

  const startBatchGrading = async () => {
    if (!canStartGrading.value) return;

    isGrading.value = true;
    currentStep.value = 3;
    gradingProgress.value = 0;
    processedCount.value = 0;
    detailedResults.value = [];

    try {
      const requestData = {
        standardAnswerId: standardAnswer.value!.id,
        submissions: submissions.value,
        options: gradingOptions.value,
      };

      const response = await apiService.batchGrade(requestData);

      if (response.success) {
        await processBatchResults(response.data!);
      } else {
        ElMessage.error(response.error || 'Batch grading failed');
      }
    } catch (error) {
      ElMessage.error('Error during batch grading');
      console.error('Batch grading error:', error);
    } finally {
      isGrading.value = false;
    }
  };

  const processBatchResults = async (responses: BatchGradeResponse[]) => {
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const submission = submissions.value[i];

      const result: BatchGradingResult = {
        studentId: submission.studentId,
        score: response.score,
        feedback: response.feedback,
        confidence: response.confidence,
        status: response.status,
        submissionImage: submission.imageUrl,
        processingTime: response.processingTime,
        error: response.error,
      };

      detailedResults.value.push(result);
      processedCount.value = i + 1;
      gradingProgress.value = Math.round(
        ((i + 1) / submissions.value.length) * 100,
      );
      gradingMessage.value = `Processing ${i + 1} of ${submissions.value.length}`;

      // Small delay for UI updates
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    gradingMessage.value = 'Batch grading completed!';

    if (gradingOptions.value.saveResults) {
      await gradingStore.saveBatchResults({
        id: generateBatchId(),
        standardAnswerId: standardAnswer.value!.id,
        submissions: submissions.value,
        results: detailedResults.value,
        timestamp: new Date().toISOString(),
        options: gradingOptions.value,
      });
    }
  };

  const generateBatchId = (): string => {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const viewDetailedResult = (result: BatchGradingResult) => {
    selectedResult.value = result;
    showResultModal.value = true;
  };

  const exportResults = (format: 'csv' | 'json' | 'pdf') => {
    const data = {
      batchId: generateBatchId(),
      standardAnswer: standardAnswer.value,
      results: detailedResults.value,
      summary: resultsSummary.value,
      timestamp: new Date().toISOString(),
    };

    switch (format) {
      case 'csv':
        exportToCSV(data);
        break;
      case 'json':
        exportToJSON(data);
        break;
      case 'pdf':
        exportToPDF(data);
        break;
    }
  };

  const exportToCSV = (data: any) => {
    const headers = [
      'Student ID',
      'Score',
      'Status',
      'Confidence',
      'Processing Time',
    ];
    const rows = data.results.map((r: BatchGradingResult) => [
      r.studentId,
      r.score,
      r.status,
      r.confidence,
      r.processingTime,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    downloadFile(csvContent, 'batch-grading-results.csv', 'text/csv');
  };

  const exportToJSON = (data: any) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, 'batch-grading-results.json', 'application/json');
  };

  const exportToPDF = (data: any) => {
    // Placeholder for PDF export
    ElMessage.info('PDF export will be implemented in the next version');
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetBatchGrading = () => {
    currentStep.value = 1;
    submissions.value = [];
    detailedResults.value = [];
    gradingProgress.value = 0;
    processedCount.value = 0;

    if (uploaderRef.value) {
      uploaderRef.value.clearAll();
    }
  };

  const getScoreType = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getStatusType = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'processing':
        return 'info';
      default:
        return 'info';
    }
  };

  onMounted(async () => {
    await gradingStore.loadStandardAnswers();
  });
</script>

<style scoped>
  .batch-grading-view {
    @apply h-full;
  }

  .page-header {
    @apply mb-6 text-center;
  }

  .page-header h1 {
    @apply text-3xl font-bold text-gray-900 mb-2;
  }

  .page-subtitle {
    @apply text-lg text-gray-600;
  }

  .progress-steps {
    @apply mb-8;
  }

  .step-content {
    @apply space-y-6;
  }

  .step-content h2 {
    @apply text-2xl font-semibold text-gray-900 mb-2;
  }

  .step-description {
    @apply text-gray-600 mb-6;
  }

  .settings-card,
  .config-card,
  .results-card {
    @apply mb-6;
  }

  .no-standard-answer {
    @apply py-8;
  }

  .standard-answer-preview {
    @apply flex items-center justify-between;
  }

  .answer-info h4 {
    @apply text-lg font-semibold mb-1;
  }

  .answer-description {
    @apply text-gray-600 mb-1;
  }

  .answer-stats {
    @apply text-sm text-gray-500;
  }

  .summary-stats {
    @apply space-y-2;
  }

  .stat-item {
    @apply flex justify-between items-center;
  }

  .stat-label {
    @apply text-gray-600;
  }

  .stat-value {
    @apply font-semibold text-gray-900;
  }

  .form-help {
    @apply block text-sm text-gray-500 mt-1;
  }

  .step-actions {
    @apply flex justify-between mt-8;
  }

  .grading-progress {
    @apply flex flex-col items-center justify-center py-12 space-y-4;
  }

  .progress-info {
    @apply text-center;
  }

  .progress-details {
    @apply text-sm text-gray-600;
  }

  .results-section {
    @apply space-y-6;
  }

  .results-summary {
    @apply mb-4;
  }

  .summary-grid {
    @apply grid grid-cols-3 gap-4;
  }

  .summary-item {
    @apply flex items-center space-x-3 p-4 rounded-lg;
  }

  .summary-item.passed {
    @apply bg-green-50 text-green-700;
  }

  .summary-item.failed {
    @apply bg-red-50 text-red-700;
  }

  .summary-item.pending {
    @apply bg-yellow-50 text-yellow-700;
  }

  .summary-info {
    @apply flex-1;
  }

  .summary-number {
    @apply text-2xl font-bold block;
  }

  .summary-label {
    @apply text-sm;
  }

  .results-table {
    @apply overflow-x-auto;
  }

  .export-options {
    @apply flex gap-4;
  }

  .standard-answer-list {
    @apply space-y-2;
  }

  .answer-option {
    @apply flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors;
  }

  .answer-option:hover {
    @apply bg-gray-50;
  }

  .answer-option.selected {
    @apply bg-blue-50 border-blue-500;
  }

  .answer-option-content {
    @apply flex-1;
  }

  .answer-option-content h4 {
    @apply font-semibold mb-1;
  }

  .answer-option-content p {
    @apply text-sm text-gray-600 mb-2;
  }

  .answer-meta {
    @apply text-xs text-gray-500 space-x-4;
  }

  .check-icon {
    @apply text-blue-500 text-xl;
  }

  .detailed-result {
    @apply space-y-6;
  }

  .result-header {
    @apply flex items-center justify-between mb-4;
  }

  .result-content {
    @apply space-y-6;
  }

  .result-section h4 {
    @apply font-semibold mb-3;
  }

  .submission-preview {
    @apply max-w-full max-h-96 rounded-lg border;
  }

  .feedback-content {
    @apply bg-gray-50 p-4 rounded-lg;
  }
</style>
