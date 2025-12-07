#!/bin/bash

# AI Grader Startup Script

echo "=========================================="
echo "      Starting AI Grader                  "
echo "=========================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Check Prerequisites
echo "[*] Checking prerequisites..."
if ! command_exists python3; then
    echo "Error: python3 is not installed."
    exit 1
fi

if ! command_exists npm; then
    echo "Error: npm is not installed."
    exit 1
fi
echo "    -> Prerequisites OK."

# 2. Setup Backend
echo "[*] Setting up Backend..."
cd backend

# Check for .env
if [ ! -f ".env" ]; then
    echo "    -> .env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "    -> Created .env. PLEASE EDIT IT WITH YOUR API KEYS!"
    else
        echo "    -> Warning: .env.example not found. Creating empty .env..."
        touch .env
    fi
else
    echo "    -> .env file exists."
fi

# Setup Virtual Environment (recreate if broken)
if [ -d "venv" ]; then
    echo "    -> Removing existing virtual environment..."
    rm -rf venv
fi
echo "    -> Creating virtual environment..."
python3 -m venv venv

# Activate venv
source venv/bin/activate

# Upgrade pip to avoid issues
pip install --upgrade pip > /dev/null 2>&1

# Install dependencies
echo "    -> Installing backend dependencies..."
pip install -r requirements.txt

# Go back to root
cd ..

# 3. Setup Frontend
echo "[*] Setting up Frontend..."
cd my-ai-grader

# Reinstall node_modules to fix rollup issue
if [ -d "node_modules" ]; then
    echo "    -> Removing existing node_modules to fix dependency issues..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "    -> Removing package-lock.json..."
    rm package-lock.json
fi

echo "    -> Installing frontend dependencies (this may take a while)..."
npm install

# Fix linting issues
echo "    -> Fixing code formatting issues..."
npm run format > /dev/null 2>&1 || true

# Go back to root
cd ..

# 4. Start Services
echo "=========================================="
echo "      Starting Services                   "
echo "=========================================="
echo "Press Ctrl+C to stop correctly."

# Trap SIGINT (Ctrl+C) to kill child processes
trap 'kill $(jobs -p) 2>/dev/null; exit' SIGINT SIGTERM

# Start Backend in background mode (disable Flask debug to avoid I/O issues)
echo "[*] Starting Backend (Flask)..."
cd backend
source venv/bin/activate
export FLASK_BACKGROUND=true
python3 app.py 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to initialize
sleep 3

# Start Frontend
echo "[*] Starting Frontend (Vite)..."
cd my-ai-grader
npm run dev 2>&1 &
FRONTEND_PID=$!
cd ..

echo "=========================================="
echo " Backend running at: http://localhost:5001"
echo " Frontend running at: http://localhost:5173"
echo "=========================================="

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
