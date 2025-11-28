import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// CRA में env variable ऐसे use करो
const API_BASE = process.env.REACT_APP_API_BASE;

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState('light');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch search history on mount
  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/history`);
      setSearchHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 0) {
      try {
        const response = await axios.get(`${API_BASE}/cities/search?q=${value}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const fetchWeather = async (city) => {
    setLoading(true);
    setError('');
    
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(`${API_BASE}/weather/${city}`),
        axios.get(`${API_BASE}/forecast/${city}`)
      ]);
      
      setCurrentWeather(weatherRes.data);
      setForecastData(forecastRes.data);
      setSuggestions([]);
      setSearchQuery('');
      fetchSearchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Abe Lowde Sahi City Select Kar Na...');
      setCurrentWeather(null);
      setForecastData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (city) => {
    if (city.trim()) {
      fetchWeather(city.trim());
    }
  };

  const clearHistory = async () => {
    try {
      await axios.delete(`${API_BASE}/history`);
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const goHome = () => {
    setCurrentWeather(null);
    setForecastData([]);
    setError('');
    setSearchQuery('');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getWeatherIcon = (condition) => {
    const main = condition?.toLowerCase() || '';
    if (main.includes('rain')) return '🌧️';
    if (main.includes('cloud')) return '☁️';
    if (main.includes('clear')) return '☀️';
    if (main.includes('snow')) return '❄️';
    if (main.includes('thunder')) return '⛈️';
    if (main.includes('mist') || main.includes('fog')) return '🌫️';
    return '🌤️';
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 17) return '☀️ Good Afternoon';
    if (hour < 21) return '🌆 Good Evening';
    return '🌙 Good Night';
  };

  return (
    <div className={`app-container ${theme}`}>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand" onClick={goHome}>
          <span className="brand-icon">🌦️</span>
          <span className="brand-text">Sahil Ibrahim</span>
        </div>
        
        <div className="nav-actions">
          <div className="live-time">
            <span className="time-icon">🕐</span>
            <span>{currentTime.toLocaleTimeString('en-IN')}</span>
          </div>
          
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          <button className="home-btn" onClick={goHome}>
            <span className="btn-icon">🏠</span>
            <span className="btn-text">Home</span>
          </button>
          
          <button 
            className={`history-btn ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
          >
            <span className="btn-icon">📜</span>
            <span className="btn-text">History</span>
            {searchHistory.length > 0 && (
              <span className="badge">{searchHistory.length}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      {!currentWeather && (
        <header className="hero-header">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">{getGreeting()}</span>
            </h1>
            <p className="hero-subtitle">
              Discover weather conditions in your city
            </p>
            <div className="hero-stats">
              <div className="stat-card">
                <span className="stat-icon">🌍</span>
                <div>
                  <div className="stat-number">100+</div>
                  <div className="stat-label">Cities</div>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⚡</span>
                <div>
                  <div className="stat-number">Real-time</div>
                  <div className="stat-label">Updates</div>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📊</span>
                <div>
                  <div className="stat-number">7-Day</div>
                  <div className="stat-label">Forecast</div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Search Section */}
      <div className="search-section">
        <div className="search-wrapper">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search for any Indian city..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
            <button 
              className="search-button" 
              onClick={() => handleSearch(searchQuery)}
              disabled={!searchQuery.trim()}
            >
              Search
            </button>
          </div>

          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((city, idx) => (
                <div
                  key={idx}
                  className="suggestion-item"
                  onClick={() => handleSearch(city)}
                >
                  <span className="suggestion-icon">📍</span>
                  <span>{city}</span>
                  <span className="suggestion-arrow">→</span>
                </div>
              ))}
            </div>
          )}

          {/* Search History Panel */}
          {showHistory && (
            <div className="history-panel">
              <div className="history-header">
                <h3>
                  <span className="history-icon">🕒</span>
                  Recent Searches
                </h3>
                {searchHistory.length > 0 && (
                  <button className="clear-history-btn" onClick={clearHistory}>
                    <span>🗑️</span> Clear All
                  </button>
                )}
              </div>
              <div className="history-content">
                {searchHistory.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <p>No search history yet</p>
                  </div>
                ) : (
                  searchHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="history-item"
                      onClick={() => {
                        handleSearch(item.city);
                        setShowHistory(false);
                      }}
                    >
                      <span className="history-city-icon">🏙️</span>
                      <div className="history-info">
                        <span className="history-city">{item.city}</span>
                        <span className="history-time">
                          {new Date(item.searchedAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="history-arrow">→</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="error-close" onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Fetching weather data...</p>
        </div>
      )}

      {/* Current Weather */}
      {currentWeather && (
        <div className="weather-container">
          <div className="weather-card">
            <div className="weather-header">
              <div className="location-info">
                <h2 className="city-name">
                  <span className="location-pin">📍</span>
                  {currentWeather.name}
                </h2>
                <p className="weather-desc">{currentWeather.weather[0].description}</p>
              </div>
              <div className="weather-icon-large">
                {getWeatherIcon(currentWeather.weather[0].main)}
              </div>
            </div>

            <div className="temperature-display">
              <div className="temp-main">{Math.round(currentWeather.main.temp)}°</div>
              <div className="temp-info">
                <div className="temp-detail">
                  Feels like {Math.round(currentWeather.main.feels_like)}°
                </div>
                <div className="temp-range">
                  ↑ {Math.round(currentWeather.main.temp_max)}° ↓ {Math.round(currentWeather.main.temp_min)}°
                </div>
              </div>
            </div>

            <div className="weather-grid">
              <div className="weather-stat">
                <div className="stat-icon-circle">💨</div>
                <div className="stat-details">
                  <div className="stat-label">Wind Speed</div>
                  <div className="stat-value">{currentWeather.wind.speed} m/s</div>
                </div>
              </div>

              <div className="weather-stat">
                <div className="stat-icon-circle">💧</div>
                <div className="stat-details">
                  <div className="stat-label">Humidity</div>
                  <div className="stat-value">{currentWeather.main.humidity}%</div>
                </div>
              </div>

              <div className="weather-stat">
                <div className="stat-icon-circle">🌡️</div>
                <div className="stat-details">
                  <div className="stat-label">Pressure</div>
                  <div className="stat-value">{currentWeather.main.pressure} hPa</div>
                </div>
              </div>

              <div className="weather-stat">
                <div className="stat-icon-circle">👁️</div>
                <div className="stat-details">
                  <div className="stat-label">Visibility</div>
                  <div className="stat-value">{(currentWeather.visibility / 1000).toFixed(1)} km</div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          {forecastData.length > 0 && (
            <div className="forecast-container">
              <h2 className="forecast-title">
                <span className="forecast-icon">📅</span>
                7-Day Forecast
              </h2>
              
              <div className="forecast-carousel">
                {forecastData.map((day, idx) => (
                  <div key={idx} className="forecast-item">
                    <div className="forecast-day">{day.date}</div>
                    <div className="forecast-weather-icon">
                      {getWeatherIcon(day.description)}
                    </div>
                    <div className="forecast-temp-main">{day.temperature}°</div>
                    <div className="forecast-metrics">
                      <span className="metric">
                        <span className="metric-icon">💧</span>
                        {day.humidity}%
                      </span>
                      <span className="metric">
                        <span className="metric-icon">💨</span>
                        {day.windSpeed}m/s
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Temperature Chart */}
              <div className="chart-section">
                <h3 className="chart-title">Temperature Trend</h3>
                <div className="chart-wrapper">
                  <svg className="temp-chart" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#764ba2" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map(i => (
                      <line
                        key={i}
                        x1="50"
                        y1={50 + i * 50}
                        x2="950"
                        y2={50 + i * 50}
                        stroke="#e0e0e0"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                      />
                    ))}

                    {/* Data visualization */}
                    {forecastData.map((day, idx) => {
                      const x = 100 + (idx * 850) / (forecastData.length - 1);
                      const maxTemp = Math.max(...forecastData.map(d => d.temperature));
                      const minTemp = Math.min(...forecastData.map(d => d.temperature));
                      const range = maxTemp - minTemp || 1;
                      const y = 250 - ((day.temperature - minTemp) / range) * 180;
                      
                      return (
                        <g key={idx}>
                          {/* Connection line */}
                          {idx < forecastData.length - 1 && (
                            <line
                              x1={x}
                              y1={y}
                              x2={100 + ((idx + 1) * 850) / (forecastData.length - 1)}
                              y2={250 - ((forecastData[idx + 1].temperature - minTemp) / range) * 180}
                              stroke="url(#chartGradient)"
                              strokeWidth="3"
                            />
                          )}
                          
                          {/* Data point */}
                          <circle cx={x} cy={y} r="8" fill="#667eea" stroke="white" strokeWidth="3" />
                          
                          {/* Temperature label */}
                          <text x={x} y={y - 20} textAnchor="middle" fill="#667eea" fontSize="16" fontWeight="bold">
                            {day.temperature}°
                          </text>
                          
                          {/* Date label */}
                          <text x={x} y={280} textAnchor="middle" fill="#666" fontSize="12">
                            {day.date.split('/').slice(0, 2).join('/')}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>Made ❤️ By Sahil Ibrahim</p>
        <p className="footer-note">Real-time weather data for Indian cities</p>
      </footer>
    </div>
  );
}

export default App;
