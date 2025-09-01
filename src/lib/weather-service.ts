export interface WeatherData {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  precipitation: {
    chance: number;
    amount: number;
  };
  wind: {
    speed: number;
    direction: string;
  };
  cloudCover: number;
  sunshine: number;
  weatherIcon: string;
  description: string;
}

export interface LocationCoordinates {
  lat: number;
  lon: number;
  name: string;
}

export class SMHIWeatherService {
  private static readonly BASE_URL = 'https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point';

  /**
   * Get weather forecast for a specific location
   */
  static async getForecast(coordinates: LocationCoordinates): Promise<WeatherData[]> {
    try {
      const url = `${this.BASE_URL}/lon/${coordinates.lon}/lat/${coordinates.lat}/data.json`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`SMHI API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  /**
   * Get weather forecast for a specific event date
   * Returns forecast if available, or seasonal estimate if too far in future
   */
  static async getEventWeather(coordinates: LocationCoordinates, eventDate: string): Promise<WeatherData | null> {
    try {
      const forecast = await this.getForecast(coordinates);
      const eventDateObj = new Date(eventDate);
      const eventDateString = eventDateObj.toISOString().split('T')[0];
      
      // Try to find exact weather data for the event date
      const eventWeather = forecast.find(weather => weather.date === eventDateString);
      if (eventWeather) {
        console.log('Found exact weather forecast for event date:', eventDateString);
        return eventWeather;
      }
      
      // If event is more than 15 days away, provide seasonal estimate
      const today = new Date();
      const daysUntilEvent = Math.ceil((eventDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`Event is ${daysUntilEvent} days away, forecast available for ${forecast.length} days`);
      
      if (daysUntilEvent > 15) {
        const seasonalEstimate = this.getSeasonalEstimate(coordinates, eventDateObj);
        console.log('Returning seasonal estimate:', seasonalEstimate);
        return seasonalEstimate;
      }
      
      console.log('Event within 15 days but no forecast available');
      return null;
    } catch (error) {
      console.error('Error fetching event weather:', error);
      return null;
    }
  }

  /**
   * Check if weather data should be refreshed based on event date
   * Returns true if event is now within 15 days and was previously showing seasonal estimate
   */
  static shouldRefreshWeather(eventDate: string, currentWeatherData: WeatherData | null): boolean {
    if (!currentWeatherData) return true;
    
    const eventDateObj = new Date(eventDate);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // If event is now within 15 days and current data is a seasonal estimate, refresh
    if (daysUntilEvent <= 15 && currentWeatherData.description.includes('seasonal estimate')) {
      return true;
    }
    
    // If event is within 3 days, refresh more frequently for accuracy
    if (daysUntilEvent <= 3) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate seasonal weather estimate for events far in the future
   */
  static getSeasonalEstimate(coordinates: LocationCoordinates, eventDate: Date): WeatherData {
    const month = eventDate.getMonth();
    const isSummer = month >= 5 && month <= 8; // June to September
    const isWinter = month >= 11 || month <= 2; // December to February
    const isSpring = month >= 3 && month <= 5; // March to May
    const isAutumn = month >= 9 && month <= 11; // September to November
    
    // Stockholm seasonal averages
    let temperature, precipitation, description, weatherIcon;
    
    if (isSummer) {
      temperature = { min: 12, max: 22 };
      precipitation = { chance: 30, amount: 2 };
      description = "Typical summer weather";
      weatherIcon = "☀️";
    } else if (isWinter) {
      temperature = { min: -3, max: 2 };
      precipitation = { chance: 40, amount: 1 };
      description = "Typical winter weather";
      weatherIcon = "❄️";
    } else if (isSpring) {
      temperature = { min: 2, max: 12 };
      precipitation = { chance: 35, amount: 1.5 };
      description = "Typical spring weather";
      weatherIcon = "🌸";
    } else { // Autumn
      temperature = { min: 4, max: 14 };
      precipitation = { chance: 45, amount: 2.5 };
      description = "Typical autumn weather";
      weatherIcon = "🍂";
    }
    
    return {
      date: eventDate.toISOString().split('T')[0],
      temperature,
      precipitation,
      wind: { speed: 3, direction: "SW" },
      cloudCover: 60,
      sunshine: isSummer ? 8 : isWinter ? 2 : 5,
      weatherIcon,
      description: `${description} (seasonal estimate)`
    };
  }

  /**
   * Parse SMHI API response into our WeatherData format
   */
  private static parseWeatherData(apiData: any): WeatherData[] {
    const weatherData: WeatherData[] = [];
    
    // Group data by date
    const dailyData = new Map<string, any[]>();
    
    apiData.timeSeries.forEach((timePoint: any) => {
      const date = new Date(timePoint.validTime).toISOString().split('T')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, []);
      }
      dailyData.get(date)!.push(timePoint);
    });

    // Process each day
    dailyData.forEach((timePoints, date) => {
      const dayData = this.processDayData(timePoints);
      weatherData.push({
        date,
        ...dayData
      });
    });

    // Sort by date and return next 15 days (SMHI provides up to 15 days)
    return weatherData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 15);
  }

  /**
   * Process weather data for a single day
   */
  private static processDayData(timePoints: any[]) {
    let minTemp = Infinity;
    let maxTemp = -Infinity;
    let totalPrecip = 0;
    let precipChance = 0;
    let totalWind = 0;
    let windDirection = '';
    let totalCloudCover = 0;
    let totalSunshine = 0;
    let sunnyHours = 0;

    timePoints.forEach(point => {
      // Temperature
      const temp = this.getParameterValue(point, 't');
      if (temp !== null) {
        minTemp = Math.min(minTemp, temp);
        maxTemp = Math.max(maxTemp, temp);
      }

      // Precipitation
      const precip = this.getParameterValue(point, 'pmean');
      if (precip !== null && precip > 0) {
        totalPrecip += precip;
        precipChance = Math.max(precipChance, this.getParameterValue(point, 'pcat') || 0);
      }

      // Wind
      const windSpeed = this.getParameterValue(point, 'ws');
      if (windSpeed !== null) {
        totalWind += windSpeed;
      }

      const windDir = this.getParameterValue(point, 'wd');
      if (windDir !== null) {
        windDirection = this.getWindDirection(windDir);
      }

      // Cloud cover
      const cloudCover = this.getParameterValue(point, 'tcc_mean');
      if (cloudCover !== null) {
        totalCloudCover += cloudCover;
      }

      // Sunshine (approximate based on cloud cover)
      if (cloudCover !== null && cloudCover < 30) {
        sunnyHours++;
      }
    });

    const avgCloudCover = totalCloudCover / timePoints.length;
    const avgWindSpeed = totalWind / timePoints.length;

    return {
      temperature: {
        min: Math.round(minTemp),
        max: Math.round(maxTemp)
      },
      precipitation: {
        chance: Math.round(precipChance),
        amount: Math.round(totalPrecip * 10) / 10
      },
      wind: {
        speed: Math.round(avgWindSpeed),
        direction: windDirection
      },
      cloudCover: Math.round(avgCloudCover),
      sunshine: sunnyHours,
      weatherIcon: this.getWeatherIcon(avgCloudCover, precipChance),
      description: this.getWeatherDescription(avgCloudCover, precipChance, avgWindSpeed)
    };
  }

  /**
   * Get parameter value from SMHI data
   */
  private static getParameterValue(timePoint: any, parameter: string): number | null {
    const param = timePoint.parameters?.find((p: any) => p.name === parameter);
    return param ? param.values[0] : null;
  }

  /**
   * Convert wind direction degrees to cardinal directions
   */
  private static getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  /**
   * Get weather icon based on conditions
   */
  private static getWeatherIcon(cloudCover: number, precipChance: number): string {
    if (precipChance > 50) return '🌧️';
    if (precipChance > 20) return '🌦️';
    if (cloudCover > 80) return '☁️';
    if (cloudCover > 50) return '⛅';
    return '☀️';
  }

  /**
   * Get weather description
   */
  private static getWeatherDescription(cloudCover: number, precipChance: number, windSpeed: number): string {
    if (precipChance > 50) return 'Rainy';
    if (precipChance > 20) return 'Light rain possible';
    if (cloudCover > 80) return 'Overcast';
    if (cloudCover > 50) return 'Partly cloudy';
    if (windSpeed > 10) return 'Windy';
    return 'Sunny';
  }

  /**
   * Get location coordinates from a location string (basic implementation)
   * In a real app, you'd use a geocoding service like Google Maps or OpenStreetMap
   */
  static async getCoordinatesFromLocation(location: string): Promise<LocationCoordinates | null> {
    // Comprehensive list of Swedish cities with coordinates
    const commonLocations: Record<string, LocationCoordinates> = {
      // Major cities
      'stockholm': { lat: 59.3293, lon: 18.0686, name: 'Stockholm' },
      'gothenburg': { lat: 57.7089, lon: 11.9746, name: 'Gothenburg' },
      'göteborg': { lat: 57.7089, lon: 11.9746, name: 'Göteborg' },
      'malmö': { lat: 55.6050, lon: 13.0038, name: 'Malmö' },
      'malmo': { lat: 55.6050, lon: 13.0038, name: 'Malmö' },
      'uppsala': { lat: 59.8586, lon: 17.6389, name: 'Uppsala' },
      'västerås': { lat: 59.6091, lon: 16.5448, name: 'Västerås' },
      'vasteras': { lat: 59.6091, lon: 16.5448, name: 'Västerås' },
      'örebro': { lat: 59.2753, lon: 15.2134, name: 'Örebro' },
      'orebro': { lat: 59.2753, lon: 15.2134, name: 'Örebro' },
      'linköping': { lat: 58.4108, lon: 15.6214, name: 'Linköping' },
      'linkoping': { lat: 58.4108, lon: 15.6214, name: 'Linköping' },
      'helsingborg': { lat: 56.0465, lon: 12.6945, name: 'Helsingborg' },
      'jönköping': { lat: 57.7826, lon: 14.1618, name: 'Jönköping' },
      'jonkoping': { lat: 57.7826, lon: 14.1618, name: 'Jönköping' },
      'norrköping': { lat: 58.5877, lon: 16.1924, name: 'Norrköping' },
      'norrkoping': { lat: 58.5877, lon: 16.1924, name: 'Norrköping' },
      
      // Additional cities with special characters
      'gävle': { lat: 60.6745, lon: 17.1417, name: 'Gävle' },
      'gavle': { lat: 60.6745, lon: 17.1417, name: 'Gävle' },
      'vätö': { lat: 59.7333, lon: 18.7167, name: 'Vätö' },
      'vato': { lat: 59.7333, lon: 18.7167, name: 'Vätö' },
      'karlskrona': { lat: 56.1612, lon: 15.5869, name: 'Karlskrona' },
      'karlskoga': { lat: 59.3267, lon: 14.5239, name: 'Karlskoga' },
      'karlstad': { lat: 59.4022, lon: 13.5115, name: 'Karlstad' },
      'kristianstad': { lat: 56.0294, lon: 14.1567, name: 'Kristianstad' },
      'kristianstad': { lat: 56.0294, lon: 14.1567, name: 'Kristianstad' },
      'kungsbacka': { lat: 57.4875, lon: 12.0761, name: 'Kungsbacka' },
      'kungälv': { lat: 57.8708, lon: 11.9746, name: 'Kungälv' },
      'kungalv': { lat: 57.8708, lon: 11.9746, name: 'Kungälv' },
      'luleå': { lat: 65.5848, lon: 22.1567, name: 'Luleå' },
      'lulea': { lat: 65.5848, lon: 22.1567, name: 'Luleå' },
      'lund': { lat: 55.7047, lon: 13.1910, name: 'Lund' },
      'mölndal': { lat: 57.6556, lon: 12.0136, name: 'Mölndal' },
      'molndal': { lat: 57.6556, lon: 12.0136, name: 'Mölndal' },
      'nacka': { lat: 59.3105, lon: 18.1637, name: 'Nacka' },
      'oskarshamn': { lat: 57.2644, lon: 16.4489, name: 'Oskarshamn' },
      'piteå': { lat: 65.3172, lon: 21.4794, name: 'Piteå' },
      'pitea': { lat: 65.3172, lon: 21.4794, name: 'Piteå' },
      'skellefteå': { lat: 64.7507, lon: 20.9528, name: 'Skellefteå' },
      'skelleftea': { lat: 64.7507, lon: 20.9528, name: 'Skellefteå' },
      'skövde': { lat: 58.3909, lon: 13.8456, name: 'Skövde' },
      'skovde': { lat: 58.3909, lon: 13.8456, name: 'Skövde' },
      'södertälje': { lat: 59.1955, lon: 17.6252, name: 'Södertälje' },
      'sodertalje': { lat: 59.1955, lon: 17.6252, name: 'Södertälje' },
      'sölvesborg': { lat: 56.0522, lon: 14.5758, name: 'Sölvesborg' },
      'solvesborg': { lat: 56.0522, lon: 14.5758, name: 'Sölvesborg' },
      'trelleborg': { lat: 55.3754, lon: 13.1569, name: 'Trelleborg' },
      'trollhättan': { lat: 58.2837, lon: 12.2886, name: 'Trollhättan' },
      'trollhattan': { lat: 58.2837, lon: 12.2886, name: 'Trollhättan' },
      'uddevalla': { lat: 58.3594, lon: 11.9424, name: 'Uddevalla' },
      'umeå': { lat: 63.8258, lon: 20.2630, name: 'Umeå' },
      'umea': { lat: 63.8258, lon: 20.2630, name: 'Umeå' },
      'uppsala': { lat: 59.8586, lon: 17.6389, name: 'Uppsala' },
      'västervik': { lat: 57.7584, lon: 16.6373, name: 'Västervik' },
      'vastervik': { lat: 57.7584, lon: 16.6373, name: 'Västervik' },
      'växjö': { lat: 56.8777, lon: 14.8091, name: 'Växjö' },
      'vaxjo': { lat: 56.8777, lon: 14.8091, name: 'Växjö' },
      'åmål': { lat: 59.0511, lon: 12.7014, name: 'Åmål' },
      'amal': { lat: 59.0511, lon: 12.7014, name: 'Åmål' },
      'älvsjö': { lat: 59.2789, lon: 18.0097, name: 'Älvsjö' },
      'alvsjo': { lat: 59.2789, lon: 18.0097, name: 'Älvsjö' },
      'östersund': { lat: 63.1792, lon: 14.6357, name: 'Östersund' },
      'ostersund': { lat: 63.1792, lon: 14.6357, name: 'Östersund' },
      'örebro': { lat: 59.2753, lon: 15.2134, name: 'Örebro' },
      'orebro': { lat: 59.2753, lon: 15.2134, name: 'Örebro' },
      'örnsköldsvik': { lat: 63.2909, lon: 18.7153, name: 'Örnsköldsvik' },
      'ornskoldsvik': { lat: 63.2909, lon: 18.7153, name: 'Örnsköldsvik' },
      'åre': { lat: 63.3972, lon: 13.0792, name: 'Åre' },
      'are': { lat: 63.3972, lon: 13.0792, name: 'Åre' },
      'älvdalen': { lat: 61.2278, lon: 14.0392, name: 'Älvdalen' },
      'alvdalen': { lat: 61.2278, lon: 14.0392, name: 'Älvdalen' },
      'åsele': { lat: 64.1625, lon: 17.3569, name: 'Åsele' },
      'asele': { lat: 64.1625, lon: 17.3569, name: 'Åsele' },
      'äviken': { lat: 60.1333, lon: 16.2167, name: 'Äviken' },
      'aviken': { lat: 60.1333, lon: 16.2167, name: 'Äviken' },
      'överkalix': { lat: 66.3167, lon: 22.8500, name: 'Överkalix' },
      'overkalix': { lat: 66.3167, lon: 22.8500, name: 'Överkalix' },
      'åseda': { lat: 57.1667, lon: 15.3333, name: 'Åseda' },
      'aseda': { lat: 57.1667, lon: 15.3333, name: 'Åseda' },
      'älmhult': { lat: 56.5500, lon: 14.1333, name: 'Älmhult' },
      'almhult': { lat: 56.5500, lon: 14.1333, name: 'Älmhult' },
      'åstorp': { lat: 56.1333, lon: 12.9500, name: 'Åstorp' },
      'astorp': { lat: 56.1333, lon: 12.9500, name: 'Åstorp' },
      'östra göinge': { lat: 56.0500, lon: 14.3167, name: 'Östra Göinge' },
      'ostra goinge': { lat: 56.0500, lon: 14.3167, name: 'Östra Göinge' },
      'åsele': { lat: 64.1625, lon: 17.3569, name: 'Åsele' },
      'asele': { lat: 64.1625, lon: 17.3569, name: 'Åsele' },
      'älvdalen': { lat: 61.2278, lon: 14.0392, name: 'Älvdalen' },
      'alvdalen': { lat: 61.2278, lon: 14.0392, name: 'Älvdalen' },
      'äviken': { lat: 60.1333, lon: 16.2167, name: 'Äviken' },
      'aviken': { lat: 60.1333, lon: 16.2167, name: 'Äviken' },
      'överkalix': { lat: 66.3167, lon: 22.8500, name: 'Överkalix' },
      'overkalix': { lat: 66.3167, lon: 22.8500, name: 'Överkalix' },
      'åseda': { lat: 57.1667, lon: 15.3333, name: 'Åseda' },
      'aseda': { lat: 57.1667, lon: 15.3333, name: 'Åseda' },
      'älmhult': { lat: 56.5500, lon: 14.1333, name: 'Älmhult' },
      'almhult': { lat: 56.5500, lon: 14.1333, name: 'Älmhult' },
      'åstorp': { lat: 56.1333, lon: 12.9500, name: 'Åstorp' },
      'astorp': { lat: 56.1333, lon: 12.9500, name: 'Åstorp' },
      'östra göinge': { lat: 56.0500, lon: 14.3167, name: 'Östra Göinge' },
      'ostra goinge': { lat: 56.0500, lon: 14.3167, name: 'Östra Göinge' }
    };

    // Normalize the input location (remove diacritics and convert to lowercase)
    const normalizedLocation = this.normalizeSwedishText(location.toLowerCase().trim());
    
    // Check for exact matches first
    if (commonLocations[normalizedLocation]) {
      return commonLocations[normalizedLocation];
    }

    // Check for partial matches with normalized text
    for (const [city, coords] of Object.entries(commonLocations)) {
      const normalizedCity = this.normalizeSwedishText(city);
      if (normalizedLocation.includes(normalizedCity) || normalizedCity.includes(normalizedLocation)) {
        return coords;
      }
    }

    // If no match found, return null (user will need to enter coordinates manually)
    return null;
  }

  /**
   * Normalize Swedish text by removing diacritics
   * This helps with matching city names that contain å, ä, ö
   */
  private static normalizeSwedishText(text: string): string {
    return text
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/Å/g, 'A')
      .replace(/Ä/g, 'A')
      .replace(/Ö/g, 'O');
  }
}
