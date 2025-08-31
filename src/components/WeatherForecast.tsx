'use client';

import React, { useState, useEffect } from 'react';
import { WeatherData, LocationCoordinates, SMHIWeatherService } from '@/lib/weather-service';

interface WeatherForecastProps {
  location: string;
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
}

export default function WeatherForecast({ location, onDateSelect, selectedDate }: WeatherForecastProps) {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);

  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  const fetchWeatherData = async () => {
    if (!location.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Get coordinates from location
      const coords = await SMHIWeatherService.getCoordinatesFromLocation(location);
      if (!coords) {
        setError('Location not found. Please enter a Swedish city name.');
        setLoading(false);
        return;
      }

      setCoordinates(coords);

      // Fetch weather data
      const forecast = await SMHIWeatherService.getForecast(coords);
      setWeatherData(forecast);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherQuality = (weather: WeatherData): 'excellent' | 'good' | 'fair' | 'poor' => {
    const { temperature, precipitation, wind, cloudCover } = weather;
    
    // Excellent: Sunny, warm, no rain, light wind
    if (cloudCover < 30 && precipitation.chance < 20 && wind.speed < 8 && temperature.max > 15) {
      return 'excellent';
    }
    
    // Good: Partly cloudy, no rain, moderate wind
    if (cloudCover < 60 && precipitation.chance < 30 && wind.speed < 12) {
      return 'good';
    }
    
    // Fair: Some clouds, light rain possible, moderate wind
    if (cloudCover < 80 && precipitation.chance < 50 && wind.speed < 15) {
      return 'fair';
    }
    
    // Poor: Overcast, rain likely, windy
    return 'poor';
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 border-green-300 text-green-800';
      case 'good': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'fair': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'poor': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Perfect! ☀️';
      case 'good': return 'Good 👍';
      case 'fair': return 'Fair ⚠️';
      case 'poor': return 'Poor 🌧️';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        // Safari-compatible date formatting
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        };
        
        try {
          return date.toLocaleDateString('sv-SE', options);
        } catch (e) {
          // Fallback for Safari
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}`;
        }
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date';
    }
  };

  const isDateInForecastRange = (dateString: string) => {
    if (!weatherData.length) return false;
    
    const selectedDate = new Date(dateString);
    const firstForecastDate = new Date(weatherData[0].date);
    const lastForecastDate = new Date(weatherData[weatherData.length - 1].date);
    
    return selectedDate >= firstForecastDate && selectedDate <= lastForecastDate;
  };

  if (!location.trim()) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#60A5FA]"></div>
          <span className="ml-3 text-gray-600">Loading weather forecast...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (weatherData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🌤️ 10-Day Weather Forecast
        </h3>
        {coordinates && (
          <p className="text-sm text-gray-600">
            Location: <span className="font-medium">{coordinates.name}</span>
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Use this forecast to pick the best date for your event (next 10 days)
        </p>
        
        {/* Selected Date Beyond Forecast Range */}
        {selectedDate && !isDateInForecastRange(selectedDate) && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm text-yellow-800">
                Your selected date is beyond the 10-day forecast range. Weather data may not be available.
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {weatherData.map((weather, index) => {
          const quality = getWeatherQuality(weather);
          const isSelected = selectedDate === weather.date;
          
          return (
            <button
              key={weather.date}
              type="button"
              onClick={() => onDateSelect?.(weather.date)}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105
                ${isSelected 
                  ? 'border-[#60A5FA] bg-[#60A5FA]/10 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
                }
                ${onDateSelect ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              {/* Date */}
              <div className="text-center mb-2">
                <div className="text-xs font-medium text-gray-600">
                  {formatDate(weather.date)}
                </div>
              </div>

              {/* Weather Icon */}
              <div className="text-center text-2xl mb-2">
                {weather.weatherIcon}
              </div>

              {/* Temperature */}
              <div className="text-center mb-2">
                <div className="text-sm font-semibold text-gray-900">
                  {weather.temperature.max}°
                </div>
                <div className="text-xs text-gray-500">
                  {weather.temperature.min}°
                </div>
              </div>

              {/* Weather Quality */}
              <div className={`
                text-xs px-2 py-1 rounded-full border text-center
                ${getQualityColor(quality)}
              `}>
                {getQualityLabel(quality)}
              </div>

              {/* Additional Info */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                <div>💧 {weather.precipitation.chance}%</div>
                <div>💨 {weather.wind.speed} m/s</div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#60A5FA] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
            <span>Perfect weather</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
            <span>Good conditions</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
            <span>Fair weather</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
            <span>Poor conditions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
