import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Plot from 'react-plotly.js';
import { 
  Upload, 
  Download, 
  Play, 
  Pause, 
  RotateCcw,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react';
import { DataAPI, ModelsAPI, AnalysisAPI } from '../services/api';

const PlaygroundPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('arima');
  const [modelParameters, setModelParameters] = useState({
    p: 1,
    d: 1,
    q: 1,
    forecast_periods: 30
  });
  const [modelResults, setModelResults] = useState<any>(null);
  const [activeView, setActiveView] = useState<'raw' | 'decomposition' | 'forecast'>('raw');
  const [error, setError] = useState<string | null>(null);
  const [decomposition, setDecomposition] = useState<any>(null);

  // Sample data for demonstration
  const sampleData = {
    dates: Array.from({ length: 100 }, (_, i) => {
      const date = new Date(2023, 0, 1);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    }),
    values: Array.from({ length: 100 }, (_, i) => {
      return 100 + 20 * Math.sin(i * 0.1) + 10 * Math.sin(i * 0.3) + (Math.random() - 0.5) * 20;
    })
  };

  useEffect(() => {
    // Load sample data on component mount
    loadSampleData('stock_prices');
  }, []);

  const loadSampleData = async (datasetName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await DataAPI.loadSampleDataset(datasetName);
      if (result && result.success) {
        setData({
          records: result.records,
          value_column: result.value_column,
          time_column: result.time_column,
          title: result.title
        });
      } else {
        setError('Failed to load sample dataset');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading sample data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await DataAPI.uploadData(file);
        if (result && result.success) {
          setData({
            records: result.data,
            columns: result.columns,
            value_column: result.columns[result.columns.length - 1], // Use last column as value column
            time_column: result.columns[0] // Use first column as time column
          });
        } else {
          setError('Failed to upload file');
        }
      } catch (err: any) {
        setError(err.message || 'Error uploading file');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleModelRun = async () => {
    if (!data || !data.records) {
      setError('No data available. Please upload data or select a sample dataset.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const modelConfig = {
        model_type: selectedModel,
        parameters: modelParameters,
        forecast_periods: modelParameters.forecast_periods,
        confidence_interval: 0.95
      };

      const result = await ModelsAPI.fitModel(data, modelConfig);
      
      if (result) {
        setModelResults(result);
        setActiveView('forecast');
      } else {
        setError('Failed to fit model');
      }
    } catch (err: any) {
      setError(err.message || 'Error running model');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecomposition = async () => {
    if (!data || !data.records) {
      setError('No data available');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await AnalysisAPI.decomposeTimeSeries(data, 'additive');
      if (result) {
        setDecomposition(result);
        setActiveView('decomposition');
      } else {
        setError('Failed to decompose time series');
      }
    } catch (err: any) {
      setError(err.message || 'Error decomposing series');
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = () => {
    if (!data || !data.records) return null;

    let chartData: any[] = [];
    const timeValues = data.records.map((r: any) => r[data.time_column]);
    const dataValues = data.records.map((r: any) => r[data.value_column]);

    if (activeView === 'raw' || activeView === 'forecast') {
      // Raw data trace
      chartData.push({
        x: timeValues,
        y: dataValues,
        type: 'scatter',
        mode: 'lines',
        name: 'Actual Data',
        line: { color: '#3b82f6', width: 2 }
      });

      // Forecast trace
      if (activeView === 'forecast' && modelResults) {
        chartData.push({
          x: modelResults.forecast_dates,
          y: modelResults.forecast,
          type: 'scatter',
          mode: 'lines',
          name: 'Forecast',
          line: { color: '#ef4444', width: 2, dash: 'dash' }
        });

        // Confidence interval
        if (modelResults.forecast_upper && modelResults.forecast_lower) {
          chartData.push({
            x: [...modelResults.forecast_dates, ...modelResults.forecast_dates.slice().reverse()],
            y: [...modelResults.forecast_upper, ...modelResults.forecast_lower.slice().reverse()],
            fill: 'toself',
            fillcolor: 'rgba(239, 68, 68, 0.2)',
            line: { color: 'transparent' },
            name: '95% Confidence',
            showlegend: true
          });
        }
      }
    }

    if (activeView === 'decomposition' && decomposition) {
      return (
        <div className="space-y-4">
          {[
            { name: 'Original', data: decomposition.original || dataValues, color: '#3b82f6' },
            { name: 'Trend', data: decomposition.trend, color: '#10b981' },
            { name: 'Seasonal', data: decomposition.seasonal, color: '#f59e0b' },
            { name: 'Residual', data: decomposition.residual, color: '#ef4444' }
          ].filter(component => component.data).map((component) => (
            <div key={component.name} className="neu-card p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{component.name}</h4>
              <Plot
                data={[{
                  x: timeValues,
                  y: component.data,
                  type: 'scatter',
                  mode: 'lines',
                  line: { color: component.color, width: 2 }
                }]}
                layout={{
                  height: 200,
                  margin: { l: 40, r: 20, t: 20, b: 40 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { size: 12 },
                  xaxis: { showgrid: true, gridcolor: '#e5e7eb' },
                  yaxis: { showgrid: true, gridcolor: '#e5e7eb' }
                }}
                config={{ displayModeBar: false }}
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <Plot
        data={chartData}
        layout={{
          title: {
            text: activeView === 'forecast' ? 'Time Series Forecast' : 'Time Series Data',
            font: { size: 18, color: '#374151' }
          },
          height: 500,
          margin: { l: 60, r: 40, t: 60, b: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { size: 12 },
          xaxis: { 
            title: 'Date',
            showgrid: true, 
            gridcolor: '#e5e7eb',
            type: 'date'
          },
          yaxis: { 
            title: 'Value',
            showgrid: true, 
            gridcolor: '#e5e7eb'
          },
          legend: {
            x: 0,
            y: 1,
            bgcolor: 'rgba(255,255,255,0.8)'
          }
        } as any}
        config={{ 
          displayModeBar: true,
          modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
          displaylogo: false
        }}
        style={{ width: '100%' }}
      />
    );
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Time Series Playground</h1>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { key: 'raw', label: 'Raw Data', icon: <BarChart3 className="w-4 h-4" /> },
              { key: 'decomposition', label: 'Decomposition', icon: <Activity className="w-4 h-4" /> },
              { key: 'forecast', label: 'Forecast', icon: <TrendingUp className="w-4 h-4" /> }
            ].map((view) => (
              <button
                key={view.key}
                onClick={() => {
                  setActiveView(view.key as any);
                  if (view.key === 'decomposition' && !decomposition) {
                    handleDecomposition();
                  }
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                  activeView === view.key
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {view.icon}
                <span className="text-sm font-medium">{view.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <label className="neu-button cursor-pointer flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
            <Upload className="w-4 h-4" />
            <span>Upload Data</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleModelRun}
            disabled={isLoading || !data}
            className="neu-button flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Model</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {error && (
        <div className="flex items-center space-x-2 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-800 dark:text-red-300">
            {error}
          </span>
        </div>
      )}
      
      {selectedFile && !error && (
        <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-800 dark:text-blue-300">
            File uploaded: {selectedFile.name}
          </span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2">
          <div className="neu-card p-6 h-full">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-64 space-y-4"
                >
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedFile ? 'Processing your data...' : 'Fitting model...'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full"
                >
                  {renderChart()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          {/* Model Selection */}
          <div className="neu-card p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Model Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model Type
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                >
                  <option value="arima">ARIMA</option>
                  <option value="sarima">SARIMA</option>
                  <option value="holt-winters">Holt-Winters</option>
                  <option value="prophet">Prophet</option>
                  <option value="lstm">LSTM</option>
                </select>
              </div>

              {selectedModel === 'arima' && (
                <div className="space-y-3">
                  {['p', 'd', 'q'].map((param) => (
                    <div key={param}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {param.toUpperCase()} Parameter
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        value={modelParameters[param as keyof typeof modelParameters] as number}
                        onChange={(e) => setModelParameters(prev => ({
                          ...prev,
                          [param]: parseInt(e.target.value)
                        }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>{modelParameters[param as keyof typeof modelParameters]}</span>
                        <span>5</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Forecast Periods
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={modelParameters.forecast_periods}
                  onChange={(e) => setModelParameters(prev => ({
                    ...prev,
                    forecast_periods: parseInt(e.target.value)
                  }))}
                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Metrics Display */}
          {modelResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="neu-card p-4"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Model Performance</h3>
              
              <div className="space-y-3">
                {Object.entries(modelResults.metrics).map(([metric, value]) => (
                  <div key={metric} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {metric.toUpperCase()}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {typeof value === 'string' ? value : String(value)}
                      {metric === 'mape' && '%'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export Results</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Sample Datasets */}
          <div className="neu-card p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sample Datasets</h3>
            
            <div className="space-y-2">
              {[
                { name: 'stock_prices', label: 'Stock Prices' },
                { name: 'sales_data', label: 'Retail Sales' },
                { name: 'temperature_data', label: 'Temperature Data' },
                { name: 'airline_passengers', label: 'Airline Passengers' }
              ].map((dataset) => (
                <button
                  key={dataset.name}
                  onClick={() => loadSampleData(dataset.name)}
                  className="w-full text-left p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  {dataset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundPage;