#!/bin/bash

# AI Grader One-Click Startup Script
# This script starts both frontend and backend services for the AI Grader project

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=5173
BACKEND_PORT=5000
FRONTEND_DIR="my-ai-grader"
BACKEND_DIR="backend"
VENV_DIR="backend/venv"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ -n "$pid" ]; then
        print_warning "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 2
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js (v18.x or higher)"
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    # Check Python
    if ! command_exists python3; then
        print_error "Python 3 is not installed. Please install Python 3.9+"
        exit 1
    fi
    
    # Check pip
    if ! command_exists pip3; then
        print_error "pip3 is not installed. Please install pip3"
        exit 1
    fi
    
    print_success "All dependencies are available"
}

# Function to setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    else
        print_status "Frontend dependencies already installed"
    fi
    
    cd ..
    print_success "Frontend setup completed"
}

# Function to setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd "$BACKEND_DIR"
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "$VENV_DIR" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv "$VENV_DIR"
    else
        print_status "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    source "$VENV_DIR/bin/activate"
    
    # Install requirements
    if [ ! -f "requirements.txt" ]; then
        print_error "requirements.txt not found in backend directory"
        exit 1
    fi
    
    print_status "Installing backend dependencies..."
    pip install -r requirements.txt
    
    cd ..
    print_success "Backend setup completed"
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend server..."
    
    if check_port $FRONTEND_PORT; then
        print_warning "Port $FRONTEND_PORT is already in use"
        kill_port $FRONTEND_PORT
    fi
    
    cd "$FRONTEND_DIR"
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    sleep 5
    
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_success "Frontend server started on http://localhost:$FRONTEND_PORT"
    else
        print_error "Failed to start frontend server"
        exit 1
    fi
}

# Function to start backend
start_backend() {
    print_status "Starting backend server..."
    
    if check_port $BACKEND_PORT; then
        print_warning "Port $BACKEND_PORT is already in use"
        kill_port $BACKEND_PORT
    fi
    
    cd "$BACKEND_DIR"
    source "$VENV_DIR/bin/activate"
    python app.py &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_success "Backend server started on http://localhost:$BACKEND_PORT"
    else
        print_error "Failed to start backend server"
        exit 1
    fi
}

# Function to check if services are running
check_services() {
    local services_up=0
    
    if check_port $FRONTEND_PORT; then
        print_success "Frontend is running on port $FRONTEND_PORT"
        ((services_up++))
    else
        print_error "Frontend is not running on port $FRONTEND_PORT"
    fi
    
    if check_port $BACKEND_PORT; then
        print_success "Backend is running on port $BACKEND_PORT"
        ((services_up++))
    else
        print_error "Backend is not running on port $BACKEND_PORT"
    fi
    
    return $services_up
}

# Function to display usage information
usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help      Show this help message"
    echo "  -s, --setup     Only setup dependencies, don't start services"
    echo "  -c, --check     Check if services are running"
    echo "  -k, --kill      Kill all running services"
    echo ""
    echo "Examples:"
    echo "  $0              # Setup and start both services"
    echo "  $0 --setup      # Only setup dependencies"
    echo "  $0 --check      # Check if services are running"
    echo "  $0 --kill       # Kill all running services"
}

# Function to kill all services
kill_services() {
    print_status "Killing all running services..."
    kill_port $FRONTEND_PORT
    kill_port $BACKEND_PORT
    print_success "All services killed"
}

# Function to show final information
show_final_info() {
    echo ""
    echo "=============================================="
    echo -e "${GREEN}🎉 AI Grader is now running!${NC}"
    echo "=============================================="
    echo ""
    echo "Frontend:  http://localhost:$FRONTEND_PORT"
    echo "Backend:   http://localhost:$BACKEND_PORT"
    echo ""
    echo "Quick Start Guide:"
    echo "1. Open http://localhost:$FRONTEND_PORT in your browser"
    echo "2. Go to Configuration to set up your API keys"
    echo "3. Use Standard Answer to upload reference images"
    echo "4. Use Batch Grading to process student submissions"
    echo "5. Check Results to view and export grades"
    echo ""
    echo "To stop all services, press Ctrl+C or run: $0 --kill"
    echo "=============================================="
}

# Trap to clean up processes on script exit
cleanup() {
    print_status "Shutting down services..."
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null || true
    [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null || true
    print_success "Services stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup EXIT INT TERM

# Main execution
main() {
    case "${1:-}" in
        -h|--help)
            usage
            exit 0
            ;;
        -s|--setup)
            check_dependencies
            setup_frontend
            setup_backend
            print_success "Setup completed successfully"
            exit 0
            ;;
        -c|--check)
            check_services
            exit $?
            ;;
        -k|--kill)
            kill_services
            exit 0
            ;;
        "")
            # Default behavior: setup and start
            print_status "Starting AI Grader..."
            check_dependencies
            setup_frontend
            setup_backend
            start_frontend
            start_backend
            show_final_info
            
            # Keep the script running
            while true; do
                sleep 10
                if ! check_port $FRONTEND_PORT || ! check_port $BACKEND_PORT; then
                    print_error "One or more services stopped unexpectedly"
                    exit 1
                fi
            done
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"