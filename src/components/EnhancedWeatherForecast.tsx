'use client';

import { useState, useEffect } from 'react';
import { EnhancedWeatherService, EnhancedWeatherResult, LocationCoordinates } from '@/lib/enhanced-weather-service';
import GoogleMap, { MapLocation } from './GoogleMap';

interface EnhancedWeatherForecastProps {
  onDateSelect?: (date: string) => void;
  onLocationSelect?: (location: string, coordinates: LocationCoordinates) => void;
  initialLocation?: string;
  className?: string;
}

export default function EnhancedWeatherForecast({
  initialLocation = '',
  onDateSelect,
  onLocationSelect,
  className = ''
}: EnhancedWeatherForecastProps) {
  const [location, setLocation] = useState(initialLocation);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weatherResult, setWeatherResult] = useState<EnhancedWeatherResult | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<LocationCoordinates | null>(null);
  const [selectedWeatherDate, setSelectedWeatherDate] = useState<string | null>(null);

  // Fetch weather when location changes
  useEffect(() => {
    if (location.trim()) {
      fetchWeather(location);
    }
  }, [location]);

  const fetchWeather = async (locationInput: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await EnhancedWeatherService.getWeatherForLocation(locationInput);
      setWeatherResult(result);
      
      if (result.isValid && result.coordinates) {
        setSelectedCoordinates(result.coordinates);
      }
    } catch (error) {
      setError('Failed to fetch weather data');
      console.error('Weather fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeather(location);
    }
  };

  const handleMapLocationSelect = (mapLocation: MapLocation) => {
    if (mapLocation.address) {
      setLocation(mapLocation.address);
      setSelectedCoordinates({
        lat: mapLocation.lat,
        lng: mapLocation.lng,
        formattedAddress: mapLocation.address
      });
      setShowMap(false);
    }
  };

  const handleLocationConfirm = () => {
    if (weatherResult?.coordinates && onLocationSelect) {
      // Use the clean address if available, otherwise fall back to formatted address
      const selectedAddress = weatherResult.coordinates.cleanAddress || weatherResult.coordinates.formattedAddress || location;
      
      // Update the local state to show the selected address in the input field
      setLocation(selectedAddress);
      
      // Call the parent callback with the selected address and coordinates
      onLocationSelect(selectedAddress, weatherResult.coordinates);
    }
  };

  const handleWeatherDateSelect = (date: string) => {
    setSelectedWeatherDate(date);
    onDateSelect?.(date);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('sv-SE', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🏠 The address for the event
        </h3>
        <button
          type="button"
          onClick={() => setShowMap(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Location Input - Hidden after date selection */}
      {!selectedWeatherDate && (
        <div className="mb-4">
          <div className="space-y-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter full address (e.g., Storgatan 15, Stockholm)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleLocationSubmit}
                disabled={isLoading || !location.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Get Weather'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Date Summary - Shown after date selection */}
      {selectedWeatherDate && weatherResult && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium text-green-900">
                  Date Selected: {formatDate(selectedWeatherDate)}
                </p>
                <p className="text-sm text-green-700">
                  Location: {weatherResult.coordinates?.cleanAddress || weatherResult.coordinates?.formattedAddress || location}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedWeatherDate(null);
                setLocation(''); // Clear the input field
              }}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              Change Location
            </button>
          </div>
        </div>
      )}

      {/* Map Section */}
      {showMap && (
        <div className="mb-4">
          <GoogleMap
            center={selectedCoordinates ? { lat: selectedCoordinates.lat, lng: selectedCoordinates.lng } : undefined}
            zoom={10}
            height="300px"
            showLocationPicker={true}
            onLocationSelect={handleMapLocationSelect}
            markers={selectedCoordinates ? [{ lat: selectedCoordinates.lat, lng: selectedCoordinates.lng, address: selectedCoordinates.formattedAddress }] : []}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Weather Results */}
      {weatherResult && (
        <div>
          {weatherResult.isValid ? (
            <>
              {/* Location Info */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">
                      📍 {weatherResult.coordinates?.cleanAddress || weatherResult.coordinates?.formattedAddress || location}
                    </p>
                    <p className="text-sm text-blue-700">
                      Coordinates: {weatherResult.coordinates?.lat.toFixed(4)}, {weatherResult.coordinates?.lng.toFixed(4)}
                    </p>
                  </div>
                  {onLocationSelect && (
                    <button
                      type="button"
                      onClick={handleLocationConfirm}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      Use This Location
                    </button>
                  )}
                </div>
              </div>

              {/* Weather Forecast - Hidden after date selection */}
              {!selectedWeatherDate && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-3">10-Day Forecast:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {weatherResult.weather?.map((day) => {
                      const isSelected = selectedWeatherDate === day.date;
                      return (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => handleWeatherDateSelect(day.date)}
                          className={`p-4 rounded-xl text-center transition-all duration-200 cursor-pointer border-2 ${
                            isSelected
                              ? 'bg-blue-100 border-blue-500 shadow-lg scale-105'
                              : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-3xl mb-2">{day.icon}</div>
                          <div className="text-xs font-medium text-gray-700 mb-1">
                            {formatDate(day.date)}
                          </div>
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            {day.temperature}°C
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {day.description}
                          </div>
                          {isSelected && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                                ✓ Selected
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-700 text-sm">
                ⚠️ {weatherResult.error || 'Unable to get weather for this location'}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Make sure the location is in Sweden and try again.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center">
        💡 Enter any Swedish location to get accurate weather forecasts
      </div>
    </div>
  );
}
