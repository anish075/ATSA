import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import json
import os
from datetime import datetime, timedelta

class DataService:
    """Service for handling data upload, processing, and validation"""
    
    def __init__(self):
        self.sample_data_path = "../../sample_data"
        
    def process_uploaded_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Process uploaded dataframe and return structured data"""
        
        # Basic info
        info = {
            "shape": df.shape,
            "columns": list(df.columns),
            "dtypes": df.dtypes.to_dict(),
            "null_counts": df.isnull().sum().to_dict(),
            "description": df.describe().to_dict()
        }
        
        # Detect potential time columns
        time_columns = self._detect_time_columns(df)
        value_columns = self._detect_value_columns(df)
        
        # Convert to format suitable for frontend
        data_dict = df.to_dict('records')
        
        return {
            "records": data_dict,
            "info": info,
            "suggested_time_column": time_columns[0] if time_columns else None,
            "suggested_value_columns": value_columns,
            "preprocessing_suggestions": self._get_preprocessing_suggestions(df)
        }
    
    def _detect_time_columns(self, df: pd.DataFrame) -> List[str]:
        """Detect columns that might contain time/date information"""
        time_columns = []
        
        for col in df.columns:
            # Check column name patterns
            if any(keyword in col.lower() for keyword in ['date', 'time', 'year', 'month', 'day']):
                time_columns.append(col)
                continue
                
            # Try to parse as datetime
            try:
                pd.to_datetime(df[col].dropna().head(10))
                time_columns.append(col)
            except:
                pass
                
        return time_columns
    
    def _detect_value_columns(self, df: pd.DataFrame) -> List[str]:
        """Detect columns that might contain numeric values for analysis"""
        value_columns = []
        
        for col in df.columns:
            if df[col].dtype in ['int64', 'float64'] and col not in self._detect_time_columns(df):
                value_columns.append(col)
                
        return value_columns
    
    def _get_preprocessing_suggestions(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze data and suggest preprocessing steps"""
        suggestions = {
            "missing_data": {},
            "outliers": {},
            "frequency": None,
            "transformations": []
        }
        
        # Check for missing data
        null_counts = df.isnull().sum()
        if null_counts.sum() > 0:
            suggestions["missing_data"] = {
                "columns_with_nulls": null_counts[null_counts > 0].to_dict(),
                "suggested_method": "interpolation"
            }
        
        # Check for outliers in numeric columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outliers = df[(df[col] < Q1 - 1.5*IQR) | (df[col] > Q3 + 1.5*IQR)][col]
            if len(outliers) > 0:
                suggestions["outliers"][col] = len(outliers)
        
        return suggestions
    
    def get_sample_datasets(self) -> Dict[str, Any]:
        """Return information about available sample datasets"""
        
        # For now, return hardcoded sample data info
        # In production, this would scan the sample_data directory
        datasets = [
            {
                "name": "stock_prices",
                "description": "Daily stock prices for major tech companies",
                "columns": ["Date", "AAPL", "GOOGL", "MSFT", "TSLA"],
                "rows": 1000,
                "time_column": "Date",
                "value_columns": ["AAPL", "GOOGL", "MSFT", "TSLA"]
            },
            {
                "name": "air_quality",
                "description": "Daily air quality measurements in major cities",
                "columns": ["Date", "PM2.5", "PM10", "NO2", "City"],
                "rows": 1500,
                "time_column": "Date",
                "value_columns": ["PM2.5", "PM10", "NO2"]
            },
            {
                "name": "energy_consumption",
                "description": "Hourly energy consumption data",
                "columns": ["Datetime", "Consumption", "Temperature", "Holiday"],
                "rows": 8760,
                "time_column": "Datetime",
                "value_columns": ["Consumption"]
            },
            {
                "name": "sales_data",
                "description": "Monthly retail sales with seasonal patterns",
                "columns": ["Date", "Sales", "Marketing_Spend", "Season"],
                "rows": 60,
                "time_column": "Date",
                "value_columns": ["Sales"]
            }
        ]
        
        return {"datasets": datasets}
    
    def load_sample_dataset(self, dataset_name: str) -> Dict[str, Any]:
        """Load a specific sample dataset"""
        
        # Generate synthetic data for demonstration
        if dataset_name == "stock_prices":
            return self._generate_stock_data()
        elif dataset_name == "air_quality":
            return self._generate_air_quality_data()
        elif dataset_name == "energy_consumption":
            return self._generate_energy_data()
        elif dataset_name == "sales_data":
            return self._generate_sales_data()
        else:
            raise ValueError(f"Dataset {dataset_name} not found")
    
    def _generate_stock_data(self) -> Dict[str, Any]:
        """Generate synthetic stock price data"""
        dates = pd.date_range(start='2021-01-01', end='2023-12-31', freq='D')
        np.random.seed(42)
        
        # Generate realistic stock prices with random walk
        def generate_price_series(initial_price, volatility, trend):
            prices = [initial_price]
            for i in range(len(dates) - 1):
                change = np.random.normal(trend, volatility)
                new_price = prices[-1] * (1 + change)
                prices.append(new_price)
            return prices
        
        data = {
            "Date": dates.strftime('%Y-%m-%d').tolist(),
            "AAPL": generate_price_series(150, 0.02, 0.0003),
            "GOOGL": generate_price_series(2000, 0.025, 0.0002),
            "MSFT": generate_price_series(300, 0.02, 0.0004),
            "TSLA": generate_price_series(800, 0.04, 0.0001)
        }
        
        return {"records": [dict(zip(data.keys(), values)) for values in zip(*data.values())]}
    
    def _generate_air_quality_data(self) -> Dict[str, Any]:
        """Generate synthetic air quality data"""
        dates = pd.date_range(start='2020-01-01', end='2023-12-31', freq='D')
        np.random.seed(42)
        
        # Add seasonal patterns
        day_of_year = dates.dayofyear
        seasonal_pm25 = 50 + 20 * np.sin(2 * np.pi * day_of_year / 365) + np.random.normal(0, 10, len(dates))
        seasonal_pm10 = 80 + 30 * np.sin(2 * np.pi * day_of_year / 365) + np.random.normal(0, 15, len(dates))
        seasonal_no2 = 40 + 15 * np.cos(2 * np.pi * day_of_year / 365) + np.random.normal(0, 8, len(dates))
        
        # Ensure no negative values
        seasonal_pm25 = np.maximum(seasonal_pm25, 0)
        seasonal_pm10 = np.maximum(seasonal_pm10, 0)
        seasonal_no2 = np.maximum(seasonal_no2, 0)
        
        data = {
            "Date": dates.strftime('%Y-%m-%d').tolist(),
            "PM2.5": seasonal_pm25.tolist(),
            "PM10": seasonal_pm10.tolist(),
            "NO2": seasonal_no2.tolist(),
            "City": ["New York"] * len(dates)
        }
        
        return {"records": [dict(zip(data.keys(), values)) for values in zip(*data.values())]}
    
    def _generate_energy_data(self) -> Dict[str, Any]:
        """Generate synthetic energy consumption data"""
        dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='H')
        np.random.seed(42)
        
        # Daily and seasonal patterns
        hour = dates.hour
        day_of_year = dates.dayofyear
        
        # Base consumption with daily pattern (higher during day)
        daily_pattern = 1000 + 300 * np.sin(2 * np.pi * (hour - 6) / 24)
        seasonal_pattern = 200 * np.sin(2 * np.pi * day_of_year / 365)
        noise = np.random.normal(0, 50, len(dates))
        
        consumption = daily_pattern + seasonal_pattern + noise
        consumption = np.maximum(consumption, 0)  # No negative consumption
        
        # Temperature (inverse relationship with consumption in some periods)
        temperature = 20 + 15 * np.sin(2 * np.pi * day_of_year / 365) + 5 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 3, len(dates))
        
        data = {
            "Datetime": dates.strftime('%Y-%m-%d %H:%M:%S').tolist(),
            "Consumption": consumption.tolist(),
            "Temperature": temperature.tolist(),
            "Holiday": [0] * len(dates)  # Simplified - no holidays marked
        }
        
        return {"records": [dict(zip(data.keys(), values)) for values in zip(*data.values())]}
    
    def _generate_sales_data(self) -> Dict[str, Any]:
        """Generate synthetic sales data"""
        dates = pd.date_range(start='2019-01-01', end='2023-12-31', freq='M')
        np.random.seed(42)
        
        # Trend + seasonality + noise
        trend = 10000 + 100 * np.arange(len(dates))  # Growing trend
        seasonality = 2000 * np.sin(2 * np.pi * dates.month / 12)  # Higher in Dec
        noise = np.random.normal(0, 500, len(dates))
        
        sales = trend + seasonality + noise
        sales = np.maximum(sales, 0)
        
        marketing_spend = 1000 + 0.05 * sales + np.random.normal(0, 100, len(dates))
        marketing_spend = np.maximum(marketing_spend, 0)
        
        seasons = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", 
                  "Summer", "Summer", "Fall", "Fall", "Fall", "Winter"]
        
        data = {
            "Date": dates.strftime('%Y-%m-%d').tolist(),
            "Sales": sales.tolist(),
            "Marketing_Spend": marketing_spend.tolist(),
            "Season": [seasons[date.month-1] for date in dates]
        }
        
        return {"records": [dict(zip(data.keys(), values)) for values in zip(*data.values())]}
    
    def validate_time_series_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate if data is suitable for time series analysis"""
        
        validation_result = {
            "is_valid": True,
            "issues": [],
            "suggestions": []
        }
        
        # Convert to DataFrame for validation
        df = pd.DataFrame(data.get('records', []))
        
        if df.empty:
            validation_result["is_valid"] = False
            validation_result["issues"].append("No data provided")
            return validation_result
        
        # Check for time column
        time_cols = self._detect_time_columns(df)
        if not time_cols:
            validation_result["is_valid"] = False
            validation_result["issues"].append("No time/date column detected")
            validation_result["suggestions"].append("Ensure you have a column with dates or timestamps")
        
        # Check for numeric columns
        value_cols = self._detect_value_columns(df)
        if not value_cols:
            validation_result["is_valid"] = False
            validation_result["issues"].append("No numeric columns for analysis")
            validation_result["suggestions"].append("Include at least one numeric column for forecasting")
        
        # Check minimum data points
        if len(df) < 10:
            validation_result["is_valid"] = False
            validation_result["issues"].append("Too few data points (minimum 10 required)")
        
        return validation_result
    
    def preprocess_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply preprocessing to the data"""
        
        df = pd.DataFrame(data.get('records', []))
        preprocessing_options = data.get('preprocessing', {})
        
        # Handle missing values
        if preprocessing_options.get('fill_missing'):
            method = preprocessing_options.get('fill_method', 'interpolate')
            if method == 'interpolate':
                df = df.interpolate()
            elif method == 'forward_fill':
                df = df.fillna(method='ffill')
            elif method == 'backward_fill':
                df = df.fillna(method='bfill')
            elif method == 'mean':
                df = df.fillna(df.mean())
        
        # Remove outliers if requested
        if preprocessing_options.get('remove_outliers'):
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                df = df[~((df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR)))]
        
        # Convert back to records format
        return {
            "records": df.to_dict('records'),
            "shape": df.shape,
            "preprocessing_applied": preprocessing_options
        }