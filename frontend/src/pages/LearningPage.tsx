import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  ChevronRight, 
  Clock, 
  Star,
  CheckCircle,
  Lock,
  TrendingUp,
  Activity,
  BarChart3,
  Brain,
  Zap
} from 'lucide-react';

interface LearningModule {
  id: string;
  title: string;
  category: 'basics' | 'modeling' | 'forecasting' | 'evaluation';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  completed: boolean;
  locked: boolean;
  content: {
    explanation: string;
    keyPoints: string[];
    mathematicalFormula?: string;
    practicalExample: string;
  };
}

const LearningPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);

  const learningModules: LearningModule[] = [
    {
      id: 'ts-basics',
      title: 'What is Time Series?',
      category: 'basics',
      description: 'Introduction to time series data and its components',
      difficulty: 'beginner',
      estimatedTime: 10,
      completed: true,
      locked: false,
      content: {
        explanation: 'A time series is a sequence of observations recorded at regular time intervals. Understanding time series data is fundamental to forecasting future values based on historical patterns.',
        keyPoints: [
          'Time series data has temporal ordering',
          'Common components: trend, seasonality, cyclical patterns',
          'Observations are typically correlated with past values',
          'Used in finance, weather, economics, and many other fields'
        ],
        practicalExample: 'Stock prices, temperature readings, and sales data are all examples of time series.'
      }
    },
    {
      id: 'stationarity',
      title: 'Understanding Stationarity',
      category: 'basics',
      description: 'Learn about stationary and non-stationary time series',
      difficulty: 'intermediate',
      estimatedTime: 15,
      completed: true,
      locked: false,
      content: {
        explanation: 'Stationarity is a crucial concept in time series analysis. A stationary series has constant mean, variance, and autocorrelation structure over time.',
        keyPoints: [
          'Constant mean over time',
          'Constant variance over time',
          'Covariance depends only on lag, not time',
          'Most forecasting methods assume stationarity'
        ],
        mathematicalFormula: 'E[X_t] = μ (constant), Var[X_t] = σ² (constant)',
        practicalExample: 'Stock returns are often closer to stationary than stock prices themselves.'
      }
    },
    {
      id: 'acf-pacf',
      title: 'ACF and PACF Analysis',
      category: 'basics',
      description: 'Autocorrelation and Partial Autocorrelation Functions',
      difficulty: 'intermediate',
      estimatedTime: 20,
      completed: false,
      locked: false,
      content: {
        explanation: 'ACF and PACF help identify patterns in time series data and determine appropriate model parameters for ARIMA models.',
        keyPoints: [
          'ACF measures correlation between observations at different lags',
          'PACF measures direct correlation after removing intermediate effects',
          'Used to identify AR and MA components',
          'Critical for ARIMA model specification'
        ],
        mathematicalFormula: 'ACF(k) = Corr(X_t, X_{t-k})',
        practicalExample: 'In AR(1) process, PACF cuts off after lag 1, while ACF decays exponentially.'
      }
    },
    {
      id: 'arima-intro',
      title: 'Introduction to ARIMA',
      category: 'modeling',
      description: 'AutoRegressive Integrated Moving Average models',
      difficulty: 'intermediate',
      estimatedTime: 25,
      completed: false,
      locked: false,
      content: {
        explanation: 'ARIMA models combine autoregressive (AR), differencing (I), and moving average (MA) components to model and forecast time series data.',
        keyPoints: [
          'AR(p): Uses p past values to predict current value',
          'I(d): Differencing d times to achieve stationarity',
          'MA(q): Uses q past forecast errors',
          'ARIMA(p,d,q) notation specifies model order'
        ],
        mathematicalFormula: '(1-φ₁L-...-φₚLᵖ)(1-L)ᵈXₜ = (1+θ₁L+...+θ₇Lᵍ)εₜ',
        practicalExample: 'ARIMA(2,1,1) uses 2 lagged values, 1 difference, and 1 lagged error term.'
      }
    },
    {
      id: 'seasonal-arima',
      title: 'Seasonal ARIMA (SARIMA)',
      category: 'modeling',
      description: 'Handling seasonality in ARIMA models',
      difficulty: 'advanced',
      estimatedTime: 30,
      completed: false,
      locked: false,
      content: {
        explanation: 'SARIMA extends ARIMA to handle seasonal patterns by adding seasonal AR, I, and MA terms with seasonal lags.',
        keyPoints: [
          'Adds seasonal components: P, D, Q',
          'Seasonal period (s) typically 12 for monthly, 4 for quarterly',
          'Notation: ARIMA(p,d,q)(P,D,Q)s',
          'Captures both non-seasonal and seasonal patterns'
        ],
        mathematicalFormula: 'ARIMA(p,d,q)(P,D,Q)ₛ model equation involves both regular and seasonal operators',
        practicalExample: 'Monthly sales data might use ARIMA(1,1,1)(1,1,1)₁₂ to capture yearly seasonal patterns.'
      }
    },
    {
      id: 'prophet-model',
      title: 'Facebook Prophet',
      category: 'modeling',
      description: 'Additive model for time series with strong seasonal effects',
      difficulty: 'intermediate',
      estimatedTime: 20,
      completed: false,
      locked: true,
      content: {
        explanation: 'Prophet decomposes time series into trend, seasonal, and holiday components using an additive model that is robust to missing data and outliers.',
        keyPoints: [
          'Additive model: y(t) = g(t) + s(t) + h(t) + εₜ',
          'Flexible trend modeling with changepoints',
          'Multiple seasonalities (yearly, weekly, daily)',
          'Holiday effects and external regressors'
        ],
        practicalExample: 'Excellent for business metrics with strong seasonal patterns and holiday effects.'
      }
    },
    {
      id: 'forecast-evaluation',
      title: 'Forecast Evaluation Metrics',
      category: 'evaluation',
      description: 'How to measure forecast accuracy',
      difficulty: 'beginner',
      estimatedTime: 15,
      completed: false,
      locked: true,
      content: {
        explanation: 'Evaluating forecast accuracy is crucial for model selection and improvement. Different metrics emphasize different aspects of forecast quality.',
        keyPoints: [
          'MAE: Mean Absolute Error - average absolute differences',
          'RMSE: Root Mean Square Error - penalizes large errors more',
          'MAPE: Mean Absolute Percentage Error - relative accuracy',
          'AIC/BIC: Information criteria for model selection'
        ],
        mathematicalFormula: 'MAE = (1/n)Σ|yₜ - ŷₜ|, RMSE = √[(1/n)Σ(yₜ - ŷₜ)²]',
        practicalExample: 'Use MAPE when you need percentage-based accuracy, RMSE when large errors are costly.'
      }
    }
  ];

  const categories = [
    { key: 'all', label: 'All Topics', icon: <BookOpen className="w-5 h-5" /> },
    { key: 'basics', label: 'Basics', icon: <TrendingUp className="w-5 h-5" /> },
    { key: 'modeling', label: 'Modeling', icon: <BarChart3 className="w-5 h-5" /> },
    { key: 'forecasting', label: 'Forecasting', icon: <Activity className="w-5 h-5" /> },
    { key: 'evaluation', label: 'Evaluation', icon: <Star className="w-5 h-5" /> }
  ];

  const filteredModules = selectedCategory === 'all' 
    ? learningModules 
    : learningModules.filter(module => module.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="h-full flex">
      {/* Module List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto custom-scrollbar">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Learn Time Series Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Interactive lessons with animated explanations
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category.icon}
                <span className="font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Module List */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Modules
          </h3>
          {filteredModules.map((module) => (
            <motion.button
              key={module.id}
              onClick={() => !module.locked && setSelectedModule(module)}
              disabled={module.locked}
              whileHover={!module.locked ? { scale: 1.02 } : {}}
              whileTap={!module.locked ? { scale: 0.98 } : {}}
              className={`w-full text-left p-4 rounded-xl transition-all ${
                module.locked
                  ? 'bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-60'
                  : 'neu-card hover:shadow-lg cursor-pointer'
              } ${selectedModule?.id === module.id ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {module.locked ? (
                    <Lock className="w-4 h-4 text-gray-400" />
                  ) : module.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-blue-500" />
                  )}
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {module.title}
                  </h4>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {module.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(module.difficulty)}`}>
                    {module.difficulty}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{module.estimatedTime}m</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {selectedModule ? (
            <motion.div
              key={selectedModule.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <div className="neu-card p-8 h-full overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedModule.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className={`px-2 py-1 font-medium rounded ${getDifficultyColor(selectedModule.difficulty)}`}>
                        {selectedModule.difficulty}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{selectedModule.estimatedTime} minutes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Play className="w-4 h-4" />
                      <span>Start Interactive</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-8">
                  {/* Explanation */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <span>Concept Explanation</span>
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                      {selectedModule.content.explanation}
                    </p>
                  </section>

                  {/* Key Points */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <span>Key Points</span>
                    </h2>
                    <ul className="space-y-3">
                      {selectedModule.content.keyPoints.map((point, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-3"
                        >
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </section>

                  {/* Mathematical Formula */}
                  {selectedModule.content.mathematicalFormula && (
                    <section>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Mathematical Formula
                      </h2>
                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border-l-4 border-blue-500">
                        <code className="text-lg text-gray-800 dark:text-gray-200 font-mono">
                          {selectedModule.content.mathematicalFormula}
                        </code>
                      </div>
                    </section>
                  )}

                  {/* Practical Example */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Practical Example
                    </h2>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedModule.content.practicalExample}
                      </p>
                    </div>
                  </section>

                  {/* Interactive Section Placeholder */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Interactive Visualization
                    </h2>
                    <div className="neu-card p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Interactive Animation Coming Soon!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        This section will feature animated visualizations to help you understand {selectedModule.title.toLowerCase()}.
                      </p>
                      <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                        Try in Playground
                      </button>
                    </div>
                  </section>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    <span>Previous Module</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Complete</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <span>Next Module</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Time Series Learning!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-md">
                Select a module from the left panel to start learning about time series analysis with interactive lessons and visual explanations.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LearningPage;