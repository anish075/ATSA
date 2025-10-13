from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from ..models.time_series_models import EnhancedTimeSeriesModelManager
from ..utils.schemas import ModelConfig, ModelResult, ForecastRequest, ForecastResponse

router = APIRouter()
model_manager = EnhancedTimeSeriesModelManager()

@router.post("/fit", response_model=ForecastResponse)
async def fit_model(request: ForecastRequest):
    """Fit a time series model and generate forecasts"""
    try:
        result = model_manager.fit_and_forecast(
            data=request.data,
            model_config=request.model_configuration
        )
        return ForecastResponse(
            success=True,
            result=result,
            message=f"Successfully fitted {request.model_configuration.model_type} model"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model fitting failed: {str(e)}")

@router.post("/compare")
async def compare_models(data: Dict[str, Any]):
    """Compare multiple models on the same dataset"""
    try:
        models = data.get('models', [])
        dataset = data.get('data', {})
        
        results = []
        for model_config in models:
            result = model_manager.fit_and_forecast(dataset, ModelConfig(**model_config))
            results.append(result)
        
        # Rank models by performance
        comparison = model_manager.compare_models(results)
        
        return {
            "success": True,
            "results": results,
            "comparison": comparison,
            "best_model": comparison["best_model"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model comparison failed: {str(e)}")

@router.get("/available-models")
async def get_available_models():
    """Get list of available model types and their parameters"""
    return {
        "success": True,
        "models": model_manager.get_available_models()
    }

@router.post("/auto-select")
async def auto_select_model(data: Dict[str, Any]):
    """Automatically select the best model for the dataset"""
    try:
        best_model = model_manager.auto_select_model(data)
        return {
            "success": True,
            "recommended_model": best_model,
            "message": "Automatically selected best model based on data characteristics"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto model selection failed: {str(e)}")

@router.post("/validate-parameters")
async def validate_model_parameters(model_config: Dict[str, Any]):
    """Validate model parameters"""
    try:
        is_valid, message = model_manager.validate_parameters(model_config)
        return {
            "success": True,
            "is_valid": is_valid,
            "message": message
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parameter validation failed: {str(e)}")