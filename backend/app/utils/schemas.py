from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import datetime

# Data-related schemas
class DataUploadResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any]
    columns: List[str]
    shape: tuple

class DataInfo(BaseModel):
    name: str
    description: str
    columns: List[str]
    rows: int
    time_column: Optional[str] = None
    value_columns: List[str] = []

class SampleDatasets(BaseModel):
    datasets: List[DataInfo]

# Model-related schemas
class ModelConfig(BaseModel):
    model_type: str
    parameters: Dict[str, Any]
    forecast_periods: int = 30
    confidence_interval: float = 0.95

class ModelResult(BaseModel):
    model_type: str
    fitted_values: List[float]
    forecast: List[float]
    forecast_lower: List[float]
    forecast_upper: List[float]
    forecast_dates: List[str] = []
    metrics: Dict[str, float]
    parameters: Dict[str, Any] = {}
    model_info: Dict[str, Any] = {}

class ModelComparison(BaseModel):
    models: List[ModelResult]
    best_model: str
    comparison_metrics: Dict[str, Dict[str, float]]

# Analysis-related schemas
class TimeSeriesAnalysis(BaseModel):
    stationarity_test: Dict[str, Any]
    seasonality_test: Dict[str, Any]
    trend_analysis: Dict[str, Any]
    acf_pacf: Dict[str, List[float]]
    decomposition: Dict[str, List[float]]

class ForecastRequest(BaseModel):
    data: Dict[str, Any]
    model_configuration: ModelConfig

class ForecastResponse(BaseModel):
    success: bool
    result: ModelResult
    message: str

# Export-related schemas
class ExportRequest(BaseModel):
    data_type: str  # 'forecast', 'chart', 'report'
    format: str     # 'csv', 'png', 'pdf'
    content: Dict[str, Any]

class ExportResponse(BaseModel):
    success: bool
    download_url: str
    message: str