# 🚀 Quick Start Guide for ATSA Playground

Follow these steps to get the ATSA Playground up and running on your system.

## Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git** (optional, for cloning)

## Automated Setup (Windows)

1. **Run the setup script:**
   ```bash
   setup.bat
   ```

2. **Start the servers:**
   
   **Backend (Terminal 1):**
   ```bash
   cd backend
   python main.py
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Manual Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   
   **Windows:**
   ```bash
   venv\Scripts\activate
   ```
   
   **macOS/Linux:**
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the backend server:**
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8000`
   API documentation at `http://localhost:8000/api/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

## Features Available

### ✅ Currently Implemented

1. **Project Structure**
   - Full-stack architecture with React + FastAPI
   - Modern UI with Tailwind CSS and neumorphic design
   - Dark/light theme support

2. **User Interface**
   - Responsive three-panel layout
   - Interactive navigation
   - Beautiful landing page with feature overview

3. **Data Handling**
   - File upload functionality (CSV/Excel)
   - Sample datasets (Stock prices, Air quality, etc.)
   - Data validation and preprocessing

4. **Time Series Models**
   - ARIMA/SARIMA implementation
   - Holt-Winters Exponential Smoothing
   - Prophet integration (optional)
   - Model parameter configuration

5. **Analysis Features**
   - Stationarity testing (ADF, KPSS)
   - Seasonality detection
   - ACF/PACF calculation
   - Time series decomposition
   - Rolling statistics

6. **Learning Modules**
   - Interactive educational content
   - Step-by-step tutorials
   - Concept explanations with examples

### 🚧 In Development

7. **Advanced Visualizations**
   - Interactive Plotly charts with zoom/pan
   - Decomposition plots
   - ACF/PACF visualizations
   - Real-time model comparison

8. **Model Comparison**
   - Side-by-side model evaluation
   - Animated metrics display
   - Performance ranking

9. **Export Features**
   - CSV forecast export
   - PNG chart export
   - PDF report generation

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Backend (8000): Change port in `backend/main.py`
   - Frontend (3000): Change port in `frontend/vite.config.ts`

2. **Python Package Installation Fails**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt --no-cache-dir
   ```

3. **Node.js Dependencies Issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **CORS Issues**
   - Ensure backend is running on port 8000
   - Check CORS settings in `backend/main.py`

### Performance Notes

- **Initial Load**: First model fitting might take 30-60 seconds
- **Data Size**: Recommended maximum 10,000 data points for optimal performance
- **Browser**: Chrome/Firefox recommended for best experience

## Development Commands

### Backend
```bash
# Run with auto-reload
python main.py

# Run tests (when available)
pytest

# Format code
black .
isort .
```

### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## API Documentation

Once the backend is running, visit:
- **Interactive Docs**: `http://localhost:8000/api/docs`
- **ReDoc**: `http://localhost:8000/api/redoc`

## Next Steps

1. **Explore Sample Data**: Try the built-in stock prices and air quality datasets
2. **Upload Your Data**: Use CSV/Excel files with date and numeric columns
3. **Learn Concepts**: Visit the Learning section for interactive tutorials
4. **Experiment with Models**: Compare different forecasting approaches
5. **Customize Parameters**: Adjust ARIMA orders and forecast periods

## Support

- Check the console for detailed error messages
- Review the API documentation for endpoint specifications
- Ensure all dependencies are installed correctly

Happy forecasting! 🎯📈