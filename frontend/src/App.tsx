import React, { createContext, useContext, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/SimpleHomePage';
import PlaygroundPage from './pages/SimplePlaygroundPage';
import LearningPage from './pages/SimpleLearningPage';
import TestPage from './pages/TestPage';
import { ThemeContextType } from './types/index';

// Theme Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/learn" element={<LearningPage />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;