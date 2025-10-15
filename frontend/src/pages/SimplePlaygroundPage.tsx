import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Plot from 'react-plotly.js';
import API from '../services/api';

const PlaygroundPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('arima');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [sampleDatasets, setSampleDatasets] = useState<any[]>([]);
  const [currentData, setCurrentData] = useState<any>(null);
  const [forecastPeriods, setForecastPeriods] = useState(12);
  const [enlargedChart, setEnlargedChart] = useState<'data' | 'forecast' | null>(null);
  const [dataFrequency, setDataFrequency] = useState<string>('periods');
  const [customParams, setCustomParams] = useState<any>({
    arima: { p: 2, d: 1, q: 2 },
    sarima: { p: 2, d: 1, q: 2, P: 1, D: 1, Q: 1, s: 12 },
    holt_winters: { trend: 'add', seasonal: 'add', seasonal_periods: 12 },
    prophet: { yearly_seasonality: true, weekly_seasonality: false, daily_seasonality: false },
    lstm: { sequence_length: 60, lstm_units: 50, dropout_rate: 0.2 },
    moving_average: { window: 12 }
  });
  const [useCustomParams, setUseCustomParams] = useState(false);

  useEffect(() => {
    initializePlayground();
  }, []);

  const initializePlayground = async () => {
    // Check backend connection
    const isConnected = await API.Health.checkBackendHealth();
    setBackendConnected(isConnected);
    
    if (isConnected) {
      // Load sample datasets
      const datasets = await API.Data.getSampleDatasets();
      setSampleDatasets(datasets);
    }
  };

  const downloadResults = () => {
    if (!analysisResult) {
      alert('No analysis results to download');
      return;
    }

    const results = {
      model: selectedModel,
      timestamp: new Date().toISOString(),
      metrics: analysisResult.metrics,
      forecast: analysisResult.forecast,
      forecast_dates: analysisResult.forecast_dates,
      forecast_lower: analysisResult.forecast_lower,
      forecast_upper: analysisResult.forecast_upper,
      fitted_values: analysisResult.fitted_values,
      model_info: analysisResult.model_info
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedModel}_results_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (!analysisResult || !currentData) {
      alert('No data to export');
      return;
    }

    let csvContent = 'Date,Actual,Fitted,Forecast,Lower_CI,Upper_CI\n';
    
    // Add historical data with fitted values
    currentData.records.forEach((record: any, i: number) => {
      const date = record[currentData.time_column];
      const actual = record[currentData.value_column];
      const fitted = analysisResult.fitted_values && i < analysisResult.fitted_values.length 
        ? analysisResult.fitted_values[i] 
        : '';
      csvContent += `${date},${actual},${fitted},,,\n`;
    });

    // Add forecast data
    if (analysisResult.forecast_dates) {
      analysisResult.forecast_dates.forEach((date: string, i: number) => {
        const forecast = analysisResult.forecast[i];
        const lower = analysisResult.forecast_lower[i];
        const upper = analysisResult.forecast_upper[i];
        csvContent += `${date},,,${forecast},${lower},${upper}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedModel}_forecast_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    if (!analysisResult || !currentData) {
      alert('No analysis results to generate report');
      return;
    }

    const report = `
ATSA PLAYGROUND - ANALYSIS REPORT
=================================

Generated: ${new Date().toLocaleString()}
Model: ${selectedModel.toUpperCase()}
Dataset: ${currentData.name || 'Custom Dataset'}

PERFORMANCE METRICS
-------------------
${analysisResult.metrics ? Object.entries(analysisResult.metrics)
  .map(([key, value]: [string, any]) => `${key.toUpperCase()}: ${typeof value === 'number' ? value.toFixed(4) : value}`)
  .join('\n') : 'No metrics available'}

FORECAST SUMMARY
----------------
Forecast Periods: ${analysisResult.forecast?.length || 0}
Confidence Interval: 95%
${analysisResult.forecast ? `
First Forecast: ${analysisResult.forecast[0].toFixed(2)}
Last Forecast: ${analysisResult.forecast[analysisResult.forecast.length - 1].toFixed(2)}
Average Forecast: ${(analysisResult.forecast.reduce((a: number, b: number) => a + b, 0) / analysisResult.forecast.length).toFixed(2)}
` : ''}

MODEL INFORMATION
-----------------
${analysisResult.model_info ? Object.entries(analysisResult.model_info)
  .map(([key, value]: [string, any]) => `${key}: ${value}`)
  .join('\n') : 'No model info available'}

---
Report generated by ATSA Playground
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedModel}_report_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const runAnalysis = async () => {
    console.log('runAnalysis called');
    console.log('backendConnected:', backendConnected);
    console.log('currentData:', currentData);
    
    if (!backendConnected || !currentData) {
      alert('Backend connection and data required for analysis');
      return;
    }

    setIsAnalyzing(true);
    try {
      const parameters = getModelParameters(selectedModel);
      const modelConfig = {
        model_type: selectedModel,
        parameters: parameters,
        forecast_periods: forecastPeriods,
        confidence_interval: 0.95
      };
      
      console.log('Calling API.Models.fitModel with:', currentData, modelConfig);
      const result = await API.Models.fitModel(currentData, modelConfig);
      console.log('Analysis result:', result);
      
      if (result) {
        console.log('Forecast data:', result.forecast);
        console.log('Forecast dates:', result.forecast_dates);
        console.log('Forecast length:', result.forecast?.length);
        console.log('Forecast dates length:', result.forecast_dates?.length);
        setAnalysisResult(result);
      } else {
        console.error('No result returned from API');
        alert('Analysis failed - no result returned');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please check the console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getModelParameters = (modelType: string) => {
    // If custom parameters enabled, use them
    if (useCustomParams && customParams[modelType]) {
      if (modelType === 'arima') {
        return { order: [customParams.arima.p, customParams.arima.d, customParams.arima.q] };
      } else if (modelType === 'sarima') {
        return { 
          order: [customParams.sarima.p, customParams.sarima.d, customParams.sarima.q],
          seasonal_order: [customParams.sarima.P, customParams.sarima.D, customParams.sarima.Q, customParams.sarima.s]
        };
      } else if (modelType === 'holt_winters') {
        return customParams.holt_winters;
      } else if (modelType === 'prophet') {
        return customParams.prophet;
      } else if (modelType === 'lstm') {
        return customParams.lstm;
      } else if (modelType === 'moving_average') {
        return customParams.moving_average;
      }
    }
    
    // Auto-detect data frequency to set appropriate seasonal periods
    const dataLength = currentData?.records?.length || 0;
    let seasonalPeriods = 12; // default monthly
    
    // Try to detect frequency from data
    if (currentData?.records && currentData.records.length >= 2) {
      const sampleSize = Math.min(10, currentData.records.length);
      const subset = currentData.records.slice(0, sampleSize);
      
      // Check if we have daily data (many records, close dates)
      if (dataLength > 300) {
        seasonalPeriods = 7; // weekly seasonality for daily data
      } else if (dataLength > 50 && dataLength <= 300) {
        seasonalPeriods = 12; // monthly seasonality
      } else if (dataLength <= 50) {
        seasonalPeriods = 4; // quarterly seasonality
      }
    }
    
    switch (modelType) {
      case 'arima':
        return { order: [2, 1, 2] }; // More flexible AR and MA terms
      case 'sarima':
        return { 
          order: [2, 1, 2], 
          seasonal_order: [1, 1, 1, seasonalPeriods] 
        };
      case 'holt_winters':
        return { 
          trend: 'add', 
          seasonal: 'add', 
          seasonal_periods: seasonalPeriods 
        };
      case 'prophet':
        return { 
          yearly_seasonality: true, 
          weekly_seasonality: dataLength > 300,
          daily_seasonality: false
        };
      case 'lstm':
        return { 
          sequence_length: Math.min(60, Math.floor(dataLength * 0.2)), 
          lstm_units: 50, 
          dropout_rate: 0.2 
        };
      case 'moving_average':
        return { window: Math.min(12, Math.floor(dataLength * 0.1)) };
      default:
        return {};
    }
  };

  const detectDataFrequency = (data: any): string => {
    if (!data || !data.records || data.records.length < 2) return 'periods';
    
    const dataLength = data.records.length;
    const datasetName = data.name?.toLowerCase() || '';
    
    // Check by dataset name
    if (datasetName.includes('daily') || datasetName.includes('stock') || datasetName.includes('traffic')) {
      return 'days';
    }
    if (datasetName.includes('monthly') || datasetName.includes('sales')) {
      return 'months';
    }
    if (datasetName.includes('quarterly')) {
      return 'quarters';
    }
    if (datasetName.includes('yearly') || datasetName.includes('annual')) {
      return 'years';
    }
    
    // Check by data length (heuristic)
    if (dataLength > 300) {
      return 'days'; // Likely daily data
    } else if (dataLength > 50 && dataLength <= 300) {
      return 'months'; // Likely monthly data
    } else if (dataLength <= 50) {
      return 'quarters/years'; // Likely quarterly or yearly
    }
    
    return 'periods';
  };

  const loadSampleData = async (datasetName: string) => {
    console.log('loadSampleData called with:', datasetName);
    if (datasetName) {
      const response = await API.Data.loadSampleDataset(datasetName);
      console.log('Loaded data response:', response);
      
      // Extract only the required fields for model fitting
      if (response && response.records) {
        const data = {
          records: response.records,
          value_column: response.value_column,
          time_column: response.time_column,
          name: response.name
        };
        console.log('Extracted data for modeling:', data);
        
        // Detect and set data frequency
        const frequency = detectDataFrequency(data);
        setDataFrequency(frequency);
        console.log('Detected data frequency:', frequency);
        
        setCurrentData(data);
      } else {
        console.error('Invalid data format received');
        setCurrentData(null);
        setDataFrequency('periods');
      }
    } else {
      setCurrentData(null);
      setDataFrequency('periods');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-blue-600">🎯 ATSA Playground</Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
                <Link to="/playground" className="text-blue-600 font-medium">Playground</Link>
                <Link to="/learn" className="text-gray-600 hover:text-blue-600">Learn</Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1">
            {/* Backend Connection Status */}
            <div className={`mb-6 p-4 rounded-lg ${backendConnected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  {backendConnected ? 'Backend Connected' : 'Backend Disconnected'}
                </span>
              </div>
              {!backendConnected && (
                <p className="text-sm text-gray-600 mt-2">
                  Please start the backend server to access full analysis features.
                </p>
              )}
            </div>

            {/* Data Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">📊 Data Selection</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Datasets
                </label>
                <select 
                  onChange={(e) => loadSampleData(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!backendConnected}
                >
                  <option value="">Select a dataset</option>
                  {sampleDatasets.map((dataset) => (
                    <option key={dataset.name} value={dataset.name}>
                      {dataset.name} ({dataset.description})
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center">
                <button className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  backendConnected 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`} disabled={!backendConnected}>
                  📁 Upload Custom Data
                </button>
              </div>
            </div>

            {/* Model Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">🤖 Model Selection</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Model
                </label>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!backendConnected}
                >
                  <option value="arima">ARIMA</option>
                  <option value="sarima">SARIMA</option>
                  <option value="holt_winters">Holt-Winters</option>
                  <option value="prophet">Prophet</option>
                  <option value="lstm">LSTM</option>
                  <option value="moving_average">Moving Average</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forecast Periods
                  {currentData && (
                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Unit: {dataFrequency}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={forecastPeriods}
                  onChange={(e) => setForecastPeriods(parseInt(e.target.value) || 12)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!backendConnected}
                  placeholder="Enter number of periods"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {currentData 
                    ? `📅 Forecast ${forecastPeriods} ${dataFrequency} into the future`
                    : '📅 Select a dataset first to see forecast units'}
                </p>
              </div>

              {/* Custom Parameters Toggle */}
              <div className="mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomParams}
                    onChange={(e) => setUseCustomParams(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={!backendConnected}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    ⚙️ Customize Parameters
                  </span>
                </label>
              </div>

              {/* Custom Parameters Section */}
              {useCustomParams && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    📊 Model Parameters
                  </h4>
                  
                  {selectedModel === 'arima' && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">p (AR order)</label>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={customParams.arima.p}
                            onChange={(e) => setCustomParams({
                              ...customParams,
                              arima: { ...customParams.arima, p: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">d (Differencing)</label>
                          <input
                            type="number"
                            min="0"
                            max="2"
                            value={customParams.arima.d}
                            onChange={(e) => setCustomParams({
                              ...customParams,
                              arima: { ...customParams.arima, d: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">q (MA order)</label>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={customParams.arima.q}
                            onChange={(e) => setCustomParams({
                              ...customParams,
                              arima: { ...customParams.arima, q: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        p: autoregressive terms, d: differencing order, q: moving average terms
                      </p>
                    </>
                  )}

                  {selectedModel === 'sarima' && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">p (AR)</label>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={customParams.sarima.p}
                            onChange={(e) => setCustomParams({
                              ...customParams,
                              sarima: { ...customParams.sarima, p: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">d (I)</label>
                          <input
                            type="number"
                            min="0"
                            max="2"
                            value={customParams.sarima.d}
                            onChange={(e) => setCustomParams({
                              ...customParams,
                              sarima: { ...customParams.sarima, d: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">q (MA)</label>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={customParams.sarima.q}
                            onChange={(e) => setCustomParams({
                              ...customParams,
                              sarima: { ...customParams.sarima, q: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">P (Seas AR)</label>
                          <input
                            type="number"
                            min="0"
                            max="2"
                            value={customParams.sarima.P}
                            onChange={(e) => setCustomParams({
                              ...customParams,
                              sarima: { ...customParams.sarima, P: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">D (Seas I)</label>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            value={customParams.sarima.D}
                            onChange={(e) => setCustomParams({
                              ...customParams,
                              sarima: { ...customParams.sarima, D: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Q (Seas MA)</label>
                          <input
                            type="number"
                            min="0"
                            max="2"
                            value={customParams.sarima.Q}
                            onChange={(e) => setCustomParams({
                              ...customParams,
                              sarima: { ...customParams.sarima, Q: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">s (Period)</label>
                          <input
                            type="number"
                            min="2"
                            max="365"
                            value={customParams.sarima.s}
                            onChange={(e) => setCustomParams({
                              ...customParams,
                              sarima: { ...customParams.sarima, s: parseInt(e.target.value) || 12 }
                            })}
                            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        SARIMA(p,d,q)(P,D,Q)s - Regular + Seasonal components
                      </p>
                    </>
                  )}

                  {selectedModel === 'holt_winters' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Trend Type</label>
                        <select
                          value={customParams.holt_winters.trend}
                          onChange={(e) => setCustomParams({
                            ...customParams,
                            holt_winters: { ...customParams.holt_winters, trend: e.target.value }
                          })}
                          className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="add">Additive</option>
                          <option value="mul">Multiplicative</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Seasonal Type</label>
                        <select
                          value={customParams.holt_winters.seasonal}
                          onChange={(e) => setCustomParams({
                            ...customParams,
                            holt_winters: { ...customParams.holt_winters, seasonal: e.target.value }
                          })}
                          className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="add">Additive</option>
                          <option value="mul">Multiplicative</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Seasonal Periods</label>
                        <input
                          type="number"
                          min="2"
                          max="365"
                          value={customParams.holt_winters.seasonal_periods}
                          onChange={(e) => setCustomParams({
                            ...customParams,
                            holt_winters: { ...customParams.holt_winters, seasonal_periods: parseInt(e.target.value) || 12 }
                          })}
                          className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        Additive: constant seasonality, Multiplicative: proportional seasonality
                      </p>
                    </>
                  )}

                  {selectedModel === 'prophet' && (
                    <>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={customParams.prophet.yearly_seasonality}
                            onChange={(e) => setCustomParams({
                              ...customParams,
                              prophet: { ...customParams.prophet, yearly_seasonality: e.target.checked }
                            })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">Yearly Seasonality</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={customParams.prophet.weekly_seasonality}
                            onChange={(e) => setCustomParams({
                              ...customParams,
                              prophet: { ...customParams.prophet, weekly_seasonality: e.target.checked }
                            })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">Weekly Seasonality</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={customParams.prophet.daily_seasonality}
                            onChange={(e) => setCustomParams({
                              ...customParams,
                              prophet: { ...customParams.prophet, daily_seasonality: e.target.checked }
                            })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">Daily Seasonality</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        Enable seasonalities based on your data frequency
                      </p>
                    </>
                  )}

                  {selectedModel === 'lstm' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Sequence Length</label>
                        <input
                          type="number"
                          min="10"
                          max="200"
                          value={customParams.lstm.sequence_length}
                          onChange={(e) => setCustomParams({
                            ...customParams,
                            lstm: { ...customParams.lstm, sequence_length: parseInt(e.target.value) || 60 }
                          })}
                          className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">LSTM Units</label>
                        <input
                          type="number"
                          min="10"
                          max="200"
                          value={customParams.lstm.lstm_units}
                          onChange={(e) => setCustomParams({
                            ...customParams,
                            lstm: { ...customParams.lstm, lstm_units: parseInt(e.target.value) || 50 }
                          })}
                          className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Dropout Rate</label>
                        <input
                          type="number"
                          min="0"
                          max="0.8"
                          step="0.1"
                          value={customParams.lstm.dropout_rate}
                          onChange={(e) => setCustomParams({
                            ...customParams,
                            lstm: { ...customParams.lstm, dropout_rate: parseFloat(e.target.value) || 0.2 }
                          })}
                          className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        Sequence: lookback window, Units: network size, Dropout: regularization
                      </p>
                    </>
                  )}

                  {selectedModel === 'moving_average' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Window Size</label>
                        <input
                          type="number"
                          min="2"
                          max="100"
                          value={customParams.moving_average.window}
                          onChange={(e) => setCustomParams({
                            ...customParams,
                            moving_average: { ...customParams.moving_average, window: parseInt(e.target.value) || 12 }
                          })}
                          className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        Number of periods to average for smoothing
                      </p>
                    </>
                  )}
                </div>
              )}

              <button
                onClick={runAnalysis}
                disabled={!backendConnected || !currentData || isAnalyzing}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  backendConnected && currentData && !isAnalyzing
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  '🚀 Run Analysis'
                )}
              </button>
            </div>

            {/* Model Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">ℹ️ Model Information</h3>
              <div className="space-y-3 text-sm text-gray-600">
                {selectedModel === 'arima' && (
                  <>
                    <p><strong>ARIMA</strong> - AutoRegressive Integrated Moving Average</p>
                    <p>Best for: Stationary time series, short-term forecasting</p>
                    <p>Parameters: AR(p), I(d), MA(q)</p>
                  </>
                )}
                {selectedModel === 'sarima' && (
                  <>
                    <p><strong>SARIMA</strong> - Seasonal ARIMA</p>
                    <p>Best for: Seasonal time series data</p>
                    <p>Parameters: ARIMA + seasonal components</p>
                  </>
                )}
                {selectedModel === 'holt_winters' && (
                  <>
                    <p><strong>Holt-Winters</strong> - Exponential Smoothing</p>
                    <p>Best for: Data with trend and seasonality</p>
                    <p>Parameters: α, β, γ smoothing parameters</p>
                  </>
                )}
                {selectedModel === 'prophet' && (
                  <>
                    <p><strong>Prophet</strong> - Facebook's forecasting tool</p>
                    <p>Best for: Daily data with strong seasonal patterns</p>
                    <p>Features: Holiday effects, trend changes</p>
                  </>
                )}
                {selectedModel === 'lstm' && (
                  <>
                    <p><strong>LSTM</strong> - Long Short-Term Memory</p>
                    <p>Best for: Complex patterns, long sequences</p>
                    <p>Parameters: Units, dropout, sequence length</p>
                  </>
                )}
                {selectedModel === 'moving_average' && (
                  <>
                    <p><strong>Moving Average</strong> - Simple smoothing</p>
                    <p>Best for: Noise reduction, trend identification</p>
                    <p>Parameters: Window size</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Middle Panel - Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">📈 Data Visualization</h3>
              
              {currentData ? (
                <div className="space-y-6">
                  {/* Original Data Plot */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 relative">
                    <button
                      onClick={() => setEnlargedChart('data')}
                      className="absolute top-2 right-2 z-10 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      🔍 Enlarge
                    </button>
                    <Plot
                      data={[
                        {
                          x: currentData.records.map((r: any) => r[currentData.time_column]),
                          y: currentData.records.map((r: any) => r[currentData.value_column]),
                          type: 'scatter',
                          mode: 'lines+markers',
                          marker: { color: '#3B82F6', size: 6 },
                          line: { color: '#3B82F6', width: 3 },
                          name: 'Actual Data',
                        },
                      ]}
                      layout={{
                        title: { 
                          text: 'Time Series Data',
                          font: { size: 20, weight: 'bold' }
                        },
                        autosize: true,
                        height: 600,
                        margin: { l: 70, r: 50, t: 90, b: 70 },
                        xaxis: { 
                          title: { text: currentData.time_column || 'Time', font: { size: 16 } },
                          showgrid: true,
                          gridcolor: '#e5e7eb',
                          gridwidth: 1
                        },
                        yaxis: { 
                          title: { text: currentData.value_column || 'Value', font: { size: 16 } },
                          showgrid: true,
                          gridcolor: '#e5e7eb',
                          gridwidth: 1
                        },
                        showlegend: true,
                        legend: { 
                          x: 0.02, 
                          y: 0.98,
                          bgcolor: 'rgba(255,255,255,0.95)',
                          bordercolor: '#d1d5db',
                          borderwidth: 2,
                          font: { size: 14 }
                        },
                        plot_bgcolor: '#fafafa',
                        paper_bgcolor: 'white',
                        hovermode: 'x unified',
                      }}
                      config={{ 
                        responsive: true, 
                        displayModeBar: true,
                        displaylogo: false,
                        toImageButtonOptions: {
                          format: 'png',
                          filename: 'time_series_data',
                          height: 1000,
                          width: 1600,
                          scale: 2
                        },
                        scrollZoom: true
                      }}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  {/* Forecast Plot */}
                  {analysisResult && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 relative">
                      {analysisResult.model_info && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm overflow-hidden">
                          <p className="font-semibold text-blue-800 mb-2">📊 Parameters Used:</p>
                          <div className="space-y-2 text-blue-700">
                            {Object.entries(analysisResult.model_info).map(([key, value]) => (
                              <div key={key} className="flex flex-col space-y-1">
                                <span className="font-medium text-xs uppercase">{key}:</span>
                                <div className="font-mono text-xs bg-white px-2 py-1 rounded border border-blue-200 break-all overflow-x-auto max-w-full">
                                  {JSON.stringify(value)}
                                </div>
                              </div>
                            ))}
                          </div>
                          {useCustomParams && (
                            <p className="text-xs text-blue-600 mt-2 pt-2 border-t border-blue-300">
                              ✓ Using custom parameters
                            </p>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => setEnlargedChart('forecast')}
                        className="absolute top-2 right-2 z-10 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        🔍 Enlarge
                      </button>
                      <Plot
                        data={[
                          {
                            x: currentData.records.map((r: any) => r[currentData.time_column]),
                            y: currentData.records.map((r: any) => r[currentData.value_column]),
                            type: 'scatter',
                            mode: 'lines+markers',
                            marker: { color: '#3B82F6', size: 5 },
                            line: { color: '#3B82F6', width: 2.5 },
                            name: 'Actual',
                          },
                          {
                            x: currentData.records.slice(-analysisResult.fitted_values?.length || 0).map((r: any) => r[currentData.time_column]),
                            y: analysisResult.fitted_values,
                            type: 'scatter',
                            mode: 'lines',
                            line: { color: '#10B981', width: 2.5, dash: 'dash' },
                            name: 'Fitted',
                          },
                          {
                            x: analysisResult.forecast_dates || [],
                            y: analysisResult.forecast,
                            type: 'scatter',
                            mode: 'lines+markers',
                            marker: { color: '#F59E0B', size: 8 },
                            line: { color: '#F59E0B', width: 4 },
                            name: 'Forecast',
                          },
                          {
                            x: analysisResult.forecast_dates || [],
                            y: analysisResult.forecast_upper,
                            type: 'scatter',
                            mode: 'lines',
                            line: { width: 0 },
                            showlegend: false,
                            hoverinfo: 'skip',
                          },
                          {
                            x: analysisResult.forecast_dates || [],
                            y: analysisResult.forecast_lower,
                            type: 'scatter',
                            mode: 'lines',
                            fill: 'tonexty',
                            fillcolor: 'rgba(245, 158, 11, 0.25)',
                            line: { width: 0 },
                            name: '95% CI',
                          },
                        ]}
                        layout={{
                          title: { 
                            text: `${selectedModel.toUpperCase()} Forecast Results - ${forecastPeriods} Periods Ahead`,
                            font: { size: 20, weight: 'bold' }
                          },
                          autosize: true,
                          height: 650,
                          margin: { l: 70, r: 50, t: 90, b: 70 },
                          xaxis: { 
                            title: { text: currentData.time_column || 'Time', font: { size: 16 } },
                            showgrid: true,
                            gridcolor: '#e5e7eb',
                            gridwidth: 1
                          },
                          yaxis: { 
                            title: { text: currentData.value_column || 'Value', font: { size: 16 } },
                            showgrid: true,
                            gridcolor: '#e5e7eb',
                            gridwidth: 1
                          },
                          showlegend: true,
                          legend: { 
                            x: 0.02, 
                            y: 0.98,
                            bgcolor: 'rgba(255,255,255,0.95)',
                            bordercolor: '#d1d5db',
                            borderwidth: 2,
                            font: { size: 14 }
                          },
                          plot_bgcolor: '#fafafa',
                          paper_bgcolor: 'white',
                          hovermode: 'x unified',
                        }}
                        config={{ 
                          responsive: true, 
                          displayModeBar: true,
                          displaylogo: false,
                          toImageButtonOptions: {
                            format: 'png',
                            filename: `${selectedModel}_forecast`,
                            height: 1200,
                            width: 1800,
                            scale: 2
                          },
                          scrollZoom: true
                        }}
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}
                  
                  {/* Stationarity Comparison Chart */}
                  {analysisResult && analysisResult.stationarity && analysisResult.stationarity.stationary_values && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 relative">
                      <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                        📊 Original vs Stationary Data Comparison
                      </div>
                      <Plot
                        data={[
                          {
                            y: analysisResult.stationarity.original_values,
                            type: 'scatter',
                            mode: 'lines',
                            line: { color: '#3B82F6', width: 2 },
                            name: 'Original Data',
                            yaxis: 'y1',
                          },
                          {
                            y: analysisResult.stationarity.stationary_values,
                            type: 'scatter',
                            mode: 'lines',
                            line: { color: '#10B981', width: 2 },
                            name: `Stationary (diff=${analysisResult.stationarity.num_differences})`,
                            yaxis: 'y2',
                          },
                        ]}
                        layout={{
                          title: { 
                            text: 'Stationarity Transformation',
                            font: { size: 18, weight: 'bold' }
                          },
                          autosize: true,
                          height: 400,
                          margin: { l: 60, r: 60, t: 70, b: 50 },
                          xaxis: { 
                            title: { text: 'Time Index', font: { size: 12 } },
                            showgrid: true,
                            gridcolor: '#e5e7eb'
                          },
                          yaxis: { 
                            title: { text: 'Original Values', font: { size: 12 } },
                            showgrid: true,
                            gridcolor: '#e5e7eb',
                            side: 'left',
                            tickfont: { color: '#3B82F6' }
                          },
                          yaxis2: {
                            title: { text: 'Differenced Values', font: { size: 12 } },
                            overlaying: 'y',
                            side: 'right',
                            showgrid: false,
                            tickfont: { color: '#10B981' }
                          },
                          showlegend: true,
                          legend: { 
                            x: 0.02, 
                            y: 0.98,
                            bgcolor: 'rgba(255,255,255,0.95)',
                            bordercolor: '#d1d5db',
                            borderwidth: 1,
                            font: { size: 11 }
                          },
                          plot_bgcolor: '#fafafa',
                          paper_bgcolor: 'white',
                        }}
                        config={{ 
                          responsive: true, 
                          displayModeBar: true,
                          displaylogo: false,
                          scrollZoom: true
                        }}
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📁</div>
                    <p className="text-lg text-gray-600 font-medium">Select a dataset to visualize</p>
                    <p className="text-sm text-gray-400 mt-2">Choose from sample datasets or upload your own</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">📋 Analysis Results</h3>
              
              {analysisResult ? (
                <div className="space-y-4">
                  {/* Forecast Explanation */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3">
                    <h4 className="font-semibold text-purple-900 mb-2 text-sm">💡 Understanding Your Forecast</h4>
                    <p className="text-xs text-purple-800 leading-relaxed">
                      {selectedModel === 'sarima' && 
                        "SARIMA forecasts may look linear at long horizons. This is CORRECT - seasonal patterns stabilize and the model shows underlying trend with widening confidence intervals (uncertainty increases)."
                      }
                      {selectedModel === 'arima' && 
                        "ARIMA captures trend and autocorrelation. Linear appearance indicates stable long-term direction detected in your data."
                      }
                      {(selectedModel === 'holt_winters' || selectedModel === 'holt-winters') && 
                        "Holt-Winters balances trend and seasonality. Forecast extends detected patterns into future periods."
                      }
                      {selectedModel === 'prophet' && 
                        "Prophet combines trend, multiple seasonalities, and can handle holidays for robust forecasting."
                      }
                      {selectedModel === 'lstm' && 
                        "LSTM learns complex non-linear patterns. Forecasts reflect deep temporal dependencies."
                      }
                      {selectedModel === 'moving_average' && 
                        "Moving Average smooths data and projects recent trends forward."
                      }
                    </p>
                  </div>
                  
                  {/* Stationarity Test Results */}
                  {analysisResult.stationarity && (
                    <div className={`border rounded-lg p-4 ${
                      analysisResult.stationarity.is_stationary 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        analysisResult.stationarity.is_stationary 
                          ? 'text-green-800' 
                          : 'text-yellow-800'
                      }`}>
                        📊 Stationarity Test (ADF)
                      </h4>
                      <div className={`text-xs space-y-1 ${
                        analysisResult.stationarity.is_stationary 
                          ? 'text-green-700' 
                          : 'text-yellow-700'
                      }`}>
                        <p className="font-semibold">
                          Status: {analysisResult.stationarity.original_test.interpretation}
                        </p>
                        <p>
                          <strong>P-value:</strong>{' '}
                          {analysisResult.stationarity.original_test.p_value?.toFixed(4) || 'N/A'}
                        </p>
                        <p>
                          <strong>ADF Statistic:</strong>{' '}
                          {analysisResult.stationarity.original_test.adf_statistic?.toFixed(4) || 'N/A'}
                        </p>
                        {!analysisResult.stationarity.is_stationary && analysisResult.stationarity.num_differences > 0 && (
                          <p className="mt-2 pt-2 border-t border-yellow-300">
                            ✓ Made stationary with {analysisResult.stationarity.num_differences} difference(s)
                          </p>
                        )}
                        <p className="text-xs italic mt-2">
                          {analysisResult.stationarity.is_stationary 
                            ? '✓ Data is ready for modeling' 
                            : '⚠ Non-stationary - models will handle differencing'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">✅ Analysis Complete</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Model:</strong> {selectedModel.toUpperCase()}</p>
                      <p><strong>Status:</strong> Success</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">📊 Model Performance</h4>
                    <div className="text-sm text-blue-700 space-y-2">
                      {analysisResult.metrics?.rmse && (
                        <div className="flex justify-between">
                          <span>RMSE:</span>
                          <span className="font-mono font-medium">{analysisResult.metrics.rmse.toFixed(4)}</span>
                        </div>
                      )}
                      {analysisResult.metrics?.mae && (
                        <div className="flex justify-between">
                          <span>MAE:</span>
                          <span className="font-mono font-medium">{analysisResult.metrics.mae.toFixed(4)}</span>
                        </div>
                      )}
                      {analysisResult.metrics?.mse && (
                        <div className="flex justify-between">
                          <span>MSE:</span>
                          <span className="font-mono font-medium">{analysisResult.metrics.mse.toFixed(4)}</span>
                        </div>
                      )}
                      {analysisResult.metrics?.mape && (
                        <div className="flex justify-between">
                          <span>MAPE:</span>
                          <span className="font-mono font-medium">{analysisResult.metrics.mape.toFixed(2)}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">� Forecast Info</h4>
                    <div className="text-sm text-purple-700 space-y-1">
                      <p><strong>Periods:</strong> {analysisResult.forecast?.length || 0}</p>
                      <p><strong>Confidence:</strong> 95%</p>
                      {analysisResult.forecast && analysisResult.forecast.length > 0 && (
                        <>
                          <p><strong>First:</strong> {analysisResult.forecast[0].toFixed(2)}</p>
                          <p><strong>Last:</strong> {analysisResult.forecast[analysisResult.forecast.length - 1].toFixed(2)}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button 
                      onClick={downloadResults}
                      className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm transition-colors border border-blue-200 font-medium text-blue-700"
                    >
                      💾 Download Results (JSON)
                    </button>
                    <button 
                      onClick={downloadCSV}
                      className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg text-sm transition-colors border border-green-200 font-medium text-green-700"
                    >
                      � Export Data (CSV)
                    </button>
                    <button 
                      onClick={generateReport}
                      className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm transition-colors border border-purple-200 font-medium text-purple-700"
                    >
                      📄 Generate Report (TXT)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-3xl mb-3">⏳</div>
                  <p className="text-gray-500 mb-2">No analysis results yet</p>
                  <p className="text-sm text-gray-400">Run an analysis to see results here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {enlargedChart && currentData && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-2xl font-bold">
                {enlargedChart === 'data' ? '📈 Time Series Data - Fullscreen' : `📊 ${selectedModel.toUpperCase()} Forecast - Fullscreen`}
              </h2>
              <button
                onClick={() => setEnlargedChart(null)}
                className="bg-white hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 bg-white rounded-lg p-4 overflow-auto">
              {enlargedChart === 'data' ? (
                <Plot
                  data={[
                    {
                      x: currentData.records.map((r: any) => r[currentData.time_column]),
                      y: currentData.records.map((r: any) => r[currentData.value_column]),
                      type: 'scatter',
                      mode: 'lines+markers',
                      marker: { color: '#3B82F6', size: 8 },
                      line: { color: '#3B82F6', width: 4 },
                      name: 'Actual Data',
                    },
                  ]}
                  layout={{
                    title: { 
                      text: 'Time Series Data - Fullscreen View',
                      font: { size: 26, weight: 'bold' }
                    },
                    autosize: true,
                    height: window.innerHeight - 180,
                    margin: { l: 80, r: 60, t: 100, b: 80 },
                    xaxis: { 
                      title: { text: currentData.time_column || 'Time', font: { size: 20 } },
                      showgrid: true,
                      gridcolor: '#e5e7eb',
                      gridwidth: 1,
                      tickfont: { size: 16 }
                    },
                    yaxis: { 
                      title: { text: currentData.value_column || 'Value', font: { size: 20 } },
                      showgrid: true,
                      gridcolor: '#e5e7eb',
                      gridwidth: 1,
                      tickfont: { size: 16 }
                    },
                    showlegend: true,
                    legend: { 
                      x: 0.02, 
                      y: 0.98,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      bordercolor: '#d1d5db',
                      borderwidth: 2,
                      font: { size: 18 }
                    },
                    plot_bgcolor: '#fafafa',
                    paper_bgcolor: 'white',
                    hovermode: 'x unified',
                  }}
                  config={{ 
                    responsive: true, 
                    displayModeBar: true,
                    displaylogo: false,
                    toImageButtonOptions: {
                      format: 'png',
                      filename: 'time_series_data_fullscreen',
                      height: 1200,
                      width: 2000,
                      scale: 2
                    },
                    scrollZoom: true
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                analysisResult && (
                  <Plot
                    data={[
                      {
                        x: currentData.records.map((r: any) => r[currentData.time_column]),
                        y: currentData.records.map((r: any) => r[currentData.value_column]),
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: '#3B82F6', size: 6 },
                        line: { color: '#3B82F6', width: 3 },
                        name: 'Actual',
                      },
                      {
                        x: currentData.records.slice(-analysisResult.fitted_values?.length || 0).map((r: any) => r[currentData.time_column]),
                        y: analysisResult.fitted_values,
                        type: 'scatter',
                        mode: 'lines',
                        line: { color: '#10B981', width: 3, dash: 'dash' },
                        name: 'Fitted',
                      },
                      {
                        x: analysisResult.forecast_dates || [],
                        y: analysisResult.forecast,
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: '#FF6B00', size: 12 },
                        line: { color: '#FF6B00', width: 6 },
                        name: 'Forecast',
                      },
                      {
                        x: analysisResult.forecast_dates || [],
                        y: analysisResult.forecast_upper,
                        type: 'scatter',
                        mode: 'lines',
                        line: { width: 0 },
                        showlegend: false,
                        hoverinfo: 'skip',
                      },
                      {
                        x: analysisResult.forecast_dates || [],
                        y: analysisResult.forecast_lower,
                        type: 'scatter',
                        mode: 'lines',
                        fill: 'tonexty',
                        fillcolor: 'rgba(255, 107, 0, 0.3)',
                        line: { width: 0 },
                        name: '95% CI',
                      },
                    ]}
                    layout={{
                      title: { 
                        text: `${selectedModel.toUpperCase()} Forecast - ${forecastPeriods} Periods Ahead (Fullscreen)`,
                        font: { size: 26, weight: 'bold' }
                      },
                      autosize: true,
                      height: window.innerHeight - 180,
                      margin: { l: 80, r: 60, t: 100, b: 80 },
                      xaxis: { 
                        title: { text: currentData.time_column || 'Time', font: { size: 20 } },
                        showgrid: true,
                        gridcolor: '#e5e7eb',
                        gridwidth: 1,
                        tickfont: { size: 16 }
                      },
                      yaxis: { 
                        title: { text: currentData.value_column || 'Value', font: { size: 20 } },
                        showgrid: true,
                        gridcolor: '#e5e7eb',
                        gridwidth: 1,
                        tickfont: { size: 16 }
                      },
                      showlegend: true,
                      legend: { 
                        x: 0.02, 
                        y: 0.98,
                        bgcolor: 'rgba(255,255,255,0.95)',
                        bordercolor: '#d1d5db',
                        borderwidth: 2,
                        font: { size: 18 }
                      },
                      plot_bgcolor: '#fafafa',
                      paper_bgcolor: 'white',
                      hovermode: 'x unified',
                    }}
                    config={{ 
                      responsive: true, 
                      displayModeBar: true,
                      displaylogo: false,
                      toImageButtonOptions: {
                        format: 'png',
                        filename: `${selectedModel}_forecast_fullscreen`,
                        height: 1400,
                        width: 2400,
                        scale: 2
                      },
                      scrollZoom: true
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                )
              )}
            </div>
            <p className="text-white text-center mt-4 text-lg">
              💡 Use mouse wheel to zoom, drag to pan, double-click to reset. Click toolbar buttons for more options.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaygroundPage;