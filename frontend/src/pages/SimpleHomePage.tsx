import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎯 ATSA Playground
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Interactive Applied Time Series Analysis Learning Platform
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
            Master time series analysis through beautiful visualizations, interactive models, and hands-on learning. 
            From ARIMA to Prophet, explore forecasting with real-world datasets.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/playground" 
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              🚀 Start Playground
            </Link>
            <Link 
              to="/learn" 
              className="bg-gray-100 text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors"
            >
              📚 Learn Concepts
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why ATSA Playground?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Interactive Visualizations</h3>
              <p className="text-gray-600">
                Beautiful, responsive charts with Plotly.js. Zoom, pan, and explore your time series data with ease.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Multiple Models</h3>
              <p className="text-gray-600">
                ARIMA, SARIMA, Holt-Winters, Prophet, and LSTM models. Compare performance with real-time metrics.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Learn by Doing</h3>
              <p className="text-gray-600">
                Progressive learning modules with animations, mathematical explanations, and practical examples.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Master Time Series?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students and professionals learning ATSA with interactive tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/playground" 
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              🎯 Start Learning Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-white text-center">
        <p>&copy; 2024 ATSA Playground. Made with ❤️ for time series enthusiasts.</p>
      </footer>
    </div>
  );
};

export default HomePage;