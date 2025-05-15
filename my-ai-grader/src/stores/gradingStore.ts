import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useGradingStore = defineStore('grading', () => {
  // State for Standard Answer Analysis
  const standardAnswerImageUrl = ref<string | null>(null);
  const analyzedStandardAnswerText = ref<string | null>(null);
  const suggestedRubricJson = ref<string>(''); // For the Rubric JSON from LLM
  const isLoadingAnalysis = ref<boolean>(false);
  const analysisError = ref<string | null>(null);

  // State for Grading Rubric (edited by user)
  const gradingRubric = ref<string>('');

  // State for Student Answer Grading
  const studentAnswerImageUrl = ref<string | null>(null);
  const gradingResult = ref<any | null>(null);
  const isLoadingGrading = ref<boolean>(false);
  const gradingError = ref<string | null>(null);

  // --- Actions ---

  function setStandardAnswerImageUrl(url: string | null) {
    console.log(
      '[gradingStore.ts] setStandardAnswerImageUrl CALLED',
      url ? url.substring(0, 30) : null,
    );
    standardAnswerImageUrl.value = url;
    analyzedStandardAnswerText.value = null;
    suggestedRubricJson.value = '';
    gradingRubric.value = '';
    analysisError.value = null;
    // Do not reset isLoadingAnalysis here, as it's typically set by the async action itself
  }

  function setStudentAnswerImageUrl(url: string | null) {
    console.log(
      '[gradingStore.ts] setStudentAnswerImageUrl CALLED',
      url ? url.substring(0, 30) : null,
    );
    studentAnswerImageUrl.value = url;
    gradingResult.value = null;
    gradingError.value = null;
  }

  // Action to reset states, can be called from onMounted in views if needed
  function resetAllStandardAnswerStates() {
    console.log('[gradingStore.ts] resetAllStandardAnswerStates CALLED');
    standardAnswerImageUrl.value = null;
    analyzedStandardAnswerText.value = null;
    suggestedRubricJson.value = '';
    gradingRubric.value = '';
    isLoadingAnalysis.value = false;
    analysisError.value = null;
  }

  function resetAllStudentGradingStates() {
    console.log('[gradingStore.ts] resetAllStudentGradingStates CALLED');
    studentAnswerImageUrl.value = null;
    gradingResult.value = null;
    isLoadingGrading.value = false;
    gradingError.value = null;
  }

  async function analyzeStandardAnswer(imageDataUrl: string) {
    console.log(
      '[gradingStore.ts] analyzeStandardAnswer CALLED with imageDataUrl (first 50 chars):',
      imageDataUrl.substring(0, 50) + '...',
    );
    isLoadingAnalysis.value = true;
    analysisError.value = null;
    // Reset relevant fields before new analysis to avoid showing stale data
    analyzedStandardAnswerText.value = null;
    suggestedRubricJson.value = '';
    gradingRubric.value = '';

    try {
      const response = await axios.post('/api/analyze_answer', {
        imageData: imageDataUrl,
      });
      if (response.data) {
        analyzedStandardAnswerText.value =
          response.data.analyzedText || 'No text content received.';
        suggestedRubricJson.value = response.data.suggestedRubricJson || '';
        gradingRubric.value = response.data.suggestedRubricJson || ''; // Auto-fill editable rubric
        console.log(
          '[gradingStore.ts] Standard Answer Analysis successful:',
          response.data,
        );
      } else {
        throw new Error('Empty response from /api/analyze_answer');
      }
    } catch (error: any) {
      console.error(
        '[gradingStore.ts] Error calling /api/analyze_answer in store:',
        error,
      );
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'An unknown error occurred during analysis.';
      analysisError.value = errorMessage;
      analyzedStandardAnswerText.value = `Error during analysis: ${errorMessage}`;
    } finally {
      isLoadingAnalysis.value = false;
    }
  }

  async function gradeStudentAnswer(
    currentStudentImageUrl: string, // Renamed for clarity within this function
    currentGradingRubric: string,
    currentAnalyzedStandardAnswerText: string | null,
  ) {
    if (!currentGradingRubric) {
      gradingError.value = 'Grading rubric cannot be empty.';
      console.warn(
        '[gradingStore.ts] gradeStudentAnswer: Grading rubric is empty.',
      );
      return;
    }
    if (!currentAnalyzedStandardAnswerText) {
      gradingError.value = 'Standard answer analysis is not available.';
      console.warn(
        '[gradingStore.ts] gradeStudentAnswer: Standard answer analysis is not available.',
      );
      return;
    }

    isLoadingGrading.value = true;
    gradingError.value = null;
    gradingResult.value = null; // Reset to null, will store Markdown string or error

    const gradingPrompt = `
      You are an AI Grader.
      The student has submitted an answer (image provided).
      The standard answer has been analyzed and key components are:
      --- START STANDARD ANSWER ANALYSIS ---
      ${currentAnalyzedStandardAnswerText}
      --- END STANDARD ANSWER ANALYSIS ---

      The grading rubric to be applied is:
      --- START GRADING RUBRIC (JSON format) ---
      ${currentGradingRubric}
      --- END GRADING RUBRIC ---

      Based on the student's answer image, the standard answer analysis, and the provided rubric, please grade the student's answer.
      **Your entire output MUST be a single, well-formatted Markdown document.**
      The Markdown document should include:
      1.  An overall score (e.g., "## Overall Score: X/Y").
      2.  A section for "### Detailed Feedback" for each criterion from the rubric, including:
          *   The criterion description (e.g., as a bolded list item or sub-heading).
          *   The score awarded for that criterion (e.g., "**Score:** A/B").
          *   Detailed textual feedback for that criterion.
      3.  A section for "### General Summary" of the student's performance.
      Use appropriate Markdown formatting (headings, bold text, lists, newlines for separation, etc.) to make the feedback clear and easy to read.
      Do NOT include any JSON examples, introductory/closing remarks, or any other text outside of this single Markdown document.
      Double check your output before sending it to the backend, especially scores of each parts and the overall scores. 
      If you find the part completely right then you must not give any feedback for that part. If not then give me short feedback. You MUST Make the general summary short and concise.
    `;

    try {
      console.log(
        '[gradingStore.ts] Calling /api/grade with student image, rubric (for context), and standard answer analysis.',
      );
      console.log(
        '[gradingStore.ts] Full prompt being sent to LLM (via backend):\n',
        gradingPrompt,
      );

      const response = await axios.post('/api/grade', {
        imageData: currentStudentImageUrl,
        prompt: gradingPrompt, // This prompt now asks for Markdown
      });

      if (response.data && typeof response.data.feedbackMarkdown === 'string') {
        gradingResult.value = response.data.feedbackMarkdown; // Store the Markdown string directly
        console.log(
          '[gradingStore.ts] Student Answer Grading successful. Received Markdown.',
        );
        console.log(
          '[gradingStore.ts] AI Grading Output (Markdown):\n',
          response.data.feedbackMarkdown,
        );
      } else {
        let errorMsg = 'Invalid response format from /api/grade.';
        if (response.data && !response.data.feedbackMarkdown) {
          errorMsg = 'Response from /api/grade missing feedbackMarkdown field.';
        } else if (!response.data) {
          errorMsg = 'Empty response data from /api/grade.';
        }
        console.error(
          '[gradingStore.ts]',
          errorMsg,
          'Response data:',
          response.data,
        );
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('[gradingStore.ts] Error calling /api/grade:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'An unknown error occurred during grading.';
      gradingError.value = errorMessage;
      // Store the error message in gradingResult as well, so UI can display it if needed
      // Or have a separate error display mechanism in the UI that watches gradingError
      gradingResult.value = `Error during grading: ${errorMessage}`;
    } finally {
      isLoadingGrading.value = false;
    }
  }

  // --- End Actions ---

  // For diagnostics - logging what is about to be returned from setup
  console.log(
    '[gradingStore.ts] About to return from setup. typeof analyzeStandardAnswer:',
    typeof analyzeStandardAnswer,
  );
  console.log(
    '[gradingStore.ts] analyzeStandardAnswer function itself:',
    analyzeStandardAnswer,
  );

  const allReturnedMembers = {
    // Standard Answer
    standardAnswerImageUrl,
    analyzedStandardAnswerText,
    suggestedRubricJson,
    isLoadingAnalysis,
    analysisError,
    setStandardAnswerImageUrl,
    analyzeStandardAnswer, // Critical: Ensure this is the actual function
    resetAllStandardAnswerStates,

    // Grading Rubric (editable)
    gradingRubric, // User's editable rubric

    // Student Answer
    studentAnswerImageUrl,
    gradingResult,
    isLoadingGrading,
    gradingError,
    setStudentAnswerImageUrl,
    gradeStudentAnswer, // Critical: Ensure this is the actual function
    resetAllStudentGradingStates,
  };

  console.log(
    '[gradingStore.ts] All members being returned from setup:',
    allReturnedMembers,
  );
  console.log(
    '[gradingStore.ts] typeof allReturnedMembers.analyzeStandardAnswer:',
    typeof allReturnedMembers.analyzeStandardAnswer,
  );
  console.log(
    '[gradingStore.ts] typeof allReturnedMembers.gradeStudentAnswer:',
    typeof allReturnedMembers.gradeStudentAnswer,
  );

  return allReturnedMembers;
});
