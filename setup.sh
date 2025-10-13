#!/bin/bash

# ATSA Playground Setup Script for macOS/Linux
set -e  # Exit on any error

echo ""
echo "================================"
echo "🎯 ATSA Playground Setup Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$1/6]${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

# Check if Python is installed
print_status "1" "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        print_error "Python is not installed"
        echo "Please install Python 3.8+ from https://www.python.org/"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
print_success "Python detected: $PYTHON_VERSION"

# Check if Node.js is installed
print_status "2" "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js detected: $NODE_VERSION"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

echo ""

# Setup Python Backend
print_status "3" "Setting up Python backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    $PYTHON_CMD -m venv venv
    if [ $? -ne 0 ]; then
        print_error "Failed to create virtual environment"
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip and install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    print_error "Failed to install Python dependencies"
    exit 1
fi

print_success "Backend setup complete"
cd ..

# Setup Frontend
print_status "4" "Setting up React frontend..."
cd frontend

echo "Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install Node.js dependencies"
    exit 1
fi

print_success "Frontend setup complete"
cd ..

# Setup sample data
print_status "5" "Preparing sample data..."
if [ -d "sample_data" ]; then
    print_success "Sample data already available"
else
    print_warning "Sample data directory not found - will be created when needed"
fi

# Final setup
print_status "6" "Finalizing setup..."

echo ""
echo "================================"
echo "🎉 Setup Complete!"
echo "================================"
echo ""
echo "To start the application:"
echo ""
echo "${BLUE}Terminal 1 (Backend):${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
echo "${BLUE}Terminal 2 (Frontend):${NC}"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "${BLUE}Then open:${NC} http://localhost:3000"
echo ""

# Ask if user wants to start the servers
echo -n "Would you like to start both servers now? (y/N): "
read -r response

if [[ $response =~ ^[Yy]$ ]]; then
    echo ""
    echo "Starting servers..."
    
    # Start backend in background
    cd backend
    source venv/bin/activate
    echo "Starting backend server at http://localhost:8000..."
    python main.py &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend
    cd frontend
    echo "Starting frontend server at http://localhost:3000..."
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo ""
    echo "🌐 Both servers are starting up!"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/api/docs"
    echo ""
    echo "Press Ctrl+C to stop both servers"
    
    # Wait for user interrupt
    trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
else
    echo ""
    echo "Setup complete! Start the servers manually when ready."
fi