import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type {
  EnhancedGradingStore as EnhancedGradingState,
  StandardAnswerImage,
  StudentSubmission,
  BatchProgress,
  MultiAnalyzeResponse,
  BatchGradeResponse,
  GradingResult,
  HistoricalResult,
  StandardAnswer,
} from '@/types/grading';
import { useApiConfigStore } from './apiConfigStore';

export const useEnhancedGradingStore = defineStore('enhancedGrading', () => {
  // Legacy single-image support (backward compatibility)
  const standardAnswerImageUrl = ref<string | null>(null);
  const analyzedStandardAnswerText = ref<string | null>(null);
  const studentAnswerImageUrl = ref<string | null>(null);
  const gradingRubric = ref<string | null>(null);
  const gradingResult = ref<string | null>(null);
  const gradingError = ref<string | null>(null);
  const isLoadingGrading = ref(false);

  // New multi-image standard answer support
  const standardAnswerImages = ref<StandardAnswerImage[]>([]);
  const multiImageAnalysis = ref<string | null>(null);
  const suggestedRubric = ref<string>('');
  const isAnalyzingMultiImage = ref(false);

  // Batch processing
  const studentSubmissions = ref<StudentSubmission[]>([]);
  const batchProcessingStatus = ref<
    'idle' | 'processing' | 'completed' | 'error'
  >('idle');
  const currentBatchId = ref<string | null>(null);
  const batchProgress = ref<BatchProgress>({
    total: 0,
    completed: 0,
    errors: 0,
  });

  // Results management
  const selectedSubmissionId = ref<string | null>(null);
  const resultsFilter = ref<'all' | 'completed' | 'errors'>('all');

  // Historical data
  const historicalResults = ref<HistoricalResult[]>([]);
  const standardAnswers = ref<StandardAnswer[]>([]);

  const apiConfigStore = useApiConfigStore();

  // Computed getters
  const hasStandardAnswerImages = computed(
    () => standardAnswerImages.value.length > 0,
  );
  const hasMultiImageAnalysis = computed(() => !!multiImageAnalysis.value);
  const hasStudentSubmissions = computed(
    () => studentSubmissions.value.length > 0,
  );
  const completedSubmissions = computed(() =>
    studentSubmissions.value.filter((s) => s.status === 'completed'),
  );
  const pendingSubmissions = computed(() =>
    studentSubmissions.value.filter((s) => s.status === 'pending'),
  );
  const errorSubmissions = computed(() =>
    studentSubmissions.value.filter((s) => s.status === 'error'),
  );
  const filteredSubmissions = computed(() => {
    switch (resultsFilter.value) {
      case 'completed':
        return completedSubmissions.value;
      case 'errors':
        return errorSubmissions.value;
      default:
        return studentSubmissions.value;
    }
  });

  // Legacy compatibility getters
  const hasLegacyStandardAnswer = computed(
    () => !!analyzedStandardAnswerText.value,
  );
  const hasLegacyGradingContext = computed(
    () => !!analyzedStandardAnswerText.value && !!gradingRubric.value,
  );

  // Historical data getters
  const completedResults = computed(() =>
    historicalResults.value.filter((r) => r.status === 'completed'),
  );
  const failedResults = computed(() =>
    historicalResults.value.filter((r) => r.status === 'failed'),
  );

  // Actions
  const setStandardAnswerImageUrl = (url: string | null) => {
    standardAnswerImageUrl.value = url;
  };

  const setStudentAnswerImageUrl = (url: string | null) => {
    studentAnswerImageUrl.value = url;
  };

  const setAnalyzedStandardAnswerText = (text: string | null) => {
    analyzedStandardAnswerText.value = text;
  };

  const setGradingRubric = (rubric: string | null) => {
    gradingRubric.value = rubric;
  };

  // Multi-image standard answer management
  const addStandardAnswerImage = (image: StandardAnswerImage) => {
    standardAnswerImages.value.push(image);
    standardAnswerImages.value.sort((a, b) => a.order - b.order);
  };

  const removeStandardAnswerImage = (imageId: string) => {
    const index = standardAnswerImages.value.findIndex(
      (img) => img.id === imageId,
    );
    if (index > -1) {
      standardAnswerImages.value.splice(index, 1);
      // Reorder remaining images
      standardAnswerImages.value.forEach((img, idx) => {
        img.order = idx;
      });
    }
  };

  const reorderStandardAnswerImages = (newOrder: StandardAnswerImage[]) => {
    standardAnswerImages.value = newOrder.map((img, idx) => ({
      ...img,
      order: idx,
    }));
  };

  const clearStandardAnswerImages = () => {
    standardAnswerImages.value = [];
    multiImageAnalysis.value = null;
    suggestedRubric.value = '';
  };

  // Multi-image analysis
  const analyzeMultiImageStandardAnswer = async (
    images: StandardAnswerImage[],
  ) => {
    if (!apiConfigStore.isValidConfig) {
      ElMessage.error('Please configure API settings first');
      return;
    }

    if (images.length === 0) {
      ElMessage.error('Please upload at least one standard answer image');
      return;
    }

    isAnalyzingMultiImage.value = true;
    multiImageAnalysis.value = null;
    suggestedRubric.value = '';

    try {
      const requestData = {
        images: images.map((img) => ({
          data: img.dataUrl,
          order: img.order,
          name: img.name,
        })),
      };

      const response = await fetch('/api/analyze_multi_answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-URL': apiConfigStore.apiConfig.apiUrl,
          'X-API-KEY': apiConfigStore.apiConfig.apiKey,
          'X-MODEL-NAME': apiConfigStore.apiConfig.modelName,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: MultiAnalyzeResponse = await response.json();
      multiImageAnalysis.value = data.analyzedText;
      suggestedRubric.value = data.suggestedRubricJson;

      ElMessage.success('Multi-image analysis completed successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Analysis failed';
      ElMessage.error(errorMessage);
      throw error;
    } finally {
      isAnalyzingMultiImage.value = false;
    }
  };

  // Batch processing
  const addStudentSubmission = (submission: StudentSubmission) => {
    const existingIndex = studentSubmissions.value.findIndex(
      (s) => s.id === submission.id,
    );

    if (existingIndex > -1) {
      studentSubmissions.value[existingIndex] = submission;
    } else {
      studentSubmissions.value.push(submission);
    }
  };

  const removeStudentSubmission = (submissionId: string) => {
    const index = studentSubmissions.value.findIndex(
      (s) => s.id === submissionId,
    );
    if (index > -1) {
      studentSubmissions.value.splice(index, 1);
    }
  };

  const clearStudentSubmissions = () => {
    studentSubmissions.value = [];
    currentBatchId.value = null;
    batchProcessingStatus.value = 'idle';
    batchProgress.value = { total: 0, completed: 0, errors: 0 };
  };

  const processBatchGrading = async (submissions: StudentSubmission[]) => {
    if (!apiConfigStore.isValidConfig) {
      ElMessage.error('Please configure API settings first');
      return;
    }

    if (standardAnswerImages.value.length === 0) {
      ElMessage.error('Please upload standard answer images first');
      return;
    }

    if (!multiImageAnalysis.value) {
      ElMessage.error('Please analyze standard answer images first');
      return;
    }

    if (submissions.length === 0) {
      ElMessage.error('Please upload student submissions');
      return;
    }

    batchProcessingStatus.value = 'processing';
    currentBatchId.value = `batch_${Date.now()}`;
    batchProgress.value = {
      total: submissions.length,
      completed: 0,
      errors: 0,
    };

    // Update submissions in store
    submissions.forEach((submission) => {
      addStudentSubmission({
        ...submission,
        status: 'pending',
      });
    });

    try {
      const requestData = {
        standardAnswerImages: standardAnswerImages.value.map((img) => ({
          data: img.dataUrl,
          order: img.order,
        })),
        standardAnalysis: multiImageAnalysis.value,
        rubric: suggestedRubric.value,
        studentSubmissions: submissions.map((sub) => ({
          id: sub.id,
          name: sub.name,
          imageData: sub.dataUrl,
        })),
      };

      const response = await fetch('/api/batch_grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-URL': apiConfigStore.apiConfig.apiUrl,
          'X-API-KEY': apiConfigStore.apiConfig.apiKey,
          'X-MODEL-NAME': apiConfigStore.apiConfig.modelName,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: BatchGradeResponse = await response.json();

      // Update submissions with results
      data.results.forEach((result) => {
        const submission = studentSubmissions.value.find(
          (s) => s.id === result.studentId,
        );
        if (submission) {
          if (result.status === 'completed' && result.feedbackMarkdown) {
            submission.status = 'completed';
            submission.result = {
              feedbackMarkdown: result.feedbackMarkdown,
            };
          } else {
            submission.status = 'error';
            submission.error = result.error || 'Processing failed';
          }
        }
      });

      batchProgress.value = data.summary;
      batchProcessingStatus.value = 'completed';

      ElMessage.success(
        `Batch processing completed: ${data.summary.completed}/${data.summary.total} successful`,
      );
    } catch (error) {
      batchProcessingStatus.value = 'error';
      const errorMessage =
        error instanceof Error ? error.message : 'Batch processing failed';
      ElMessage.error(errorMessage);
      throw error;
    }
  };

  const retryFailedSubmission = async (submissionId: string) => {
    const submission = studentSubmissions.value.find(
      (s) => s.id === submissionId,
    );
    if (!submission) {
      ElMessage.error('Submission not found');
      return;
    }

    if (submission.status !== 'error') {
      ElMessage.warning('Can only retry failed submissions');
      return;
    }

    submission.status = 'processing';

    try {
      // Implement single submission retry logic
      // This would be a separate endpoint for single submission processing
      ElMessage.success('Retry functionality to be implemented');
    } catch (error) {
      submission.status = 'error';
      submission.error =
        error instanceof Error ? error.message : 'Retry failed';
      throw error;
    }
  };

  const selectSubmission = (submissionId: string | null) => {
    selectedSubmissionId.value = submissionId;
  };

  const updateSubmissionResult = (
    submissionId: string,
    result: GradingResult,
  ) => {
    const submission = studentSubmissions.value.find(
      (s) => s.id === submissionId,
    );
    if (submission) {
      submission.result = result;
    }
  };

  const exportBatchResults = async (
    format: 'csv' | 'excel' | 'pdf' = 'csv',
  ) => {
    const completed = completedSubmissions.value;
    if (completed.length === 0) {
      ElMessage.warning('No completed results to export');
      return;
    }

    try {
      // Export functionality would be implemented here
      ElMessage.success(`Export to ${format} functionality to be implemented`);
    } catch (error) {
      ElMessage.error('Export failed');
      throw error;
    }
  };

  // Legacy compatibility actions
  const gradeStudentAnswer = async (
    studentImageUrl: string,
    rubric: string,
    standardAnswerText: string,
  ) => {
    // This maintains backward compatibility with the existing single-image workflow
    gradingResult.value = null;
    gradingError.value = null;
    isLoadingGrading.value = true;

    try {
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-URL': apiConfigStore.apiConfig.apiUrl,
          'X-API-KEY': apiConfigStore.apiConfig.apiKey,
          'X-MODEL-NAME': apiConfigStore.apiConfig.modelName,
        },
        body: JSON.stringify({
          student_image: studentImageUrl,
          rubric,
          standard_answer: standardAnswerText,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      gradingResult.value = data.feedback;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Grading failed';
      gradingError.value = errorMessage;
      throw error;
    } finally {
      isLoadingGrading.value = false;
    }
  };

  // Historical data management
  const loadHistoricalResults = async () => {
    try {
      // Load from local storage or API
      const stored = localStorage.getItem('grading_historical_results');
      if (stored) {
        historicalResults.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load historical results:', error);
      historicalResults.value = [];
    }
  };

  const saveHistoricalResult = async (result: HistoricalResult) => {
    try {
      historicalResults.value.unshift(result);
      localStorage.setItem(
        'grading_historical_results',
        JSON.stringify(historicalResults.value.slice(0, 1000)), // Keep last 1000
      );
    } catch (error) {
      console.error('Failed to save historical result:', error);
    }
  };

  const loadStandardAnswers = async () => {
    try {
      // Load from local storage or API
      const stored = localStorage.getItem('grading_standard_answers');
      if (stored) {
        standardAnswers.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load standard answers:', error);
      standardAnswers.value = [];
    }
  };

  const saveStandardAnswer = async (answer: StandardAnswer) => {
    try {
      const existingIndex = standardAnswers.value.findIndex(
        (a) => a.id === answer.id,
      );
      if (existingIndex > -1) {
        standardAnswers.value[existingIndex] = answer;
      } else {
        standardAnswers.value.unshift(answer);
      }
      localStorage.setItem(
        'grading_standard_answers',
        JSON.stringify(standardAnswers.value),
      );
    } catch (error) {
      console.error('Failed to save standard answer:', error);
    }
  };

  const saveBatchResults = async (batchData: {
    id: string;
    standardAnswerId: string;
    submissions: StudentSubmission[];
    results: BatchGradingResult[];
    timestamp: string;
    options: any;
  }) => {
    try {
      // Convert batch results to historical results
      const historicalResultsData = batchData.results.map((result) => ({
        id: `${batchData.id}_${result.studentId}`,
        studentId: result.studentId,
        standardAnswerId: batchData.standardAnswerId,
        standardAnswerTitle:
          standardAnswers.value.find((a) => a.id === batchData.standardAnswerId)
            ?.title || 'Unknown',
        score: result.score,
        maxScore: 100,
        feedback: result.feedback,
        submissionImage: result.submissionImage,
        timestamp: batchData.timestamp,
        status: result.error ? 'failed' : 'completed',
        confidence: result.confidence,
        processingTime: result.processingTime,
        criteria: [], // TODO: Parse from feedback
      }));

      for (const result of historicalResultsData) {
        await saveHistoricalResult(result);
      }
    } catch (error) {
      console.error('Failed to save batch results:', error);
    }
  };

  const regradeResult = async (resultId: string) => {
    const result = historicalResults.value.find((r) => r.id === resultId);
    if (!result) {
      throw new Error('Result not found');
    }

    // TODO: Implement re-grading functionality
    return { success: false, error: 'Re-grading not implemented yet' };
  };

  const deleteHistoricalResult = async (resultId: string) => {
    try {
      const index = historicalResults.value.findIndex((r) => r.id === resultId);
      if (index > -1) {
        historicalResults.value.splice(index, 1);
        localStorage.setItem(
          'grading_historical_results',
          JSON.stringify(historicalResults.value),
        );
      }
    } catch (error) {
      console.error('Failed to delete historical result:', error);
    }
  };

  // Initialization
  const initialize = () => {
    // Load persisted state if needed
    apiConfigStore.initialize();
    loadHistoricalResults();
    loadStandardAnswers();
  };

  const resetAll = () => {
    // Reset all state
    standardAnswerImages.value = [];
    multiImageAnalysis.value = null;
    suggestedRubric.value = '';
    studentSubmissions.value = [];
    batchProcessingStatus.value = 'idle';
    currentBatchId.value = null;
    batchProgress.value = { total: 0, completed: 0, errors: 0 };
    selectedSubmissionId.value = null;
    resultsFilter.value = 'all';
    historicalResults.value = [];
    standardAnswers.value = [];

    // Legacy state
    standardAnswerImageUrl.value = null;
    analyzedStandardAnswerText.value = null;
    studentAnswerImageUrl.value = null;
    gradingRubric.value = null;
    gradingResult.value = null;
    gradingError.value = null;
    isLoadingGrading.value = false;
  };

  return {
    // Legacy state (backward compatibility)
    standardAnswerImageUrl,
    analyzedStandardAnswerText,
    studentAnswerImageUrl,
    gradingRubric,
    gradingResult,
    gradingError,
    isLoadingGrading,

    // New multi-image state
    standardAnswerImages,
    multiImageAnalysis,
    suggestedRubric,
    isAnalyzingMultiImage,

    // Batch processing state
    studentSubmissions,
    batchProcessingStatus,
    currentBatchId,
    batchProgress,

    // Results management state
    selectedSubmissionId,
    resultsFilter,
    historicalResults,
    standardAnswers,

    // Computed getters
    hasStandardAnswerImages,
    hasMultiImageAnalysis,
    hasStudentSubmissions,
    completedSubmissions,
    pendingSubmissions,
    errorSubmissions,
    filteredSubmissions,
    hasLegacyStandardAnswer,
    hasLegacyGradingContext,
    completedResults,
    failedResults,

    // Legacy actions
    setStandardAnswerImageUrl,
    setStudentAnswerImageUrl,
    setAnalyzedStandardAnswerText,
    setGradingRubric,
    gradeStudentAnswer,

    // Multi-image actions
    addStandardAnswerImage,
    removeStandardAnswerImage,
    reorderStandardAnswerImages,
    clearStandardAnswerImages,
    analyzeMultiImageStandardAnswer,

    // Batch processing actions
    addStudentSubmission,
    removeStudentSubmission,
    clearStudentSubmissions,
    processBatchGrading,
    retryFailedSubmission,
    selectSubmission,
    updateSubmissionResult,
    exportBatchResults,

    // Historical data actions
    loadHistoricalResults,
    saveHistoricalResult,
    loadStandardAnswers,
    saveStandardAnswer,
    saveBatchResults,
    regradeResult,
    deleteHistoricalResult,

    // Utility actions
    initialize,
    resetAll,
  };
});
