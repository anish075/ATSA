import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from statsmodels.tsa.stattools import adfuller, kpss
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import acf, pacf
from scipy import stats

class AnalysisService:
    """Service for time series analysis operations"""
    
    def __init__(self):
        pass
    
    def test_stationarity(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform stationarity tests (ADF and KPSS)"""
        
        # Extract time series data
        records = data.get('records', [])
        value_column = data.get('value_column')
        
        if not records or not value_column:
            raise ValueError("Invalid data format")
        
        df = pd.DataFrame(records)
        series = df[value_column].dropna()
        
        if len(series) < 10:
            raise ValueError("Insufficient data points for stationarity testing")
        
        # ADF Test (H0: non-stationary)
        adf_result = adfuller(series, autolag='AIC')
        
        # KPSS Test (H0: stationary)
        kpss_result = kpss(series, regression='c')
        
        # Determine stationarity
        adf_stationary = adf_result[1] <= 0.05  # p-value < 0.05 means reject H0 (stationary)
        kpss_stationary = kpss_result[1] > 0.05  # p-value > 0.05 means accept H0 (stationary)
        
        return {
            'adf_test': {
                'statistic': float(adf_result[0]),
                'pvalue': float(adf_result[1]),
                'critical_values': {str(k): float(v) for k, v in adf_result[4].items()},
                'is_stationary': adf_stationary
            },
            'kpss_test': {
                'statistic': float(kpss_result[0]),
                'pvalue': float(kpss_result[1]),
                'critical_values': {str(k): float(v) for k, v in kpss_result[3].items()},
                'is_stationary': kpss_stationary
            },
            'conclusion': {
                'is_stationary': adf_stationary and kpss_stationary,
                'recommendation': self._get_stationarity_recommendation(adf_stationary, kpss_stationary)
            }
        }
    
    def _get_stationarity_recommendation(self, adf_stat: bool, kpss_stat: bool) -> str:
        """Get recommendation based on stationarity tests"""
        if adf_stat and kpss_stat:
            return "Series appears to be stationary. Proceed with modeling."
        elif not adf_stat and not kpss_stat:
            return "Series is non-stationary. Consider differencing or detrending."
        elif adf_stat and not kpss_stat:
            return "Mixed results. ADF suggests stationary, KPSS suggests non-stationary. Investigate further."
        else:
            return "Mixed results. Consider additional testing or visual inspection."
    
    def test_seasonality(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Test for seasonality in the data"""
        
        records = data.get('records', [])
        value_column = data.get('value_column')
        
        df = pd.DataFrame(records)
        series = df[value_column].dropna()
        
        if len(series) < 24:  # Need at least 2 seasons for meaningful testing
            return {
                'has_seasonality': False,
                'reason': 'Insufficient data for seasonality testing (minimum 24 observations required)'
            }
        
        # Try different seasonal periods
        seasonal_periods = [4, 12, 24, 52]  # quarterly, monthly, bi-monthly, weekly
        results = {}
        
        for period in seasonal_periods:
            if len(series) >= 2 * period:
                try:
                    # Simple seasonality test using decomposition
                    decomposition = seasonal_decompose(series, model='additive', period=period, extrapolate_trend='freq')
                    seasonal_component = decomposition.seasonal
                    
                    # Calculate seasonal strength
                    seasonal_var = np.var(seasonal_component.dropna())
                    residual_var = np.var(decomposition.resid.dropna())
                    
                    if residual_var > 0:
                        seasonal_strength = seasonal_var / (seasonal_var + residual_var)
                    else:
                        seasonal_strength = 0
                    
                    results[f'period_{period}'] = {
                        'seasonal_strength': float(seasonal_strength),
                        'significant': seasonal_strength > 0.1
                    }
                except:
                    continue
        
        # Determine best seasonal period
        best_period = None
        best_strength = 0
        
        for period, result in results.items():
            if result['seasonal_strength'] > best_strength:
                best_strength = result['seasonal_strength']
                best_period = int(period.split('_')[1])
        
        return {
            'has_seasonality': best_strength > 0.1,
            'seasonal_period': best_period,
            'seasonal_strength': best_strength,
            'all_periods': results
        }
    
    def decompose_time_series(self, data: Dict[str, Any], method: str = 'additive', period: int = None) -> Dict[str, Any]:
        """Decompose time series into trend, seasonal, and residual components"""
        
        records = data.get('records', [])
        value_column = data.get('value_column')
        time_column = data.get('time_column')
        
        df = pd.DataFrame(records)
        
        if time_column:
            df[time_column] = pd.to_datetime(df[time_column])
            df = df.set_index(time_column).sort_index()
        
        series = df[value_column].dropna()
        
        # Auto-detect period if not provided
        if period is None:
            if len(series) >= 24:
                period = 12  # Monthly data
            elif len(series) >= 8:
                period = 4   # Quarterly data
            else:
                raise ValueError("Insufficient data for decomposition")
        
        if len(series) < 2 * period:
            raise ValueError(f"Need at least {2 * period} observations for period {period}")
        
        try:
            decomposition = seasonal_decompose(series, model=method, period=period, extrapolate_trend='freq')
            
            return {
                'trend': decomposition.trend.fillna(method='bfill').fillna(method='ffill').tolist(),
                'seasonal': decomposition.seasonal.tolist(),
                'residual': decomposition.resid.fillna(0).tolist(),
                'original': series.tolist(),
                'dates': series.index.strftime('%Y-%m-%d').tolist() if hasattr(series.index, 'strftime') else list(range(len(series))),
                'method': method,
                'period': period
            }
        except Exception as e:
            raise ValueError(f"Decomposition failed: {str(e)}")
    
    def calculate_acf_pacf(self, data: Dict[str, Any], lags: int = 40) -> Dict[str, Any]:
        """Calculate ACF and PACF values"""
        
        records = data.get('records', [])
        value_column = data.get('value_column')
        
        df = pd.DataFrame(records)
        series = df[value_column].dropna()
        
        if len(series) < 10:
            raise ValueError("Insufficient data for ACF/PACF calculation")
        
        # Limit lags to series length
        max_lags = min(lags, len(series) - 1)
        
        try:
            # Calculate ACF
            acf_values, acf_confint = acf(series, nlags=max_lags, alpha=0.05)
            
            # Calculate PACF
            pacf_values, pacf_confint = pacf(series, nlags=max_lags, alpha=0.05)
            
            return {
                'acf': {
                    'values': acf_values.tolist(),
                    'confidence_intervals': acf_confint.tolist(),
                    'lags': list(range(len(acf_values)))
                },
                'pacf': {
                    'values': pacf_values.tolist(),
                    'confidence_intervals': pacf_confint.tolist(),
                    'lags': list(range(len(pacf_values)))
                }
            }
        except Exception as e:
            raise ValueError(f"ACF/PACF calculation failed: {str(e)}")
    
    def calculate_rolling_stats(self, data: Dict[str, Any], window: int = 12) -> Dict[str, Any]:
        """Calculate rolling mean and standard deviation"""
        
        records = data.get('records', [])
        value_column = data.get('value_column')
        time_column = data.get('time_column')
        
        df = pd.DataFrame(records)
        
        if time_column:
            df[time_column] = pd.to_datetime(df[time_column])
            df = df.set_index(time_column).sort_index()
        
        series = df[value_column].dropna()
        
        if len(series) < window:
            raise ValueError(f"Insufficient data for window size {window}")
        
        rolling_mean = series.rolling(window=window).mean()
        rolling_std = series.rolling(window=window).std()
        
        return {
            'original': series.tolist(),
            'rolling_mean': rolling_mean.tolist(),
            'rolling_std': rolling_std.tolist(),
            'dates': series.index.strftime('%Y-%m-%d').tolist() if hasattr(series.index, 'strftime') else list(range(len(series))),
            'window': window
        }
    
    def perform_full_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive time series analysis"""
        
        try:
            # Basic info
            records = data.get('records', [])
            value_column = data.get('value_column')
            
            df = pd.DataFrame(records)
            series = df[value_column].dropna()
            
            analysis_result = {
                'data_summary': {
                    'length': len(series),
                    'mean': float(series.mean()),
                    'std': float(series.std()),
                    'min': float(series.min()),
                    'max': float(series.max()),
                    'missing_values': int(df[value_column].isnull().sum())
                }
            }
            
            # Stationarity test
            try:
                analysis_result['stationarity'] = self.test_stationarity(data)
            except Exception as e:
                analysis_result['stationarity'] = {'error': str(e)}
            
            # Seasonality test
            try:
                analysis_result['seasonality'] = self.test_seasonality(data)
            except Exception as e:
                analysis_result['seasonality'] = {'error': str(e)}
            
            # ACF/PACF
            try:
                analysis_result['acf_pacf'] = self.calculate_acf_pacf(data, lags=20)
            except Exception as e:
                analysis_result['acf_pacf'] = {'error': str(e)}
            
            # Rolling statistics
            try:
                analysis_result['rolling_stats'] = self.calculate_rolling_stats(data, window=min(12, len(series)//4))
            except Exception as e:
                analysis_result['rolling_stats'] = {'error': str(e)}
            
            return analysis_result
            
        except Exception as e:
            raise ValueError(f"Full analysis failed: {str(e)}")