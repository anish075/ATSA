import React from 'react';
import { Link } from 'react-router-dom';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">🎯 ATSA Playground</h1>
        <p className="text-xl text-gray-600 mb-8">
          Applied Time Series Analysis Interactive Learning Platform
        </p>
        
        <div className="space-y-4 mb-8">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ React is working correctly
          </div>
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            🎨 Tailwind CSS is processing styles
          </div>
          <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded">
            🚀 Development server is running
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/playground" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🎯 Go to Playground
          </Link>
          <Link 
            to="/learn" 
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            📚 Go to Learning
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          If you see this styled page, everything is working correctly!
        </div>
      </div>
    </div>
  );
};

export default TestPage;