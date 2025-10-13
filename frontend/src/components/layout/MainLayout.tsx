import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  BarChart3, 
  Settings, 
  Moon, 
  Sun, 
  Menu, 
  X,
  Home,
  Brain,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '../../App';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎯 ATSA Playground
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </a>
            <a href="/playground" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <BarChart3 className="w-4 h-4" />
              <span>Playground</span>
            </a>
            <a href="/learn" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Brain className="w-4 h-4" />
              <span>Learn</span>
            </a>
          </nav>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex pt-20">
        {/* Left Panel - Learning Modules */}
        <motion.div
          className={`${leftPanelCollapsed ? 'w-12' : 'w-80'} transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}
          initial={false}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {!leftPanelCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2"
              >
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Learn</h2>
              </motion.div>
            )}
            <button
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle left panel"
            >
              <Menu className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!leftPanelCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 space-y-4"
              >
                {/* Learning Categories */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Categories
                  </h3>
                  {['Basics', 'Modeling', 'Forecasting', 'Evaluation'].map((category) => (
                    <button
                      key={category}
                      className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{category}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {category === 'Basics' && 'Time series fundamentals'}
                        {category === 'Modeling' && 'ARIMA, Prophet, LSTM'}
                        {category === 'Forecasting' && 'Prediction techniques'}
                        {category === 'Evaluation' && 'Model metrics'}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Quick Access */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Quick Access
                  </h3>
                  {[
                    'What is Stationarity?',
                    'Understanding ACF/PACF',
                    'ARIMA Parameter Selection',
                    'Seasonal Decomposition'
                  ].map((topic) => (
                    <button
                      key={topic}
                      className="w-full text-left p-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Center Panel - Main Content */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>

        {/* Right Panel - Controls */}
        <motion.div
          className={`${rightPanelCollapsed ? 'w-12' : 'w-80'} transition-all duration-300 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col`}
          initial={false}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle right panel"
            >
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            {!rightPanelCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2"
              >
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Controls</h2>
              </motion.div>
            )}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!rightPanelCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 space-y-6"
              >
                {/* Model Selection */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Model Selection</h3>
                  <select className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>ARIMA</option>
                    <option>SARIMA</option>
                    <option>Holt-Winters</option>
                    <option>Prophet</option>
                    <option>LSTM</option>
                  </select>
                </div>

                {/* Parameters */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Parameters</h3>
                  
                  {/* ARIMA parameters */}
                  <div className="space-y-3">
                    {['p (AR)', 'd (Diff)', 'q (MA)'].map((param) => (
                      <div key={param}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {param}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          defaultValue="1"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>0</span>
                          <span>1</span>
                          <span>5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Forecast Settings */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Forecast Settings</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Forecast Periods
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      min="1"
                      max="365"
                      className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confidence Interval
                    </label>
                    <select className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                      <option value="0.80">80%</option>
                      <option value="0.90">90%</option>
                      <option value="0.95" selected>95%</option>
                      <option value="0.99">99%</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Fit Model
                  </button>
                  <button className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
                    Compare Models
                  </button>
                  <button className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                    Auto Select
                  </button>
                </div>

                {/* Metrics Display */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Model Metrics</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'MAE', value: '12.5' },
                      { name: 'RMSE', value: '18.7' },
                      { name: 'MAPE', value: '8.3%' },
                      { name: 'AIC', value: '245.1' }
                    ].map((metric) => (
                      <div key={metric.name} className="neu-card p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{metric.name}</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{metric.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MainLayout;