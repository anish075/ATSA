import requests
import json

# Load sample data
print("📊 Loading sample dataset...")
response = requests.get('http://localhost:8000/api/data/sample-datasets/stock_prices')
data = response.json()

print(f"✅ Data loaded: {data['title']}")
print(f"📈 Records: {len(data['records'])}")
print(f"📋 Columns: {data.keys()}")

# Prepare model request
model_request = {
    "data": {
        "records": data['records'],
        "value_column": data['value_column'],
        "time_column": data['time_column']
    },
    "model_configuration": {
        "model_type": "arima",
        "parameters": {"order": [1, 1, 1]},
        "forecast_periods": 12,
        "confidence_interval": 0.95
    }
}

print("\n🔧 Fitting ARIMA model...")
print(f"Model config: {model_request['model_configuration']}")

try:
    response = requests.post(
        'http://localhost:8000/api/models/fit',
        json=model_request,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 200:
        result = response.json()
        print("\n✅ Model fitted successfully!")
        print(f"📊 Forecast length: {len(result['result']['forecast'])}")
        print(f"📊 Metrics: {result['result']['metrics']}")
    else:
        print(f"\n❌ Error {response.status_code}:")
        print(response.text)
except Exception as e:
    print(f"\n❌ Exception: {e}")
