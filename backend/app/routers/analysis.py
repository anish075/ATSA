from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import pandas as pd
import numpy as np
from ..services.analysis_service import AnalysisService
from ..utils.schemas import TimeSeriesAnalysis
from ..models.time_series_models import EnhancedTimeSeriesModelManager

router = APIRouter()
analysis_service = AnalysisService()
model_manager = EnhancedTimeSeriesModelManager()

@router.post("/stationarity-test")
async def stationarity_test(data: Dict[str, Any]):
    """Perform stationarity tests (ADF, KPSS)"""
    try:
        result = analysis_service.test_stationarity(data)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stationarity test failed: {str(e)}")

@router.post("/seasonality-test")
async def seasonality_test(data: Dict[str, Any]):
    """Test for seasonality in the data"""
    try:
        result = analysis_service.test_seasonality(data)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seasonality test failed: {str(e)}")

@router.post("/decompose")
async def decompose_series(data: Dict[str, Any]):
    """Decompose time series into trend, seasonal, and residual components"""
    try:
        method = data.get('method', 'additive')  # 'additive' or 'multiplicative'
        period = data.get('period', None)
        result = analysis_service.decompose_time_series(data, method, period)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decomposition failed: {str(e)}")

@router.post("/acf-pacf")
async def calculate_acf_pacf(data: Dict[str, Any]):
    """Calculate ACF and PACF values"""
    try:
        lags = data.get('lags', 40)
        result = analysis_service.calculate_acf_pacf(data, lags)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ACF/PACF calculation failed: {str(e)}")

@router.post("/rolling-statistics")
async def rolling_statistics(data: Dict[str, Any]):
    """Calculate rolling mean and standard deviation"""
    try:
        window = data.get('window', 12)
        result = analysis_service.calculate_rolling_stats(data, window)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rolling statistics calculation failed: {str(e)}")

@router.post("/comprehensive-analysis")
async def comprehensive_analysis(data: Dict[str, Any]):
    """Perform comprehensive time series analysis using enhanced models"""
    try:
        result = model_manager.analyze_data(data)
        return {"success": True, "analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comprehensive analysis failed: {str(e)}")

@router.post("/outlier-detection")
async def detect_outliers(data: Dict[str, Any]):
    """Detect outliers in time series data"""
    try:
        method = data.get('method', 'iqr')  # 'iqr' or 'z_score'
        
        # Extract series data
        records = data.get('records', [])
        value_column = data.get('value_column')
        
        if not records or not value_column:
            raise ValueError("Invalid data format")
        
        df = pd.DataFrame(records)
        series = df[value_column].dropna()
        
        from ..models.time_series_models import TimeSeriesAnalyzer
        analyzer = TimeSeriesAnalyzer()
        result = analyzer.detect_outliers(series, method)
        
        return {"success": True, "outliers": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Outlier detection failed: {str(e)}")

@router.post("/model-suggestions")
async def get_model_suggestions(data: Dict[str, Any]):
    """Get intelligent model parameter suggestions based on data characteristics"""
    try:
        # Extract series data
        records = data.get('records', [])
        value_column = data.get('value_column')
        time_column = data.get('time_column')
        
        if not records or not value_column:
            raise ValueError("Invalid data format")
        
        df = pd.DataFrame(records)
        
        # Handle time index
        if time_column and time_column in df.columns:
            df[time_column] = pd.to_datetime(df[time_column])
            df = df.set_index(time_column).sort_index()
        
        series = df[value_column].dropna()
        
        from ..models.time_series_models import TimeSeriesAnalyzer
        analyzer = TimeSeriesAnalyzer()
        suggestions = analyzer.suggest_model_parameters(series)
        
        return {"success": True, "suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model suggestion failed: {str(e)}")

@router.post("/full-analysis", response_model=Dict[str, Any])
async def full_time_series_analysis(data: Dict[str, Any]):
    """Perform comprehensive time series analysis"""
    try:
        result = analysis_service.perform_full_analysis(data)
        return {"success": True, "analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Full analysis failed: {str(e)}")