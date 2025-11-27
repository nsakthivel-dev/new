import fetch from 'node-fetch';

const WEATHER_API_BASE = 'http://api.weatherapi.com/v1';

export interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    humidity: number;
    wind_kph: number;
    wind_dir: string;
    pressure_mb: number;
    precip_mm: number;
    uv: number;
    cloud: number;
    feelslike_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        chance_of_rain: number;
      };
    }>;
  };
}

export async function getWeatherData(location: string): Promise<WeatherData> {
  const apiKey = process.env.weather_api;
  
  if (!apiKey) {
    throw new Error('Weather API key not configured');
  }

  try {
    // Fetch current weather
    const currentResponse = await fetch(
      `${WEATHER_API_BASE}/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`
    );
    
    if (!currentResponse.ok) {
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }
    
    const currentData = await currentResponse.json() as WeatherData;
    
    // Fetch forecast
    const forecastResponse = await fetch(
      `${WEATHER_API_BASE}/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=3&aqi=no&alerts=no`
    );
    
    if (!forecastResponse.ok) {
      throw new Error(`Weather API error: ${forecastResponse.status}`);
    }
    
    const forecastData = await forecastResponse.json() as WeatherData;
    
    // Combine data
    return {
      location: {
        name: currentData.location.name,
        country: currentData.location.country
      },
      current: {
        temp_c: currentData.current.temp_c,
        temp_f: currentData.current.temp_f,
        humidity: currentData.current.humidity,
        wind_kph: currentData.current.wind_kph,
        wind_dir: currentData.current.wind_dir,
        pressure_mb: currentData.current.pressure_mb,
        precip_mm: currentData.current.precip_mm,
        uv: currentData.current.uv,
        cloud: currentData.current.cloud,
        feelslike_c: currentData.current.feelslike_c,
        condition: {
          text: currentData.current.condition.text,
          icon: currentData.current.condition.icon
        }
      },
      forecast: {
        forecastday: forecastData.forecast.forecastday.map((day: any) => ({
          date: day.date,
          day: {
            maxtemp_c: day.day.maxtemp_c,
            mintemp_c: day.day.mintemp_c,
            condition: {
              text: day.day.condition.text,
              icon: day.day.condition.icon
            },
            chance_of_rain: day.day.chance_of_rain
          }
        }))
      }
    };
  } catch (error) {
    console.error('Weather API error:', error);
    throw new Error('Failed to fetch weather data');
  }
}