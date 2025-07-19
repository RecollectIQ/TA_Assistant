import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { StudentSubmission, BatchProgress } from '@/types/grading';
import { generateUniqueId } from '@/utils/validation';

export function useBatchProcessing() {
  const submissions = ref<StudentSubmission[]>([]);
  const isProcessing = ref(false);
  const progress = ref<BatchProgress>({ total: 0, completed: 0, errors: 0 });
  const currentBatchId = ref<string | null>(null);
  const processingError = ref<string | null>(null);

  const completedSubmissions = computed(() =>
    submissions.value.filter((s) => s.status === 'completed'),
  );

  const pendingSubmissions = computed(() =>
    submissions.value.filter((s) => s.status === 'pending'),
  );

  const errorSubmissions = computed(() =>
    submissions.value.filter((s) => s.status === 'error'),
  );

  const processingSubmissions = computed(() =>
    submissions.value.filter((s) => s.status === 'processing'),
  );

  const processingProgress = computed(() => {
    const total = progress.value.total;
    if (total === 0) return 0;
    return Math.round((progress.value.completed / total) * 100);
  });

  const canStartProcessing = computed(
    () =>
      submissions.value.length > 0 &&
      pendingSubmissions.value.length > 0 &&
      !isProcessing.value,
  );

  const addSubmission = async (
    file: File,
    studentName?: string,
  ): Promise<StudentSubmission | null> => {
    try {
      const dataUrl = await fileToDataUrl(file);

      const submission: StudentSubmission = {
        id: generateUniqueId(),
        name: studentName || file.name.replace(/\..+$/, ''), // Remove file extension
        file,
        dataUrl,
        status: 'pending',
      };

      submissions.value.push(submission);
      return submission;
    } catch (error) {
      processingError.value = 'Failed to process file';
      return null;
    }
  };

  const addMultipleSubmissions = async (
    files: File[],
    namingConvention: 'filename' | 'numbered' = 'filename',
  ): Promise<StudentSubmission[]> => {
    const results: StudentSubmission[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const studentName =
        namingConvention === 'numbered'
          ? `Student ${i + 1}`
          : file.name.replace(/\..+$/, '');

      const result = await addSubmission(file, studentName);
      if (result) {
        results.push(result);
      }
    }

    return results;
  };

  const removeSubmission = (submissionId: string) => {
    const index = submissions.value.findIndex((s) => s.id === submissionId);
    if (index > -1) {
      submissions.value.splice(index, 1);
    }
  };

  const clearAllSubmissions = () => {
    submissions.value = [];
    progress.value = { total: 0, completed: 0, errors: 0 };
    currentBatchId.value = null;
    processingError.value = null;
  };

  const updateSubmissionStatus = (
    submissionId: string,
    status: StudentSubmission['status'],
    result?: StudentSubmission['result'],
    error?: string,
  ) => {
    const submission = submissions.value.find((s) => s.id === submissionId);
    if (submission) {
      submission.status = status;
      if (result) submission.result = result;
      if (error) submission.error = error;
    }
  };

  const startProcessing = async (processFunction: () => Promise<void>) => {
    if (!canStartProcessing.value) {
      ElMessage.warning('No pending submissions to process');
      return;
    }

    isProcessing.value = true;
    processingError.value = null;
    currentBatchId.value = `batch_${Date.now()}`;

    try {
      await processFunction();
      ElMessage.success('Batch processing completed');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Processing failed';
      processingError.value = errorMessage;
      ElMessage.error(errorMessage);
    } finally {
      isProcessing.value = false;
    }
  };

  const retryFailedSubmissions = async (
    retryFunction: (id: string) => Promise<void>,
  ) => {
    const failed = errorSubmissions.value;
    if (failed.length === 0) {
      ElMessage.warning('No failed submissions to retry');
      return;
    }

    isProcessing.value = true;
    processingError.value = null;

    try {
      for (const submission of failed) {
        submission.status = 'processing';
        try {
          await retryFunction(submission.id);
          submission.status = 'completed';
          submission.error = undefined;
        } catch (error) {
          submission.status = 'error';
          submission.error =
            error instanceof Error ? error.message : 'Retry failed';
        }
      }
      ElMessage.success('Retry completed');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Retry failed';
      processingError.value = errorMessage;
      ElMessage.error(errorMessage);
    } finally {
      isProcessing.value = false;
    }
  };

  const exportResults = (format: 'csv' | 'json' | 'excel' = 'csv') => {
    const completed = completedSubmissions.value;
    if (completed.length === 0) {
      ElMessage.warning('No completed results to export');
      return;
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'csv':
        content = generateCSV(completed);
        filename = `batch_results_${currentBatchId.value || Date.now()}.csv`;
        mimeType = 'text/csv';
        break;

      case 'json':
        content = JSON.stringify(completed, null, 2);
        filename = `batch_results_${currentBatchId.value || Date.now()}.json`;
        mimeType = 'application/json';
        break;

      default:
        ElMessage.error('Export format not supported');
        return;
    }

    downloadFile(content, filename, mimeType);
    ElMessage.success(`Results exported as ${format.toUpperCase()}`);
  };

  const generateCSV = (submissions: StudentSubmission[]): string => {
    const headers = ['Student Name', 'Status', 'Score', 'Feedback'];
    const rows = submissions.map((sub) => [
      sub.name,
      sub.status,
      sub.result?.score?.toString() || '',
      sub.result?.feedbackMarkdown?.substring(0, 100) + '...' || '',
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileDrop = async (event: DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []);

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      ElMessage.error('No image files found');
      return;
    }

    await addMultipleSubmissions(imageFiles);
  };

  const sortSubmissions = (
    sortBy: 'name' | 'status' | 'date',
    direction: 'asc' | 'desc' = 'asc',
  ) => {
    submissions.value.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'date':
          comparison = a.id.localeCompare(b.id); // Use ID as proxy for creation date
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  };

  return {
    submissions,
    isProcessing,
    progress,
    currentBatchId,
    processingError,
    completedSubmissions,
    pendingSubmissions,
    errorSubmissions,
    processingSubmissions,
    processingProgress,
    canStartProcessing,
    addSubmission,
    addMultipleSubmissions,
    removeSubmission,
    clearAllSubmissions,
    updateSubmissionStatus,
    startProcessing,
    retryFailedSubmissions,
    exportResults,
    handleFileDrop,
    sortSubmissions,
  };
}
