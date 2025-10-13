import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  BookOpen, 
  TrendingUp, 
  Zap, 
  Users, 
  Award,
  ArrowRight,
  PlayCircle,
  Star,
  ChevronDown
} from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Background Animation */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
          </div>

          <div className="relative text-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                🎯 ATSA Playground
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Learn, Explore, and Forecast Time Series Data with Beautiful Visualizations and Interactive Models
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link
                to="/playground"
                className="group neu-button bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-3 hover:shadow-xl hover:scale-105 transition-all"
              >
                <PlayCircle className="w-6 h-6" />
                <span>Start Playing</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/learn"
                className="group neu-button border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-3 hover:border-blue-500 hover:text-blue-600 transition-all"
              >
                <BookOpen className="w-6 h-6" />
                <span>Learn Concepts</span>
              </Link>
            </motion.div>

            {/* Feature Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="relative max-w-5xl mx-auto"
            >
              <div className="neu-card p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Interactive Charts</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Zoom, pan, and explore your data with beautiful, responsive visualizations
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Models</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      ARIMA, Prophet, LSTM and more with real-time parameter tuning
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Learn Visually</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Animated explanations of complex time series concepts
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-gray-400" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Master Time Series
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From basic concepts to advanced forecasting, our interactive platform guides you through every step
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Data Upload & Analysis",
                description: "Upload CSV/Excel files or use our sample datasets. Automatic preprocessing and validation included."
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Interactive Visualizations",
                description: "Explore your data with zoom, pan, and hover interactions. See decomposition in real-time."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Multiple Models",
                description: "ARIMA, SARIMA, Holt-Winters, Prophet, LSTM - all with parameter tuning and comparison."
              },
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: "Learning Modules",
                description: "Step-by-step tutorials with animations explaining stationarity, ACF/PACF, and more."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Model Comparison",
                description: "Compare multiple models side-by-side with animated metrics and performance indicators."
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Export & Share",
                description: "Export forecasts as CSV, charts as PNG, and generate comprehensive PDF reports."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="neu-card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials/Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Students & Professionals
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Join thousands learning time series analysis through hands-on experimentation
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Students Learning" },
              { number: "25+", label: "Interactive Lessons" },
              { number: "8", label: "Model Types" },
              { number: "4.9", label: "Average Rating", icon: <Star className="w-5 h-5 text-yellow-500" /> }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="neu-card p-6"
              >
                <div className="flex items-center justify-center mb-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.number}
                  </span>
                  {stat.icon}
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Master Time Series Analysis?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start your journey with interactive learning and hands-on experimentation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/playground"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
              >
                <PlayCircle className="w-6 h-6" />
                <span>Start Playing Now</span>
              </Link>
              <Link
                to="/learn"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-6 h-6" />
                <span>Explore Learning</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 dark:bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ATSA Playground</span>
          </div>
          <p className="text-gray-400 mb-6">
            Interactive Applied Time Series Analysis Learning Platform
          </p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-gray-500 text-sm mt-6">
            © 2024 ATSA Playground. Made with ❤️ for time series enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;