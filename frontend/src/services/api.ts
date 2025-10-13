import axios, { AxiosResponse } from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use((config) => {
  console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TimeSeriesData {
  records: Array<Record<string, any>>;
  value_column: string;
  time_column?: string;
}

export interface ModelConfig {
  model_type: string;
  parameters: Record<string, any>;
  forecast_periods?: number;
  confidence_interval?: number;
}

export interface ForecastResult {
  model_type: string;
  fitted_values: number[];
  forecast: number[];
  forecast_lower: number[];
  forecast_upper: number[];
  forecast_dates: string[];
  metrics: Record<string, number>;
  model_info: Record<string, any>;
}

// Learning API endpoints
export class LearningAPI {
  static async getModules(): Promise<any[]> {
    try {
      const response = await api.get('/learning/modules');
      return response.data.modules || [];
    } catch (error) {
      console.error('Failed to fetch learning modules:', error);
      return [];
    }
  }

  static async getModuleContent(moduleId: string): Promise<any> {
    try {
      const response = await api.get(`/learning/modules/${moduleId}`);
      return response.data.module;
    } catch (error) {
      console.error(`Failed to fetch module ${moduleId}:`, error);
      return null;
    }
  }

  static async getQuiz(moduleId: string): Promise<any> {
    try {
      const response = await api.get(`/learning/modules/${moduleId}/quiz`);
      return response.data.quiz;
    } catch (error) {
      console.error(`Failed to fetch quiz for ${moduleId}:`, error);
      return null;
    }
  }

  static async submitQuiz(moduleId: string, userId: string, answers: Record<string, any>): Promise<any> {
    try {
      const response = await api.post(`/learning/modules/${moduleId}/quiz/submit`, {
        user_id: userId,
        answers: answers
      });
      return response.data.results;
    } catch (error) {
      console.error(`Failed to submit quiz for ${moduleId}:`, error);
      return null;
    }
  }

  static async getUserProgress(userId: string): Promise<any> {
    try {
      const response = await api.get(`/learning/progress/${userId}`);
      return response.data.progress;
    } catch (error) {
      console.error(`Failed to fetch progress for ${userId}:`, error);
      return null;
    }
  }

  static async getRecommendations(userId: string): Promise<any> {
    try {
      const response = await api.get(`/learning/recommendations/${userId}`);
      return response.data.recommendations;
    } catch (error) {
      console.error(`Failed to fetch recommendations for ${userId}:`, error);
      return null;
    }
  }

  static async searchContent(query: string, moduleId?: string): Promise<any> {
    try {
      const params = new URLSearchParams({ query });
      if (moduleId) params.append('module_id', moduleId);
      
      const response = await api.get(`/learning/search?${params}`);
      return response.data.search;
    } catch (error) {
      console.error('Failed to search content:', error);
      return null;
    }
  }

  static async getLearningStats(): Promise<any> {
    try {
      const response = await api.get('/learning/stats');
      return response.data.stats;
    } catch (error) {
      console.error('Failed to fetch learning stats:', error);
      return null;
    }
  }
}

// Models API endpoints
export class ModelsAPI {
  static async fitModel(data: TimeSeriesData, config: ModelConfig): Promise<ForecastResult | null> {
    try {
      console.log('Fitting model with data:', data, 'and config:', config);
      const response = await api.post('/models/fit', {
        data: data,
        model_configuration: config
      });
      console.log('Model fit response:', response.data);
      return response.data.result;
    } catch (error: any) {
      console.error('Failed to fit model:', error);
      console.error('Error details:', error.response?.data);
      return null;
    }
  }

  static async compareModels(data: TimeSeriesData, models: ModelConfig[]): Promise<any> {
    try {
      const response = await api.post('/models/compare', {
        data: data,
        models: models
      });
      return response.data.result;
    } catch (error) {
      console.error('Failed to compare models:', error);
      return null;
    }
  }

  static async getAvailableModels(): Promise<any> {
    try {
      const response = await api.get('/models/available');
      return response.data.models;
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      return {};
    }
  }

  static async validateParameters(config: ModelConfig): Promise<any> {
    try {
      const response = await api.post('/models/validate', config);
      return response.data;
    } catch (error) {
      console.error('Failed to validate parameters:', error);
      return { valid: false, error: 'Validation failed' };
    }
  }
}

// Analysis API endpoints
export class AnalysisAPI {
  static async comprehensiveAnalysis(data: TimeSeriesData): Promise<any> {
    try {
      const response = await api.post('/analysis/comprehensive-analysis', data);
      return response.data.analysis;
    } catch (error) {
      console.error('Failed to perform comprehensive analysis:', error);
      return null;
    }
  }

  static async detectOutliers(data: TimeSeriesData, method: string = 'iqr'): Promise<any> {
    try {
      const response = await api.post('/analysis/outlier-detection', {
        ...data,
        method: method
      });
      return response.data.outliers;
    } catch (error) {
      console.error('Failed to detect outliers:', error);
      return null;
    }
  }

  static async getModelSuggestions(data: TimeSeriesData): Promise<any> {
    try {
      const response = await api.post('/analysis/model-suggestions', data);
      return response.data.suggestions;
    } catch (error) {
      console.error('Failed to get model suggestions:', error);
      return null;
    }
  }

  static async testStationarity(data: TimeSeriesData): Promise<any> {
    try {
      const response = await api.post('/analysis/stationarity-test', data);
      return response.data.result;
    } catch (error) {
      console.error('Failed to test stationarity:', error);
      return null;
    }
  }

  static async decomposeTimeSeries(data: TimeSeriesData, method: string = 'additive', period?: number): Promise<any> {
    try {
      const requestData: any = { ...data, method };
      if (period) requestData.period = period;
      
      const response = await api.post('/analysis/decompose', requestData);
      return response.data.result;
    } catch (error) {
      console.error('Failed to decompose time series:', error);
      return null;
    }
  }

  static async calculateACFPACF(data: TimeSeriesData, lags: number = 40): Promise<any> {
    try {
      const response = await api.post('/analysis/acf-pacf', {
        ...data,
        lags: lags
      });
      return response.data.result;
    } catch (error) {
      console.error('Failed to calculate ACF/PACF:', error);
      return null;
    }
  }
}

// Data API endpoints
export class DataAPI {
  static async uploadData(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/data/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload data:', error);
      return null;
    }
  }

  static async getSampleDatasets(): Promise<any[]> {
    try {
      const response = await api.get('/data/sample-datasets');
      return response.data.datasets || [];
    } catch (error) {
      console.error('Failed to fetch sample datasets:', error);
      return [];
    }
  }

  static async loadSampleDataset(datasetName: string): Promise<any> {
    try {
      const response = await api.get(`/data/sample-datasets/${datasetName}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to load dataset ${datasetName}:`, error);
      return null;
    }
  }

  static async preprocessData(data: any, options: any): Promise<any> {
    try {
      const response = await api.post('/data/preprocess', {
        data: data,
        options: options
      });
      return response.data;
    } catch (error) {
      console.error('Failed to preprocess data:', error);
      return null;
    }
  }
}

// Health check
export class HealthAPI {
  static async checkBackendHealth(): Promise<boolean> {
    try {
      console.log('🔍 Checking backend health at:', `${API_BASE_URL}/health`);
      const response = await api.get('/health', { timeout: 5000 });
      console.log('✅ Backend health check successful:', response.data);
      return response.status === 200;
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      return false;
    }
  }

  static async getAPIInfo(): Promise<any> {
    try {
      const response = await axios.get('http://localhost:8000/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API info:', error);
      return null;
    }
  }
}

// Export all APIs
export { api };
export default {
  Learning: LearningAPI,
  Models: ModelsAPI,
  Analysis: AnalysisAPI,
  Data: DataAPI,
  Health: HealthAPI
};