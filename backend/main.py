from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
import json
import uvicorn
import os

# Import our custom modules (will create these)
from app.routers import data, models, analysis, export, learning
from app.models.time_series_models import EnhancedTimeSeriesModelManager
from app.services.data_service import DataService
from app.services.learning_service import LearningService
from app.utils.config import Settings

# Initialize settings
settings = Settings()

# Create FastAPI app
app = FastAPI(
    title="🎯 ATSA Playground API",
    description="Backend API for Applied Time Series Analysis Interactive Playground",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(data.router, prefix="/api/data", tags=["data"])
app.include_router(models.router, prefix="/api/models", tags=["models"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(export.router, prefix="/api/export", tags=["export"])
app.include_router(learning.router, prefix="/api/learning", tags=["learning"])

# Initialize services
data_service = DataService()
learning_service = LearningService()
model_manager = EnhancedTimeSeriesModelManager()

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "🎯 ATSA Playground API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "ATSA Playground API is running"}

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Starting ATSA Playground API...")
    print(f"📊 Data service initialized")
    print(f"🤖 Model manager initialized")
    print(f"🌐 API documentation available at: http://localhost:8000/api/docs")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )