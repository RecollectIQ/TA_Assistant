# AI Grader - Quick Start Guide

## Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key (or compatible API)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Create .env file
cat > .env << EOF
OPENAI_COMPATIBLE_API_URL="https://api.openai.com/v1/chat/completions"
OPENAI_COMPATIBLE_API_KEY="your-api-key-here"
MODEL_NAME="gpt-4o"
EOF

# Activate virtual environment (if exists)
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (if needed)
pip install -r requirements.txt

# Start backend
python app.py
```

Backend will run on: `http://localhost:5001`

### 2. Frontend Setup

```bash
cd my-ai-grader

# Install dependencies (if not done already)
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Usage Workflow

### Step 1: Configure API
1. Navigate to **Configuration** page
2. Enter your API details:
   - API URL: `https://api.openai.com/v1/chat/completions`
   - API Key: Your OpenAI API key
   - Model: `gpt-4o` (or your preferred model)
3. Click **Test Connection** to verify
4. Click **Save Configuration**

### Step 2: Upload Standard Answer
1. Navigate to **Standard Answer** page
2. Upload an image of the correct answer
3. Wait for AI analysis to complete
4. Review the generated rubric (edit if needed)
5. Click **Next: Upload Student Answer**

### Step 3: Grade Student Answers
1. On the **Grading** page, you'll see:
   - Left: Standard answer reference
   - Right: Results display area
2. Upload a student's answer image
3. Grading will start automatically
4. View the detailed feedback with:
   - Total score
   - Criterion-by-criterion analysis
   - Suggestions for improvement

### Step 4: Review Results
- Feedback is displayed in Markdown format
- You can grade multiple students by uploading different images
- Use **Grade Again** button to re-process

## Troubleshooting

### Backend Issues

**Problem**: `API URL or Key is not configured`
- **Solution**: Make sure `.env` file exists in `backend/` directory with correct values

**Problem**: `Connection refused` or `CORS error`
- **Solution**: Verify backend is running on port 5001

### Frontend Issues

**Problem**: `Failed to connect to API`
- **Solution**: Check that backend is running and `vite.config.ts` proxy is set to `http://127.0.0.1:5001`

**Problem**: No feedback after uploading student answer
- **Solution**: 
  1. Check browser console for errors
  2. Verify API key has sufficient credits
  3. Ensure standard answer was analyzed first

### API Issues

**Problem**: `HTTP 401` or authentication errors
- **Solution**: Verify your API key is valid and has not expired

**Problem**: `HTTP 429` - Rate limit exceeded
- **Solution**: Wait a moment and try again, or upgrade your API plan

## Features

### ✅ Working Features
- Single image analysis
- Standard answer upload and analysis
- Student answer grading
- Markdown feedback rendering
- API configuration management
- Multiple saved configurations

### 🚧 Mock/Placeholder Features
- Batch grading (returns placeholder results)
- Download report (button disabled)

## Tips for Best Results

1. **Image Quality**: Upload clear, high-resolution images
2. **File Size**: Keep images under 2MB
3. **Rubric Detail**: More detailed rubrics lead to better grading
4. **Model Choice**: 
   - `gpt-4o`: Best quality, higher cost
   - `gpt-4-turbo`: Good balance
   - `gpt-3.5-turbo`: Faster, lower cost

## Support

For issues or questions:
1. Check `IMPLEMENTATION_SUMMARY.md` for technical details
2. Review browser console for error messages
3. Check backend terminal for server logs

## Directory Structure

```
AI_Grader-1/
├── backend/
│   ├── app.py              # Flask server
│   ├── services/
│   │   └── llm_service.py  # LLM API calls
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Configuration (create this)
├── my-ai-grader/
│   ├── src/
│   │   ├── views/         # Page components
│   │   ├── stores/        # State management
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json       # Node dependencies
└── QUICK_START.md         # This file
```

## Next Steps

After basic setup:
1. Explore different AI models
2. Customize grading prompts in `gradingStore.ts`
3. Adjust rubric templates for your needs
4. Save multiple API configurations for different models

Happy Grading! 🎓

