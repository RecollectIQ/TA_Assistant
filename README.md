# AI Grader

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

The backend requires an API key and endpoint URL for an OpenAI-compatible Vision LLM.

1.  Navigate to the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Create a file named `.env` in the `backend/` directory.
3.  Add your API credentials to the `.env` file in the following format:
    ```env
    OPENAI_COMPATIBLE_API_URL="your_llm_api_endpoint_here"
    OPENAI_COMPATIBLE_API_KEY="your_llm_api_key_here"
    ```
    Replace `your_llm_api_endpoint_here` (e.g., `https://api.openai.com/v1/chat/completions` or your custom provider's URL) and `your_llm_api_key_here` with your actual credentials.
4.  Return to the project root if needed:
    ```bash
    cd ..
    ```

## Running the Application

**You need to run both the frontend and backend servers simultaneously in separate terminal windows/tabs.**

1.  **Start the Backend Server:**

    ```bash
    cd backend
    source venv/bin/activate # Activate venv if not already active
    flask run
    # Or python app.py
    ```

    The backend API will typically be available at `http://localhost:5000` (or as configured in `app.py`). It expects environment variables `OPENAI_COMPATIBLE_API_URL` and `OPENAI_COMPATIBLE_API_KEY` to be set (see API Key Configuration).

2.  **Start the Frontend Development Server:**
    ```bash
    cd my-ai-grader
    npm run dev
    ```
    The frontend application will typically be available at `http://localhost:5173`.

## Available Scripts (Frontend - `my-ai-grader/`)

Navigate to the `my-ai-grader/` directory to run these scripts:

- **`npm run dev`**: Starts the Vite development server with HMR.
- **`npm run build`**: Builds the application for production.
- **`npm run preview`**: Serves the production build locally for preview.
- **`npm run lint`**: Lints the codebase using ESLint and configured plugins.
- **`npm run format`**: Formats the code using Prettier.

## API Endpoints (Backend - `backend/app.py`)

Currently, the backend exposes the following main API endpoint:

- **`POST /api/grade`**:

  - Accepts `imageData` (Base64 data URL of the student submission) and `prompt` (text prompt for grading).
  - Interfaces with the configured LLM to get a grading.
  - _Note: This endpoint is planned to be enhanced to accept a more structured `rubric` and `analyzedAnswerText` as per `Phase2_Checklist.md`._

- **Planned Endpoint for Phase 2:**
  - **`POST /api/analyze_answer`**: Will accept an image (or multiple images) of a standard answer and return a structured text summary from the LLM.

## Project Status & Next Steps

Please refer to `Phase2_Checklist.md` for the current development focus and planned features for the MVP.
