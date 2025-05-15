# Phase 2: AI Grader MVP - Core Functionality Checklist

This document outlines the checklist of core functionalities to be implemented in Phase 2 for the AI Grader Minimum Viable Product (MVP). The primary goal is to establish a complete workflow from analyzing a standard answer to grading a student's submission based on that analysis and a user-defined rubric.

## Stage 1: Standard Answer Analysis & Rubric Definition

### 1.1 Backend: Implement "Answer Analysis" Module

- **Status:** Done
- **Goal:** Create a new API endpoint (e.g., `/api/analyze_answer`) that receives a standard answer image (potentially multiple images representing a multi-page answer) and returns a structured text summary and a suggested rubric.
- **Tasks:**
  - [x] Define a new route in `backend/app.py` (e.g., `/api/analyze_answer`) accepting one or more images for the standard answer.
  - [x] Implement logic to call a Vision LLM (e.g., GPT-4 Vision) with the answer image(s). (Currently supports single image)
  - [x] Design a prompt for the Vision LLM to summarize the answer image(s) into structured text and suggest a JSON rubric.
  - [x] Ensure the endpoint returns this structured text summary and suggested JSON rubric to the frontend.

### 1.2 Frontend: Upload Standard Answer & Display Analysis

- **Status:** Done
- **Goal:** Allow users to upload a standard answer, trigger backend analysis, and view the structured text summary and suggested rubric.
- **Tasks:**
  - [x] Enhance or configure the `ElUpload` component in `StandardAnswerView.vue` for uploading the "Standard Answer Image". (Currently supports single image)
  - [x] Implement frontend logic to call the new `/api/analyze_answer` backend endpoint, passing the image file for the standard answer.
  - [x] Display the structured "Standard Answer Text Summary" and "Suggested Rubric JSON" returned from the backend on the UI.
  - [x] Store the analyzed answer text and suggested rubric in Pinia state (`gradingStore.ts`).

### 1.3 Frontend: Define Rubric Based on Analyzed Answer

- **Status:** Done (MVP Level - suggested rubric is auto-filled and editable)
- **Goal:** Enable users to define/refine a rubric (scoring criteria and points) based on the AI-suggested rubric from the standard answer analysis.
- **Tasks:**
  - [x] Design and implement a UI section in `StandardAnswerView.vue` that appears after the answer analysis.
  - [x] The AI-suggested rubric JSON is automatically populated into an editable textarea.
  - [x] Store the user-confirmed/edited rubric dynamically in Pinia state (`gradingStore.gradingRubric`).

## Stage 2: Student Submission Grading Based on Standard Answer & Rubric

### 2.1 Backend: Enhance "Grading" Module (`/api/grade`)

- **Status:** Done
- **Goal:** Modify the existing `/api/grade` endpoint to accept a student submission, the user-defined rubric (as context in prompt), and the analyzed standard answer text, then return a formatted Markdown grading result.
- **Tasks:**
  - [x] Update the `/api/grade` endpoint in `backend/app.py` to accept:
    - Student submission image (`imageData`). (Currently supports single image)
    - A comprehensive `prompt` from the frontend which includes context from the user-defined `rubric` and the `analyzedAnswerText`.
  - [x] **Crucial**: Design and implement new prompt engineering logic (primarily in `gradingStore.ts` on the frontend, passed to backend). This prompt instructs the grading LLM to:
    - Refer to the provided `analyzedAnswerText` as the correct answer.
    - Grade the student's submission against this correct answer.
    - Follow the structure and point allocation implied by the `rubric` (provided as context within the prompt).
    - Output a single, well-formatted Markdown document as the grading result.
  - [x] Call the Vision LLM with the student's submission image and the comprehensive prompt. (Currently supports single image)
  - [x] Ensure the endpoint returns the Markdown grading result to the frontend (e.g., `{"feedbackMarkdown": "..."}`).

### 2.2 Frontend: Upload Student Submission, Trigger Grading & Display Structured Results

- **Status:** Done
- **Goal:** Allow users to upload a student submission, send all necessary data to the backend for grading, and display the Markdown results.
- **Tasks:**
  - [x] Enhance or configure the `ElUpload` component in `GradingView.vue` for the "Student Submission Image". (Currently supports single image)
  - [x] Update frontend logic (`gradingStore.ts`) to call the enhanced `/api/grade` backend endpoint, passing:
    - Student submission image.
    - The dynamically constructed `prompt` (containing rubric context and standard answer analysis).
  - [x] Design and implement a UI section (results sidebar in `GradingView.vue`) to display the Markdown grading results using `marked` and `DOMPurify`.
  - [x] The display shows the LLM-generated Markdown, which should align with the requested structure (overall score, criteria feedback, summary).
  - [x] Store the grading result (Markdown string) in Pinia state (`gradingStore.gradingResult`).

## Stage 3: (Post-MVP / Future Iteration) "Problem Profile" as History/Case Log

- **Status:** Future
- **Goal:** Allow users to save a complete grading instance (standard answer, analysis, rubric, student submission, and results) as a historical record or case.
- **Tasks:**
  - [ ] Design data structure for the comprehensive "Problem Profile" (history item).
  - [ ] Implement functionality to save the current state (after analysis and grading) as a new profile.
  - [ ] Implement a simple UI to list and view these saved profiles.

---

_This checklist will be updated as development progresses._
