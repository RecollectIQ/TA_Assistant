# Phase 2: AI Grader MVP - Core Functionality Checklist

This document outlines the checklist of core functionalities to be implemented in Phase 2 for the AI Grader Minimum Viable Product (MVP). The primary goal is to establish a complete workflow from analyzing a standard answer to grading a student's submission based on that analysis and a user-defined rubric.

## Stage 1: Standard Answer Analysis & Rubric Definition

### 1.1 Backend: Implement "Answer Analysis" Module

- **Status:** To Do
- **Goal:** Create a new API endpoint (e.g., `/api/analyze_answer`) that receives a standard answer image (potentially multiple images representing a multi-page answer) and returns a structured text summary.
- **Tasks:**
  - [ ] Define a new route in `backend/app.py` (e.g., `/api/analyze_answer`) accepting one or more images for the standard answer.
  - [ ] Implement logic to call a Vision LLM (e.g., GPT-4 Vision) with the answer image(s). If multiple images, determine strategy (e.g., process sequentially, combine, or make multiple calls).
  - [ ] Design a prompt for the Vision LLM to summarize the answer image(s) into structured text (e.g., key steps, points, sub-answers, description of diagrams). The prompt should guide the LLM to synthesize information if from multiple pages.
  - [ ] Ensure the endpoint returns this structured text summary to the frontend.

### 1.2 Frontend: Upload Standard Answer & Display Analysis

- **Status:** To Do
- **Goal:** Allow users to upload a standard answer (potentially multi-page), trigger backend analysis, and view the structured text summary.
- **Tasks:**
  - [ ] Enhance or configure the `ElUpload` component in `GradingView.vue` (or a new dedicated component) for uploading the "Standard Answer Image(s)" to support multiple file selection for a single answer.
  - [ ] Implement frontend logic to call the new `/api/analyze_answer` backend endpoint, passing all selected image files for the standard answer.
  - [ ] Display the structured "Standard Answer Text Summary" returned from the backend on the UI.
  - [ ] (Optional) Store the analyzed answer text in Pinia state (`gradingStore.ts` or a new store).

### 1.3 Frontend: Define Rubric Based on Analyzed Answer

- **Status:** To Do
- **Goal:** Enable users to define a rubric (scoring criteria and points) based on the structured text summary of the standard answer.
- **Tasks:**
  - [ ] Design and implement a UI section (in `GradingView.vue` or a new component) that appears after the answer analysis.
  - [ ] Allow users to add/edit/delete rubric items (e.g., sub-question name, maximum points for that item) based on the structure suggested by the analyzed answer.
  - [ ] Store the user-defined rubric dynamically in Pinia state.

## Stage 2: Student Submission Grading Based on Standard Answer & Rubric

### 2.1 Backend: Enhance "Grading" Module (`/api/grade`)

- **Status:** To Do
- **Goal:** Modify the existing `/api/grade` endpoint to accept a student submission (potentially multi-page), the user-defined rubric, and the analyzed standard answer text, then return a structured grading result.
- **Tasks:**
  - [ ] Update the `/api/grade` endpoint in `backend/app.py` to accept:
    - Student submission image(s) (`imageData` - could be an array of base64 strings or similar structure for multi-page).
    - User-defined `rubric` (JSON object from frontend Pinia state).
    - Analyzed standard answer text (`analyzedAnswerText` from Stage 1).
  - [ ] **Crucial**: Design and implement new prompt engineering logic (in `app.py` or a new `prompt_builder.py`). This prompt must instruct the grading LLM to:
    - Refer to the provided `analyzedAnswerText` as the correct answer.
    - Grade the student's submission (potentially across multiple images) against this correct answer.
    - Follow the structure and point allocation of the provided `rubric`.
    - Output a structured grading result that aligns with the rubric items (e.g., points awarded and justification for each rubric item).
  - [ ] Call the Vision LLM with the student's submission image(s) and the comprehensive prompt. If multiple images, determine strategy for LLM processing (similar to standard answer analysis).
  - [ ] Ensure the endpoint returns the structured grading result to the frontend.

### 2.2 Frontend: Upload Student Submission, Trigger Grading & Display Structured Results

- **Status:** To Do
- **Goal:** Allow users to upload a student submission (potentially multi-page), send all necessary data to the backend for grading, and display the structured results aligned with the rubric.
- **Tasks:**
  - [ ] Enhance or configure the `ElUpload` component in `GradingView.vue` for the "Student Submission Image(s)" to support multiple file selection for a single submission.
  - [ ] Update frontend logic to call the enhanced `/api/grade` backend endpoint, passing:
    - Student submission image(s).
    - The currently defined `rubric` from Pinia state.
    - The `analyzedAnswerText` from Pinia state (obtained in Stage 1).
  - [ ] Design and implement a UI section (likely the existing results sidebar in `GradingView.vue`) to display the structured grading results.
  - [ ] The display **must** clearly show scores and justifications for each item defined in the user's `rubric`.
  - [ ] (Optional) Store the grading result in Pinia state (`gradingResultStore.ts` or similar).

## Stage 3: (Post-MVP / Future Iteration) "Problem Profile" as History/Case Log

- **Status:** Future
- **Goal:** Allow users to save a complete grading instance (standard answer, analysis, rubric, student submission, and results) as a historical record or case.
- **Tasks:**
  - [ ] Design data structure for the comprehensive "Problem Profile" (history item).
  - [ ] Implement functionality to save the current state (after analysis and grading) as a new profile.
  - [ ] Implement a simple UI to list and view these saved profiles.

---

_This checklist will be updated as development progresses._
