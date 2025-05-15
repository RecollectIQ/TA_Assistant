# AI Grader

## Update Log / Version History

### v0.0.2 (2025-05-15, 20:52 Beijing Time)

- **MVP Achieved**: Completed the end-to-end workflow for AI-assisted grading.
  - Implemented standard answer analysis: Users can upload a standard answer image, and the AI analyzes it to provide a textual summary and a suggested JSON rubric.
  - Implemented student answer grading: Users can upload a student's answer image. The AI grades it based on the standard answer analysis and a user-confirmed rubric (context provided in the prompt).
  - Enhanced feedback display: Grading results from the AI are now presented as a well-formatted Markdown document in the UI.
- Addressed various frontend Linter/Prettier issues and fixed API call configurations.
- Updated `PHASE2_CHECKLIST.md` to reflect completed MVP tasks.

AI Grader is a web application designed to assist with grading image-based submissions using AI. It consists of a Vue.js frontend and a Python Flask backend that interfaces with an OpenAI-compatible Vision LLM.

## Project Structure

- `my-ai-grader/`: Contains the Vue.js 3 frontend application.
- `backend/`: Contains the Python Flask backend application.
- `Instructions.md`: Detailed technical implementation plan (internal document).
- `Phase2_Checklist.md`: Checklist for the current MVP development phase.

## Prerequisites

Before you begin, ensure you have the following installed:

**For Frontend (`my-ai-grader/`):**

- Node.js (v18.x or later recommended)
- npm (usually comes with Node.js)

**For Backend (`backend/`):**

- Python (3.x, check `backend/venv` specifics if needed, e.g., 3.9+)
- pip (Python package installer)

## Setup Instructions

1.  **Clone the Repository:**

    ```bash
    git clone <your-repository-url>
    cd AI_Grader # Or your project's root directory name
    ```

2.  **Setup Frontend (`my-ai-grader/`):**

    ```bash
    cd my-ai-grader
    npm install
    cd .. # Return to project root
    ```

3.  **Setup Backend (`backend/`):**

    ```bash
    cd backend
    # Create a Python virtual environment (recommended)
    python3 -m venv venv # Or python -m venv venv

    # Activate the virtual environment
    # On macOS/Linux:
    source venv/bin/activate
    # On Windows:
    # venv\Scripts\activate

    # Install Python dependencies
    pip install -r requirements.txt
    # Note: You can deactivate the venv later with `deactivate` command
    cd .. # Return to project root
    ```

## API Key Configuration (Backend)

The backend requires an API key and endpoint URL for an OpenAI-compatible Vision LLM to function correctly. This configuration is crucial.

1.  Navigate to the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Create a file named `.env` in this directory if it doesn't already exist.
3.  Add your API credentials to the `.env` file in the following format:

    ```env
    OPENAI_COMPATIBLE_API_URL="your_llm_api_endpoint_here"
    OPENAI_COMPATIBLE_API_KEY="your_llm_api_key_here"
    ```

    - Replace `your_llm_api_endpoint_here` with the full URL to the chat completions endpoint of your LLM provider (e.g., `https://api.openai.com/v1/chat/completions` or a local proxy like `http://localhost:3100/v1/chat/completions`).
    - Replace `your_llm_api_key_here` with your actual API key.
    - **Important**: Ensure this `.env` file is never committed to version control if it contains real secrets.

4.  **Note on Local LLM Proxy Services**: If `OPENAI_COMPATIBLE_API_URL` points to a local proxy service (e.g., running on `http://localhost:3100`), ensure that this local proxy service is also running, correctly configured, and able to connect to its upstream LLM provider (e.g., OpenAI, Azure OpenAI).

5.  Return to the project root if needed:
    ```bash
    cd ..
    ```

## Running the Application

**You need to run both the frontend and backend servers simultaneously in separate terminal windows/tabs.**

1.  **Start the Backend Server:**

    a. Navigate to the `backend/` directory:
    `bash
    cd backend
    `
    b. Activate the Python virtual environment (if not already active):
    `bash
    # On macOS/Linux:
    source venv/bin/activate
    # On Windows:
    # venv\Scripts\activate
    `
    c. Ensure your `.env` file in the `backend/` directory is correctly configured with `OPENAI_COMPATIBLE_API_URL` and `OPENAI_COMPATIBLE_API_KEY` (see "API Key Configuration" section).

    d. Run the Flask application. The `backend/app.py` is configured to run on `0.0.0.0:5000` when executed directly:
    `bash
    python app.py
    `
    Alternatively, you can use `flask run` (it should pick up the app from `app.py` and also use the `.env` variables, but `python app.py` is more explicit given the `app.run()` configuration in the file):
    `bash
    # flask run --host=0.0.0.0 --port=5000 # More explicit if needed
    flask run 
    `
    The backend API will be available at `http://0.0.0.0:5000` (accessible as `http://localhost:5000` or `http://127.0.0.1:5000` from your local machine).

2.  **Start the Frontend Development Server:**

    a. Navigate to the `my-ai-grader/` directory:
    `bash
    cd my-ai-grader
    `
    b. Run the Vite development server:
    `bash
    npm run dev
    `
    The frontend application will be available at `http://localhost:5173`.
    Vite is configured (in `vite.config.ts`) to proxy API requests starting with `/api` from the frontend (`http://localhost:5173/api/...`) to the backend server (e.g., `http://127.0.0.1:5000/api/...`).

## Available Scripts (Frontend - `my-ai-grader/`)

Navigate to the `my-ai-grader/` directory to run these scripts:

- **`npm run dev`**: Starts the Vite development server with HMR.
- **`npm run build`**: Builds the application for production.
- **`npm run preview`**: Serves the production build locally for preview.
- **`npm run lint`**: Lints the codebase using ESLint and configured plugins.
- **`npm run format`**: Formats the code using Prettier.

## API Endpoints (Backend - `backend/app.py`)

Currently, the backend exposes the following main API endpoints:

- **`POST /api/analyze_answer`**:

  - Accepts `imageData` (Base64 data URL of the standard answer image).
  - Interfaces with the configured LLM to get a textual analysis and a suggested JSON rubric.
  - Returns `analyzedText` (the full AI analysis) and `suggestedRubricJson` (the extracted JSON rubric string).

- **`POST /api/grade`**:

  - Accepts `imageData` (Base64 data URL of the student submission) and a comprehensive `prompt` (constructed by the frontend, containing context from standard answer analysis and the user-defined rubric).
  - Interfaces with the configured LLM to grade the submission.
  - Returns `feedbackMarkdown` (a Markdown string containing the detailed grading results generated by the LLM).

- **`GET /api/greet`**:
  - A simple test endpoint to check backend connectivity.

## Project Status & Next Steps

Please refer to `
