export interface LocationCoordinates {
  lat: number;
  lng: number;
  formattedAddress: string;
  cleanAddress?: string;
}

export interface WeatherData {
  date: string;
  temperature: number;
  description: string;
  icon: string;
}

export interface EnhancedWeatherResult {
  location: string;
  coordinates: LocationCoordinates | null;
  weather: WeatherData[] | null;
  isValid: boolean;
  error?: string;
}

export class EnhancedWeatherService {
  /**
   * Geocode an address using server-side API
   */
  private static async geocodeAddress(address: string): Promise<LocationCoordinates> {
    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Geocoding failed');
      }

      return data.coordinates;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to geocode address');
    }
  }

  /**
   * Validate if coordinates are within Sweden
   */
  private static isInSweden(coordinates: LocationCoordinates): boolean {
    // Sweden bounding box (approximate)
    const swedenBounds = {
      north: 69.0,  // Northernmost point
      south: 55.0,  // Southernmost point
      east: 24.0,   // Easternmost point
      west: 11.0    // Westernmost point
    };

    return (
      coordinates.lat >= swedenBounds.south &&
      coordinates.lat <= swedenBounds.north &&
      coordinates.lng >= swedenBounds.west &&
      coordinates.lng <= swedenBounds.east
    );
  }

  /**
   * Fetch weather data from SMHI API
   */
  private static async fetchWeatherFromSMHI(coordinates: LocationCoordinates): Promise<WeatherData[]> {
    // Round coordinates to SMHI's grid system (nearest 0.1 degree)
    const lat = Math.round(coordinates.lat * 10) / 10;
    const lng = Math.round(coordinates.lng * 10) / 10;

    const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lng}/lat/${lat}/data.json`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`SMHI API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract 10-day forecast
      const timeSeries = data.timeSeries || [];
      const weatherData: WeatherData[] = [];

      // Group by date and get daily forecast
      const dailyForecasts = new Map<string, any[]>();
      
      timeSeries.forEach((item: any) => {
        const date = new Date(item.validTime).toISOString().split('T')[0];
        if (!dailyForecasts.has(date)) {
          dailyForecasts.set(date, []);
        }
        dailyForecasts.get(date)!.push(item);
      });

      // Get forecast for next 10 days
      const sortedDates = Array.from(dailyForecasts.keys()).sort().slice(0, 10);
      
      sortedDates.forEach(date => {
        const dayForecasts = dailyForecasts.get(date)!;
        
        // Get temperature at 12:00 (noon) for daily forecast
        const noonForecast = dayForecasts.find(f => {
          const hour = new Date(f.validTime).getHours();
          return hour >= 11 && hour <= 13;
        }) || dayForecasts[0];

        if (noonForecast) {
          const temperature = noonForecast.parameters.find((p: any) => p.name === 't')?.values[0] || 0;
          const weatherCode = noonForecast.parameters.find((p: any) => p.name === 'Wsymb2')?.values[0] || 1;
          
          weatherData.push({
            date,
            temperature: Math.round(temperature),
            description: this.getWeatherDescription(weatherCode),
            icon: this.getWeatherIcon(weatherCode)
          });
        }
      });

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather from SMHI:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  /**
   * Get weather description from SMHI weather code
   */
  private static getWeatherDescription(code: number): string {
    const descriptions: { [key: number]: string } = {
      1: 'Clear sky',
      2: 'Nearly clear sky',
      3: 'Variable cloudiness',
      4: 'Halfclear sky',
      5: 'Cloudy sky',
      6: 'Overcast',
      7: 'Fog',
      8: 'Light rain showers',
      9: 'Moderate rain showers',
      10: 'Heavy rain showers',
      11: 'Thunderstorm',
      12: 'Light sleet showers',
      13: 'Moderate sleet showers',
      14: 'Heavy sleet showers',
      15: 'Light snow showers',
      16: 'Moderate snow showers',
      17: 'Heavy snow showers',
      18: 'Light rain',
      19: 'Moderate rain',
      20: 'Heavy rain',
      21: 'Thunder',
      22: 'Light sleet',
      23: 'Moderate sleet',
      24: 'Heavy sleet',
      25: 'Light snowfall',
      26: 'Moderate snowfall',
      27: 'Heavy snowfall'
    };
    
    return descriptions[code] || 'Unknown weather';
  }

  /**
   * Get weather icon from SMHI weather code
   */
  private static getWeatherIcon(code: number): string {
    const icons: { [key: number]: string } = {
      1: '☀️',  // Clear sky
      2: '🌤️',  // Nearly clear sky
      3: '⛅',  // Variable cloudiness
      4: '🌥️',  // Halfclear sky
      5: '☁️',  // Cloudy sky
      6: '☁️',  // Overcast
      7: '🌫️',  // Fog
      8: '🌦️',  // Light rain showers
      9: '🌧️',  // Moderate rain showers
      10: '⛈️', // Heavy rain showers
      11: '⛈️', // Thunderstorm
      12: '🌨️', // Light sleet showers
      13: '🌨️', // Moderate sleet showers
      14: '🌨️', // Heavy sleet showers
      15: '🌨️', // Light snow showers
      16: '🌨️', // Moderate snow showers
      17: '🌨️', // Heavy snow showers
      18: '🌦️', // Light rain
      19: '🌧️', // Moderate rain
      20: '🌧️', // Heavy rain
      21: '⛈️', // Thunder
      22: '🌨️', // Light sleet
      23: '🌨️', // Moderate sleet
      24: '🌨️', // Heavy sleet
      25: '🌨️', // Light snowfall
      26: '🌨️', // Moderate snowfall
      27: '🌨️'  // Heavy snowfall
    };
    
    return icons[code] || '❓';
  }

  /**
   * Main method to get weather for a location
   */
  static async getWeatherForLocation(locationInput: string): Promise<EnhancedWeatherResult> {
    try {
      // 1. Get precise coordinates from server-side geocoding
      const coordinates = await this.geocodeAddress(locationInput);
      
      // 2. Validate coordinates are in Sweden
      if (!this.isInSweden(coordinates)) {
        throw new Error('Location must be in Sweden');
      }
      
      // 3. Get weather with precise coordinates
      const weather = await this.fetchWeatherFromSMHI(coordinates);
      
      return {
        location: locationInput,
        coordinates,
        weather,
        isValid: true
      };
    } catch (error) {
      console.error('Enhanced weather service error:', error);
      
      return {
        location: locationInput,
        coordinates: null,
        weather: null,
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get coordinates for a location without weather data
   */
  static async getCoordinatesForLocation(locationInput: string): Promise<LocationCoordinates | null> {
    try {
      const coordinates = await this.geocodeAddress(locationInput);
      
      if (!this.isInSweden(coordinates)) {
        throw new Error('Location must be in Sweden');
      }
      
      return coordinates;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }
}
