import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type {
  StandardAnswerImage,
  StudentSubmission,
  BatchProgress,
  MultiAnalyzeResponse,
  BatchGradeResponse,
  GradingResult,
  HistoricalResult,
  StandardAnswer,
  BatchGradingResult,
} from '@/types/grading';
import { useConfigManagerStore } from './configManager';
import { useApiConfigStore } from './apiConfigStore';

export const useGradingStore = defineStore('grading', () => {
  // 统一的状态管理 - 合并所有grading相关功能

  // 基础状态
  const apiConfigStore = useApiConfigStore();

  // 标准答案相关
  const standardAnswerImages = ref<StandardAnswerImage[]>([]);
  const standardAnswerText = ref<string | null>(null);
  const suggestedRubric = ref<string>('');
  const isAnalyzingStandard = ref(false);
  const standardAnalysisError = ref<string | null>(null);

  // 学生提交相关
  const studentSubmissions = ref<StudentSubmission[]>([]);
  const currentSubmissions = ref<StudentSubmission[]>([]);

  // 批处理状态
  const batchProcessingStatus = ref<
    'idle' | 'processing' | 'completed' | 'error'
  >('idle');
  const currentBatchId = ref<string | null>(null);
  const batchProgress = ref<BatchProgress>({
    total: 0,
    completed: 0,
    errors: 0,
  });

  // 单张图片处理（向后兼容）
  const singleStandardImage = ref<string | null>(null);
  const singleStudentImage = ref<string | null>(null);
  const singleGradingResult = ref<string | null>(null);
  const singleGradingError = ref<string | null>(null);
  const isLoadingSingle = ref(false);

  // 历史数据
  const historicalResults = ref<HistoricalResult[]>([]);
  const savedStandardAnswers = ref<StandardAnswer[]>([]);

  // 计算属性
  const hasStandardImages = computed(
    () => standardAnswerImages.value.length > 0,
  );
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

  // 向后兼容的计算属性
  const standardAnswerImageUrl = computed(() =>
    standardAnswerImages.value.length > 0
      ? standardAnswerImages.value[0].dataUrl
      : null,
  );
  const analyzedStandardAnswerText = computed(() => standardAnswerText.value);
  const gradingRubric = computed(() => suggestedRubric.value);
  const gradingResult = computed(() => singleGradingResult.value);
  const gradingError = computed(() => singleGradingError.value);
  const isLoadingGrading = computed(
    () => isLoadingSingle.value || batchProcessingStatus.value === 'processing',
  );
  const isLoadingAnalysis = computed(() => isAnalyzingStandard.value);
  const analysisError = computed(() => standardAnalysisError.value);
  const studentAnswerImageUrl = computed(() => singleStudentImage.value);

  // 标准答案管理
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
      standardAnswerImages.value.forEach((img, idx) => {
        img.order = idx;
      });
    }
  };

  const clearStandardAnswerImages = () => {
    standardAnswerImages.value = [];
    standardAnswerText.value = null;
    suggestedRubric.value = '';
    standardAnalysisError.value = null;
  };

  // 学生提交管理
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
    currentSubmissions.value = [];
    batchProcessingStatus.value = 'idle';
    currentBatchId.value = null;
    batchProgress.value = { total: 0, completed: 0, errors: 0 };
  };

  // 标准答案分析
  const analyzeStandardAnswer = async (imageDataUrl: string) => {
    if (!apiConfigStore.isValidConfig) {
      ElMessage.error('Please configure API settings first');
      return;
    }

    isAnalyzingStandard.value = true;
    standardAnalysisError.value = null;
    standardAnswerText.value = null;
    suggestedRubric.value = '';

    try {
      const response = await fetch('/api/analyze_answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-URL': apiConfigStore.apiConfig.apiUrl,
          'X-API-KEY': apiConfigStore.apiConfig.apiKey,
          'X-MODEL-NAME': apiConfigStore.apiConfig.modelName,
        },
        body: JSON.stringify({ imageData: imageDataUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      standardAnswerText.value = data.analyzedText || 'No text content received';
      suggestedRubric.value = data.suggestedRubricJson || '';

      ElMessage.success('Standard answer analysis completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      standardAnalysisError.value = errorMessage;
      ElMessage.error(errorMessage);
    } finally {
      isAnalyzingStandard.value = false;
    }
  };

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

    isAnalyzingStandard.value = true;
    standardAnalysisError.value = null;

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
      standardAnswerText.value = data.analyzedText;
      suggestedRubric.value = data.suggestedRubricJson;

      ElMessage.success('Multi-image standard answer analysis completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      standardAnalysisError.value = errorMessage;
      ElMessage.error(errorMessage);
    } finally {
      isAnalyzingStandard.value = false;
    }
  };

  // Single image grading (backward compatible)
  const gradeSingleStudentAnswer = async (
    studentImageUrl: string,
    rubric: string,
    standardAnswerText: string,
  ) => {
    if (!apiConfigStore.isValidConfig) {
      ElMessage.error('Please configure API settings first');
      return;
    }

    if (!rubric.trim()) {
      singleGradingError.value = 'Grading rubric cannot be empty';
      return;
    }

    isLoadingSingle.value = true;
    singleGradingError.value = null;
    singleGradingResult.value = null;

    try {
      const gradingPrompt = `
        You are an AI grading assistant.
        The student has submitted an answer (provided image).
        The standard answer has been analyzed, key content is:
        --- Start Standard Answer Analysis ---
        ${standardAnswerText}
        --- End Standard Answer Analysis ---

        The grading rubric is:
        --- Start Grading Rubric ---
        ${rubric}
        --- End Grading Rubric ---

        Based on the student's answer image, standard answer analysis, and provided grading rubric, please grade the student's answer.
        **Your entire output must be a well-formatted Markdown document.**
        Include:
        1. Total score (e.g., "## Total Score: X/Y").
        2. Detailed feedback for each grading criterion.
        3. Summary of student performance.
        Use appropriate Markdown formatting to make it clear and readable.
      `;

      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-URL': apiConfigStore.apiConfig.apiUrl,
          'X-API-KEY': apiConfigStore.apiConfig.apiKey,
          'X-MODEL-NAME': apiConfigStore.apiConfig.modelName,
        },
        body: JSON.stringify({
          imageData: studentImageUrl,
          prompt: gradingPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      singleGradingResult.value = data.feedback;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Grading failed';
      singleGradingError.value = errorMessage;
    } finally {
      isLoadingSingle.value = false;
    }
  };

  // Batch processing
  const processBatchGrading = async (submissions: StudentSubmission[]) => {
    if (!apiConfigStore.isValidConfig) {
      ElMessage.error('Please configure API settings first');
      return;
    }

    if (standardAnswerImages.value.length === 0) {
      ElMessage.error('Please upload standard answer images first');
      return;
    }

    if (!standardAnswerText.value) {
      ElMessage.error('Please analyze standard answer first');
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

    // 更新提交状态
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
        standardAnalysis: standardAnswerText.value,
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

      // 更新提交结果
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

  // 历史数据管理
  const saveHistoricalResult = async (result: HistoricalResult) => {
    try {
      historicalResults.value.unshift(result);
      localStorage.setItem(
        'grading_historical_results',
        JSON.stringify(historicalResults.value.slice(0, 1000)),
      );
    } catch (error) {
      console.error('保存历史结果失败:', error);
    }
  };

  const loadHistoricalResults = async () => {
    try {
      const stored = localStorage.getItem('grading_historical_results');
      if (stored) {
        historicalResults.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('加载历史结果失败:', error);
      historicalResults.value = [];
    }
  };

  // 加载已保存的标准答案（用于批量批改选择）
  const loadStandardAnswers = async () => {
    try {
      const stored = localStorage.getItem('saved_standard_answers');
      if (stored) {
        savedStandardAnswers.value = JSON.parse(stored);
      } else {
        savedStandardAnswers.value = [];
      }
    } catch (error) {
      console.error('加载标准答案失败:', error);
      savedStandardAnswers.value = [];
    }
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
      console.error('删除历史结果失败:', error);
    }
  };

  // 设置学生答案图片URL（向后兼容）
  const setStudentAnswerImageUrl = (url: string | null) => {
    singleStudentImage.value = url;
  };

  // 评分学生答案（向后兼容GradingView.vue）
  const gradeStudentAnswer = async (
    studentImageUrl: string,
    rubric: string,
    standardAnswerText: string,
  ) => {
    return gradeSingleStudentAnswer(studentImageUrl, rubric, standardAnswerText);
  };

  // 重置所有状态
  const resetAll = () => {
    standardAnswerImages.value = [];
    standardAnswerText.value = null;
    suggestedRubric.value = '';
    studentSubmissions.value = [];
    currentSubmissions.value = [];
    batchProcessingStatus.value = 'idle';
    currentBatchId.value = null;
    batchProgress.value = { total: 0, completed: 0, errors: 0 };

    // 向后兼容的状态
    singleStandardImage.value = null;
    singleStudentImage.value = null;
    singleGradingResult.value = null;
    singleGradingError.value = null;
    isLoadingSingle.value = false;
  };

  // 初始化
  const initialize = () => {
    loadHistoricalResults();
  };

  return {
    // 状态
    standardAnswerImages,
    standardAnswerText,
    suggestedRubric,
    isAnalyzingStandard,
    standardAnalysisError,
    studentSubmissions,
    batchProcessingStatus,
    currentBatchId,
    batchProgress,
    historicalResults,

    // 向后兼容的状态
    standardAnswerImageUrl,
    analyzedStandardAnswerText,
    gradingRubric,
    gradingResult,
    gradingError,
    isLoadingGrading,
    isLoadingAnalysis,
    analysisError,
    studentAnswerImageUrl,

    // 计算属性
    hasStandardImages,
    hasStudentSubmissions,
    completedSubmissions,
    pendingSubmissions,
    errorSubmissions,

    // 动作
    addStandardAnswerImage,
    removeStandardAnswerImage,
    clearStandardAnswerImages,
    analyzeStandardAnswer,
    analyzeMultiImageStandardAnswer,
    addStudentSubmission,
    removeStudentSubmission,
    clearStudentSubmissions,
    gradeSingleStudentAnswer,
    setStudentAnswerImageUrl,
    gradeStudentAnswer,
    processBatchGrading,
    saveHistoricalResult,
    loadStandardAnswers,
    loadHistoricalResults,
    deleteHistoricalResult,
    resetAll,
    initialize,
  };
});
