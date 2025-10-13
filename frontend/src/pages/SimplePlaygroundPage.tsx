import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const PlaygroundPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('arima');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [sampleDatasets, setSampleDatasets] = useState<any[]>([]);
  const [currentData, setCurrentData] = useState<any>(null);

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
        forecast_periods: 12,
        confidence_interval: 0.95
      };
      
      console.log('Calling API.Models.fitModel with:', currentData, modelConfig);
      const result = await API.Models.fitModel(currentData, modelConfig);
      console.log('Analysis result:', result);
      
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please check the console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getModelParameters = (modelType: string) => {
    switch (modelType) {
      case 'arima':
        return { order: [1, 1, 1] };
      case 'sarima':
        return { order: [1, 1, 1], seasonal_order: [1, 1, 1, 12] };
      case 'holt_winters':
        return { trend: 'add', seasonal: 'add', seasonal_periods: 12 };
      case 'prophet':
        return { yearly_seasonality: true, weekly_seasonality: true };
      case 'lstm':
        return { sequence_length: 60, lstm_units: 50, dropout_rate: 0.2 };
      case 'moving_average':
        return { window: 12 };
      default:
        return {};
    }
  };

  const loadSampleData = async (datasetName: string) => {
    console.log('loadSampleData called with:', datasetName);
    if (datasetName) {
      const data = await API.Data.loadSampleDataset(datasetName);
      console.log('Loaded data:', data);
      setCurrentData(data);
    } else {
      setCurrentData(null);
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">📈 Data Visualization</h3>
              
              {currentData ? (
                <div className="space-y-4">
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">📊</div>
                      <p className="text-gray-500">Time series plot will appear here</p>
                      <p className="text-sm text-gray-400 mt-1">Data loaded: {currentData?.length || 0} points</p>
                    </div>
                  </div>
                  
                  {analysisResult && (
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                      <div className="text-center">
                        <div className="text-3xl mb-2">🔮</div>
                        <p className="text-gray-500">Forecast visualization</p>
                        <p className="text-sm text-gray-400 mt-1">Model: {selectedModel.toUpperCase()}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <div className="text-3xl mb-2">📁</div>
                    <p className="text-gray-500">Select a dataset to visualize</p>
                    <p className="text-sm text-gray-400 mt-1">Choose from sample datasets or upload your own</p>
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
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">✅ Analysis Complete</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Model:</strong> {selectedModel.toUpperCase()}</p>
                      <p><strong>Status:</strong> {analysisResult.status || 'Success'}</p>
                      <p><strong>RMSE:</strong> {analysisResult.metrics?.rmse?.toFixed(4) || 'N/A'}</p>
                      <p><strong>MAE:</strong> {analysisResult.metrics?.mae?.toFixed(4) || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">📊 Model Statistics</h4>
                    <div className="text-sm text-blue-700">
                      <p>Training completed successfully</p>
                      <p>Forecast horizon: 12 periods</p>
                      <p>Confidence intervals: 95%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                      💾 Download Results
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                      🖼️ Export Chart
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                      📄 Generate Report
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
    </div>
  );
};

export default PlaygroundPage;