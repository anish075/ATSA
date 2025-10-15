from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
import pandas as pd
import io
import json
from ..services.data_service import DataService
from ..utils.schemas import DataUploadResponse, DataInfo, SampleDatasets

router = APIRouter()
data_service = DataService()

@router.post("/upload", response_model=DataUploadResponse)
async def upload_data(file: UploadFile = File(...)):
    """Upload and process CSV/Excel file"""
    try:
        if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")
        
        contents = await file.read()
        
        # Process the file based on extension
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        # Process and validate the data
        processed_data = data_service.process_uploaded_data(df)
        
        return DataUploadResponse(
            success=True,
            message=f"Successfully processed {len(df)} rows",
            data=processed_data,
            columns=list(df.columns),
            shape=df.shape
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.get("/sample-datasets")
async def get_sample_datasets():
    """Get list of available sample datasets"""
    try:
        # Return built-in sample datasets
        datasets = [
            {
                "name": "stock_prices", 
                "title": "Stock Price Data",
                "description": "Daily stock prices with volatility (1095 records)",
                "rows": 1095,
                "frequency": "Daily",
                "features": ["volatility", "random_walk", "financial"]
            },
            {
                "name": "monthly_sales",
                "title": "Monthly Sales Data", 
                "description": "Retail sales with seasonal patterns (48 records)",
                "rows": 48,
                "frequency": "Monthly",
                "features": ["seasonality", "trend", "business_metrics"]
            },
            {
                "name": "daily_temperature",
                "title": "Temperature Measurements",
                "description": "Daily temperature with seasonal cycles (730 records)",
                "rows": 730,
                "frequency": "Daily", 
                "features": ["seasonal", "weather", "cyclic"]
            },
            {
                "name": "website_traffic",
                "title": "Website Traffic Data",
                "description": "Hourly website visitors with weekly patterns (2137 records)",
                "rows": 2137,
                "frequency": "Hourly",
                "features": ["weekly_pattern", "trend", "web_analytics"]
            },
            {
                "name": "economic_indicators",
                "title": "Economic Indicators",
                "description": "Quarterly economic data (55 records)",
                "rows": 55,
                "frequency": "Quarterly",
                "features": ["economic", "multiple_series", "macro"]
            }
        ]
        
        return {"success": True, "datasets": datasets}
    except Exception as e:
        return {"success": False, "error": str(e), "datasets": []}

@router.get("/sample-datasets/{dataset_name}")
async def load_sample_dataset(dataset_name: str):
    """Load a specific sample dataset"""
    try:
        import os
        
        # Map dataset names to CSV files
        dataset_files = {
            "stock_prices": ("stock_prices.csv", "price", "date", "Stock Price Data"),
            "monthly_sales": ("monthly_sales.csv", "sales", "date", "Monthly Sales Data"),
            "daily_temperature": ("daily_temperature.csv", "temperature", "date", "Daily Temperature"),
            "website_traffic": ("website_traffic.csv", "visitors", "date", "Website Traffic"),
            "economic_indicators": ("economic_indicators.csv", "gdp_growth", "date", "Economic Indicators")
        }
        
        # Check if dataset exists in our CSV files
        if dataset_name in dataset_files:
            csv_file, value_col, time_col, title = dataset_files[dataset_name]
            data_dir = os.path.join(os.path.dirname(__file__), '../data')
            file_path = os.path.join(data_dir, csv_file)
            
            if os.path.exists(file_path):
                df = pd.read_csv(file_path)
                
                return {
                    "success": True,
                    "name": dataset_name,
                    "title": title,
                    "records": df.to_dict('records'),
                    "value_column": value_col,
                    "time_column": time_col,
                    "description": f"Real dataset with {len(df)} observations"
                }
        
        # Fallback to generated data if CSV not found
        import numpy as np
        from datetime import datetime, timedelta
        
        if dataset_name == "airline_passengers":
            # Classic airline passenger data pattern
            dates = pd.date_range(start='1949-01-01', end='1960-12-01', freq='MS')
            trend = np.linspace(100, 600, len(dates))
            seasonal = 50 * np.sin(2 * np.pi * np.arange(len(dates)) / 12)
            noise = np.random.normal(0, 20, len(dates))
            values = trend + seasonal + noise
            values = np.maximum(values, 50)  # Ensure positive values
            
            df = pd.DataFrame({
                'date': dates.strftime('%Y-%m-%d'),
                'passengers': values.astype(int)
            })
            
            return {
                "success": True,
                "name": dataset_name,
                "title": "Airline Passengers (1949-1960)",
                "records": df.to_dict('records'),
                "value_column": "passengers",
                "time_column": "date",
                "description": "Monthly international airline passengers showing seasonal patterns"
            }
            
        elif dataset_name == "stock_prices":
            # Stock price random walk with volatility
            dates = pd.date_range(start='2023-01-01', periods=252, freq='D')
            returns = np.random.normal(0.001, 0.02, len(dates))
            prices = 100 * np.cumprod(1 + returns)
            
            df = pd.DataFrame({
                'date': dates.strftime('%Y-%m-%d'),
                'price': np.round(prices, 2)
            })
            
            return {
                "success": True,
                "name": dataset_name,
                "title": "Stock Price Data",
                "records": df.to_dict('records'),
                "value_column": "price", 
                "time_column": "date",
                "description": "Daily stock prices with financial volatility patterns"
            }
            
        elif dataset_name == "sales_data":
            # Monthly sales with seasonality
            dates = pd.date_range(start='2019-01-01', periods=60, freq='MS')
            base = 1000
            trend = np.linspace(0, 500, len(dates))
            seasonal = 200 * np.sin(2 * np.pi * np.arange(len(dates)) / 12) + 100 * np.cos(2 * np.pi * np.arange(len(dates)) / 6)
            holiday_boost = np.where(dates.month == 12, 300, 0)  # December boost
            noise = np.random.normal(0, 50, len(dates))
            sales = base + trend + seasonal + holiday_boost + noise
            
            df = pd.DataFrame({
                'date': dates.strftime('%Y-%m-%d'),
                'sales': np.maximum(sales.astype(int), 500)  # Ensure reasonable minimum
            })
            
            return {
                "success": True,
                "name": dataset_name,
                "title": "Retail Sales Data",
                "records": df.to_dict('records'),
                "value_column": "sales",
                "time_column": "date", 
                "description": "Monthly sales with seasonal and holiday effects"
            }
            
        elif dataset_name == "temperature_data":
            # Daily temperature with seasonal cycle
            dates = pd.date_range(start='2023-01-01', periods=365, freq='D')
            day_of_year = dates.dayofyear
            temp_base = 15  # Average temperature
            seasonal = 10 * np.sin(2 * np.pi * (day_of_year - 80) / 365)  # Seasonal cycle
            daily_variation = np.random.normal(0, 3, len(dates))  # Daily noise
            temperature = temp_base + seasonal + daily_variation
            
            df = pd.DataFrame({
                'date': dates.strftime('%Y-%m-%d'),
                'temperature': np.round(temperature, 1)
            })
            
            return {
                "success": True,
                "name": dataset_name,
                "title": "Temperature Measurements",
                "records": df.to_dict('records'),
                "value_column": "temperature",
                "time_column": "date",
                "description": "Daily temperature readings with seasonal cycles"
            }
        
        else:
            raise HTTPException(status_code=404, detail=f"Dataset '{dataset_name}' not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading dataset: {str(e)}")

@router.post("/validate")
async def validate_data(data: Dict[str, Any]):
    """Validate time series data structure"""
    try:
        validation_result = data_service.validate_time_series_data(data)
        return validation_result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")

@router.post("/preprocess")
async def preprocess_data(data: Dict[str, Any]):
    """Preprocess time series data (handle missing values, etc.)"""
    try:
        processed_data = data_service.preprocess_data(data)
        return {
            "success": True,
            "data": processed_data,
            "message": "Data preprocessed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preprocessing error: {str(e)}")