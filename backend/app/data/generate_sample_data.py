import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os

def generate_sample_datasets():
    """Generate various sample time series datasets for testing"""
    
    # Dataset 1: Monthly Sales with Trend and Seasonality
    dates1 = pd.date_range(start='2020-01-01', end='2023-12-31', freq='M')
    trend1 = np.linspace(1000, 2000, len(dates1))
    seasonality1 = 300 * np.sin(2 * np.pi * np.arange(len(dates1)) / 12)
    noise1 = np.random.normal(0, 50, len(dates1))
    sales_data = trend1 + seasonality1 + noise1
    
    sales_df = pd.DataFrame({
        'date': dates1,
        'sales': sales_data,
        'category': ['Electronics'] * len(dates1)
    })
    
    # Dataset 2: Daily Temperature Data
    dates2 = pd.date_range(start='2022-01-01', end='2023-12-31', freq='D')
    yearly_cycle = 15 * np.cos(2 * np.pi * np.arange(len(dates2)) / 365.25)
    daily_variation = 5 * np.random.normal(0, 1, len(dates2))
    base_temp = 20
    temperature_data = base_temp + yearly_cycle + daily_variation
    
    temp_df = pd.DataFrame({
        'date': dates2,
        'temperature': temperature_data,
        'location': ['City Center'] * len(dates2)
    })
    
    # Dataset 3: Stock Price with Volatility
    dates3 = pd.date_range(start='2021-01-01', end='2023-12-31', freq='D')
    returns = np.random.normal(0.001, 0.02, len(dates3))
    log_prices = np.cumsum(returns)
    stock_prices = 100 * np.exp(log_prices)
    
    stock_df = pd.DataFrame({
        'date': dates3,
        'price': stock_prices,
        'volume': np.random.randint(1000, 10000, len(dates3)),
        'symbol': ['TECH'] * len(dates3)
    })
    
    # Dataset 4: Website Traffic (Hourly with Weekly Patterns)
    dates4 = pd.date_range(start='2023-01-01', end='2023-03-31', freq='H')
    # Weekly pattern (lower traffic on weekends)
    weekly_pattern = []
    for date in dates4:
        if date.weekday() < 5:  # Weekday
            base_traffic = 1000 + 200 * np.sin(2 * np.pi * date.hour / 24)
        else:  # Weekend
            base_traffic = 600 + 100 * np.sin(2 * np.pi * date.hour / 24)
        weekly_pattern.append(base_traffic)
    
    traffic_noise = np.random.normal(0, 50, len(dates4))
    traffic_data = np.array(weekly_pattern) + traffic_noise
    
    traffic_df = pd.DataFrame({
        'datetime': dates4,
        'visitors': np.maximum(0, traffic_data),  # Ensure non-negative
        'page_views': traffic_data * np.random.uniform(2, 5, len(dates4))
    })
    
    # Dataset 5: Economic Indicator (GDP Growth)
    dates5 = pd.date_range(start='2010-01-01', end='2023-10-01', freq='Q')
    economic_cycles = 2 + 0.5 * np.sin(2 * np.pi * np.arange(len(dates5)) / 20)  # 5-year cycles
    random_shocks = np.random.normal(0, 0.8, len(dates5))
    gdp_growth = economic_cycles + random_shocks
    
    gdp_df = pd.DataFrame({
        'quarter': dates5,
        'gdp_growth': gdp_growth,
        'inflation': gdp_growth + np.random.normal(1, 0.5, len(dates5)),
        'unemployment': 6 - 0.5 * gdp_growth + np.random.normal(0, 0.3, len(dates5))
    })
    
    return {
        'monthly_sales': sales_df,
        'daily_temperature': temp_df,
        'stock_prices': stock_df,
        'website_traffic': traffic_df,
        'economic_indicators': gdp_df
    }

def save_sample_datasets():
    """Generate and save sample datasets"""
    datasets = generate_sample_datasets()
    
    # Create data directory if it doesn't exist
    data_dir = os.path.dirname(__file__)
    os.makedirs(data_dir, exist_ok=True)
    
    # Save as CSV files
    for name, df in datasets.items():
        csv_path = os.path.join(data_dir, f'{name}.csv')
        df.to_csv(csv_path, index=False)
        print(f"Saved {name} dataset with {len(df)} records")
    
    # Also create a metadata file describing the datasets
    metadata = {
        "datasets": [
            {
                "id": "monthly_sales",
                "name": "Monthly Sales Data",
                "description": "Retail sales data with trend and seasonal patterns",
                "frequency": "Monthly",
                "date_column": "date",
                "value_column": "sales",
                "features": ["trend", "seasonality", "growth"],
                "suitable_models": ["ARIMA", "SARIMA", "Holt-Winters"],
                "records": len(datasets['monthly_sales'])
            },
            {
                "id": "daily_temperature",
                "name": "Daily Temperature",
                "description": "Daily temperature readings with annual seasonality",
                "frequency": "Daily", 
                "date_column": "date",
                "value_column": "temperature",
                "features": ["seasonality", "noise"],
                "suitable_models": ["SARIMA", "Holt-Winters", "Prophet"],
                "records": len(datasets['daily_temperature'])
            },
            {
                "id": "stock_prices",
                "name": "Stock Price Data",
                "description": "Daily stock prices with random walk behavior",
                "frequency": "Daily",
                "date_column": "date", 
                "value_column": "price",
                "features": ["volatility", "random_walk"],
                "suitable_models": ["ARIMA", "LSTM"],
                "records": len(datasets['stock_prices'])
            },
            {
                "id": "website_traffic",
                "name": "Website Traffic",
                "description": "Hourly website visitor data with weekly patterns",
                "frequency": "Hourly",
                "date_column": "datetime",
                "value_column": "visitors", 
                "features": ["weekly_seasonality", "daily_patterns"],
                "suitable_models": ["SARIMA", "Prophet", "LSTM"],
                "records": len(datasets['website_traffic'])
            },
            {
                "id": "economic_indicators",
                "name": "Economic Indicators",
                "description": "Quarterly GDP growth with economic cycles",
                "frequency": "Quarterly",
                "date_column": "quarter",
                "value_column": "gdp_growth",
                "features": ["economic_cycles", "trend"], 
                "suitable_models": ["ARIMA", "SARIMA", "Holt-Winters"],
                "records": len(datasets['economic_indicators'])
            }
        ]
    }
    
    metadata_path = os.path.join(data_dir, 'datasets_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2, default=str)
    
    print(f"Saved metadata for {len(metadata['datasets'])} datasets")
    return metadata

if __name__ == "__main__":
    metadata = save_sample_datasets()
    print("Sample datasets generated successfully!")
    print("\nAvailable datasets:")
    for dataset in metadata['datasets']:
        print(f"- {dataset['name']}: {dataset['records']} records ({dataset['frequency']})")