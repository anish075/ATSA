import axios from 'axios';
import { TimeSeriesData, ModelConfig, ModelResult, TimeSeriesAnalysis } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
  }

  // Data endpoints
  async uploadData(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.axiosInstance.post('/data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getSampleDatasets(): Promise<any> {
    const response = await this.axiosInstance.get('/data/sample-datasets');
    return response.data;
  }

  async loadSampleDataset(datasetName: string): Promise<any> {
    const response = await this.axiosInstance.get(`/data/sample/${datasetName}`);
    return response.data;
  }

  async validateData(data: any): Promise<any> {
    const response = await this.axiosInstance.post('/data/validate', data);
    return response.data;
  }

  async preprocessData(data: any): Promise<any> {
    const response = await this.axiosInstance.post('/data/preprocess', data);
    return response.data;
  }

  // Analysis endpoints
  async performStationarityTest(data: any): Promise<any> {
    const response = await this.axiosInstance.post('/analysis/stationarity-test', data);
    return response.data;
  }

  async performSeasonalityTest(data: any): Promise<any> {
    const response = await this.axiosInstance.post('/analysis/seasonality-test', data);
    return response.data;
  }

  async decomposeTimeSeries(data: any): Promise<any> {
    const response = await this.axiosInstance.post('/analysis/decompose', data);
    return response.data;
  }

  async calculateACFPACF(data: any): Promise<any> {
    const response = await this.axiosInstance.post('/analysis/acf-pacf', data);
    return response.data;
  }

  async performFullAnalysis(data: any): Promise<TimeSeriesAnalysis> {
    const response = await this.axiosInstance.post('/analysis/full-analysis', data);
    return response.data.analysis;
  }

  // Model endpoints
  async fitModel(data: any, modelConfig: ModelConfig): Promise<ModelResult> {
    const requestData = {
      data,
      model_config: modelConfig,
    };
    
    const response = await this.axiosInstance.post('/models/fit', requestData);
    return response.data.result;
  }

  async compareModels(data: any, models: ModelConfig[]): Promise<any> {
    const requestData = {
      data,
      models,
    };
    
    const response = await this.axiosInstance.post('/models/compare', requestData);
    return response.data;
  }

  async getAvailableModels(): Promise<any> {
    const response = await this.axiosInstance.get('/models/available-models');
    return response.data;
  }

  async autoSelectModel(data: any): Promise<any> {
    const response = await this.axiosInstance.post('/models/auto-select', data);
    return response.data;
  }

  // Export endpoints
  async exportForecastCSV(data: any): Promise<Blob> {
    const response = await this.axiosInstance.post('/export/forecast-csv', data, {
      responseType: 'blob',
    });
    return response.data;
  }

  async exportChartPNG(data: any): Promise<any> {
    const response = await this.axiosInstance.post('/export/chart-png', data);
    return response.data;
  }

  async exportLearningReport(data: any): Promise<any> {
    const response = await this.axiosInstance.post('/export/learning-report-pdf', data);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.axiosInstance.get('/health');
    return response.data;
  }
}

// Utility functions
export const formatData = (rawData: any): TimeSeriesData => {
  return {
    records: rawData.records || [],
    columns: rawData.columns || [],
    timeColumn: rawData.suggested_time_column,
    valueColumns: rawData.suggested_value_columns || [],
    shape: rawData.info?.shape || [0, 0],
  };
};

export const createModelConfig = (
  modelType: string,
  parameters: Record<string, any> = {},
  forecastPeriods: number = 30,
  confidenceInterval: number = 0.95
): ModelConfig => {
  return {
    model_type: modelType as any,
    parameters,
    forecast_periods: forecastPeriods,
    confidence_interval: confidenceInterval,
  };
};

export const calculateMetrics = (actual: number[], predicted: number[]) => {
  const n = Math.min(actual.length, predicted.length);
  const actualSlice = actual.slice(0, n);
  const predictedSlice = predicted.slice(0, n);

  // MAE
  const mae = actualSlice.reduce((sum, val, i) => sum + Math.abs(val - predictedSlice[i]), 0) / n;

  // MSE
  const mse = actualSlice.reduce((sum, val, i) => sum + Math.pow(val - predictedSlice[i], 2), 0) / n;

  // RMSE
  const rmse = Math.sqrt(mse);

  // MAPE
  const mape = actualSlice.reduce((sum, val, i) => {
    if (val !== 0) {
      return sum + Math.abs((val - predictedSlice[i]) / val);
    }
    return sum;
  }, 0) / n * 100;

  return { mae, mse, rmse, mape };
};

export const generateDateRange = (startDate: string, periods: number, frequency: 'D' | 'M' | 'Y' = 'D'): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < periods; i++) {
    const current = new Date(start);
    
    switch (frequency) {
      case 'D':
        current.setDate(start.getDate() + i);
        break;
      case 'M':
        current.setMonth(start.getMonth() + i);
        break;
      case 'Y':
        current.setFullYear(start.getFullYear() + i);
        break;
    }
    
    dates.push(current.toISOString().split('T')[0]);
  }
  
  return dates;
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// Create singleton instance
const apiService = new ApiService();
export default apiService;