// Type definitions for the ATSA Playground application
import { ReactNode } from 'react';

export interface TimeSeriesData {
  records: Array<Record<string, any>>;
  columns: string[];
  timeColumn?: string;
  valueColumns: string[];
  shape: [number, number];
}

export interface DataUploadResponse {
  success: boolean;
  message: string;
  data: {
    records: Array<Record<string, any>>;
    info: {
      shape: [number, number];
      columns: string[];
      dtypes: Record<string, string>;
      null_counts: Record<string, number>;
      description: Record<string, any>;
    };
    suggested_time_column?: string;
    suggested_value_columns: string[];
    preprocessing_suggestions: {
      missing_data: Record<string, any>;
      outliers: Record<string, number>;
      frequency?: string;
      transformations: string[];
    };
  };
}

export interface ModelConfig {
  model_type: 'arima' | 'sarima' | 'holt-winters' | 'prophet' | 'lstm' | 'var' | 'garch';
  parameters: Record<string, any>;
  forecast_periods: number;
  confidence_interval: number;
}

export interface ModelResult {
  model_type: string;
  fitted_values: number[];
  forecast: number[];
  forecast_lower: number[];
  forecast_upper: number[];
  metrics: {
    mae: number;
    mse: number;
    rmse: number;
    mape: number;
    aic?: number;
    bic?: number;
  };
  parameters: Record<string, any>;
}

export interface TimeSeriesAnalysis {
  stationarity_test: {
    adf_statistic: number;
    adf_pvalue: number;
    kpss_statistic: number;
    kpss_pvalue: number;
    is_stationary: boolean;
  };
  seasonality_test: {
    has_seasonality: boolean;
    seasonal_period?: number;
    seasonal_strength?: number;
  };
  trend_analysis: {
    has_trend: boolean;
    trend_direction?: 'increasing' | 'decreasing';
    trend_strength?: number;
  };
  acf_pacf: {
    acf_values: number[];
    pacf_values: number[];
    lags: number[];
    confidence_intervals: number[];
  };
  decomposition: {
    trend: number[];
    seasonal: number[];
    residual: number[];
    method: 'additive' | 'multiplicative';
  };
}

export interface SampleDataset {
  name: string;
  description: string;
  columns: string[];
  rows: number;
  time_column?: string;
  value_columns: string[];
}

export interface LearningModule {
  id: string;
  title: string;
  category: 'basics' | 'modeling' | 'forecasting' | 'evaluation';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  content: {
    explanation: string;
    mathematics?: string;
    examples: string[];
    visualizations: Array<{
      type: 'animation' | 'chart' | 'diagram';
      content: any;
    }>;
    interactiveElements?: Array<{
      type: 'slider' | 'toggle' | 'input';
      config: any;
    }>;
  };
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface AppState {
  currentData?: TimeSeriesData;
  selectedModels: ModelConfig[];
  modelResults: Record<string, ModelResult>;
  analysis?: TimeSeriesAnalysis;
  isLoading: boolean;
  error?: string;
}

export interface ChartData {
  x: (string | number | Date)[];
  y: number[];
  name?: string;
  type?: string;
  mode?: string;
  line?: Record<string, any>;
  fill?: string;
  showlegend?: boolean;
}

export interface ModelComparisonMetrics {
  modelName: string;
  mae: number;
  mse: number;
  rmse: number;
  mape: number;
  aic?: number;
  bic?: number;
  rank: number;
}

export interface ExportOptions {
  format: 'csv' | 'png' | 'pdf';
  dataType: 'forecast' | 'chart' | 'report';
  includeMetrics: boolean;
  includePlots: boolean;
  includeData: boolean;
}

export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}