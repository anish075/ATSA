#!/usr/bin/env python3

"""
Setup script for ATSA Playground
Installs dependencies and initializes the application
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"📦 {description}...")
    try:
        subprocess.run(command, shell=True, check=True)
        print(f"✅ {description} completed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        return False
    return True

def setup_backend():
    """Setup Python backend"""
    print("🐍 Setting up Python backend...")
    
    # Change to backend directory
    os.chdir('backend')
    
    # Install Python dependencies
    if not run_command('pip install -r requirements.txt', 'Installing Python dependencies'):
        return False
    
    os.chdir('..')
    return True

def setup_frontend():
    """Setup Node.js frontend"""
    print("⚛️ Setting up React frontend...")
    
    # Change to frontend directory
    os.chdir('frontend')
    
    # Install Node.js dependencies
    if not run_command('npm install', 'Installing Node.js dependencies'):
        return False
    
    os.chdir('..')
    return True

def create_env_files():
    """Create environment files"""
    print("🔧 Creating environment configuration files...")
    
    # Backend .env file
    backend_env = """# ATSA Playground Backend Configuration
DEBUG=True
API_TITLE=ATSA Playground API
API_VERSION=1.0.0
MAX_UPLOAD_SIZE=10485760
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
"""
    
    with open('backend/.env', 'w') as f:
        f.write(backend_env)
    
    print("✅ Environment files created")

def main():
    """Main setup function"""
    print("🎯 ATSA Playground Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('README.md'):
        print("❌ Please run this script from the project root directory")
        sys.exit(1)
    
    # Create environment files
    create_env_files()
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("❌ Frontend setup failed")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\n🚀 To start the application:")
    print("Backend:  cd backend && python main.py")
    print("Frontend: cd frontend && npm run dev")
    print("\n📖 Open http://localhost:3000 in your browser")

if __name__ == '__main__':
    main()