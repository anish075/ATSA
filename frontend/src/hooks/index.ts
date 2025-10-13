import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../utils/api';
import { TimeSeriesData, ModelConfig, ModelResult } from '../types';

// Custom hook for data upload
export const useDataUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => apiService.uploadData(file),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentData'], data);
    },
    onError: (error) => {
      console.error('Data upload failed:', error);
    },
  });
};

// Custom hook for sample datasets
export const useSampleDatasets = () => {
  return useQuery({
    queryKey: ['sampleDatasets'],
    queryFn: () => apiService.getSampleDatasets(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Custom hook for loading sample dataset
export const useLoadSampleDataset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (datasetName: string) => apiService.loadSampleDataset(datasetName),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentData'], data);
    },
  });
};

// Custom hook for time series analysis
export const useTimeSeriesAnalysis = (data: any) => {
  return useQuery({
    queryKey: ['analysis', data],
    queryFn: () => apiService.performFullAnalysis(data),
    enabled: !!data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Custom hook for model fitting
export const useModelFit = () => {
  return useMutation({
    mutationFn: ({ data, modelConfig }: { data: any; modelConfig: ModelConfig }) =>
      apiService.fitModel(data, modelConfig),
    onError: (error) => {
      console.error('Model fitting failed:', error);
    },
  });
};

// Custom hook for model comparison
export const useModelComparison = () => {
  return useMutation({
    mutationFn: ({ data, models }: { data: any; models: ModelConfig[] }) =>
      apiService.compareModels(data, models),
  });
};

// Custom hook for available models
export const useAvailableModels = () => {
  return useQuery({
    queryKey: ['availableModels'],
    queryFn: () => apiService.getAvailableModels(),
    staleTime: Infinity, // This rarely changes
  });
};

// Custom hook for managing application state
export const useAppState = () => {
  const [currentData, setCurrentData] = useState<TimeSeriesData | null>(null);
  const [selectedModels, setSelectedModels] = useState<ModelConfig[]>([]);
  const [modelResults, setModelResults] = useState<Record<string, ModelResult>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addModelResult = useCallback((modelId: string, result: ModelResult) => {
    setModelResults(prev => ({
      ...prev,
      [modelId]: result
    }));
  }, []);

  const removeModelResult = useCallback((modelId: string) => {
    setModelResults(prev => {
      const { [modelId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllResults = useCallback(() => {
    setModelResults({});
  }, []);

  const updateSelectedModels = useCallback((models: ModelConfig[]) => {
    setSelectedModels(models);
  }, []);

  const setAppError = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  return {
    currentData,
    setCurrentData,
    selectedModels,
    updateSelectedModels,
    modelResults,
    addModelResult,
    removeModelResult,
    clearAllResults,
    isLoading,
    setIsLoading,
    error,
    setAppError,
  };
};

// Custom hook for local storage persistence
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};

// Custom hook for debounced values
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  });

  return debouncedValue;
};

// Custom hook for notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>>([]);

  const addNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString();
    const notification = { id, type, message, duration };
    
    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    success: (message: string, duration?: number) => addNotification('success', message, duration),
    error: (message: string, duration?: number) => addNotification('error', message, duration),
    warning: (message: string, duration?: number) => addNotification('warning', message, duration),
    info: (message: string, duration?: number) => addNotification('info', message, duration),
  };
};

// Custom hook for chart data management
export const useChartData = () => {
  const [chartConfig, setChartConfig] = useState({
    showConfidenceInterval: true,
    showTrendLine: false,
    chartType: 'line' as 'line' | 'scatter',
    colorScheme: 'default' as 'default' | 'colorblind' | 'dark',
  });

  const updateChartConfig = useCallback((updates: Partial<typeof chartConfig>) => {
    setChartConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const getPlotlyConfig = useCallback(() => {
    return {
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      displaylogo: false,
      responsive: true,
    };
  }, []);

  const getPlotlyLayout = useCallback((title?: string) => {
    return {
      title: title ? { text: title, font: { size: 18 } } : undefined,
      autosize: true,
      margin: { l: 60, r: 40, t: 60, b: 60 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { size: 12 },
      xaxis: {
        title: 'Date',
        showgrid: true,
        gridcolor: '#e5e7eb',
        type: 'date',
      },
      yaxis: {
        title: 'Value',
        showgrid: true,
        gridcolor: '#e5e7eb',
      },
      legend: {
        x: 0,
        y: 1,
        bgcolor: 'rgba(255,255,255,0.8)',
      },
      hovermode: 'x unified',
    };
  }, []);

  return {
    chartConfig,
    updateChartConfig,
    getPlotlyConfig,
    getPlotlyLayout,
  };
};

// Custom hook for keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  useState(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = `${event.ctrlKey ? 'Ctrl+' : ''}${event.altKey ? 'Alt+' : ''}${event.shiftKey ? 'Shift+' : ''}${event.key}`;
      
      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
};