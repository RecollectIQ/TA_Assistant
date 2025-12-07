# AI Grader

AI Grader is an intelligent grading assistant that uses OpenAI-compatible APIs to grade student work based on a standard answer and a generated rubric.

## 🚀 Quick Start

The easiest way to start the application is using the provided start script:

```bash
./start.sh
```

This script will:
1. Check for prerequisites (Python 3.11+, Node.js 18+).
2. Setup the backend (Python/Flask) environment and dependencies.
3. Setup the frontend (Vue/Vite) environment and dependencies.
4. Start both services.

- **Backend**: http://localhost:5001
- **Frontend**: http://localhost:5173

## 🛠 Manual Setup

If you prefer to run services manually:

### Backend

```bash
cd backend
# Create .env from example if it doesn't exist
cp .env.example .env
# Install dependencies
pip install -r requirements.txt
# Run server
python app.py
```

### Frontend

```bash
cd my-ai-grader
# Install dependencies
npm install
# Run dev server
npm run dev
```

## 📝 Usage

1. **Configure API**: Go to the "Configuration" page and set your OpenAI-compatible API key and URL.
2. **Standard Answer**: Upload an image of the correct answer to generate a grading rubric.
3. **Grade**: Upload student answers to receive automated feedback and scores.

## 📄 Documentation

For more detailed instructions, please refer to [QUICK_START.md](QUICK_START.md).

## 📁 Project Structure

- \`backend/\`: Flask server and LLM services.
- \`my-ai-grader/\`: Vue.js frontend application.
- \`start.sh/\`: Automated startup script.
