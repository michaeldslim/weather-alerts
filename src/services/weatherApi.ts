import { WeatherData } from '../types/weather';
import {
  formatDayLabel,
  getConditionLabel,
  weatherCodeToCondition,
} from '../utils/weatherCode';

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
  locationName: string
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    timezone: 'auto',
    forecast_days: '7',
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data: OpenMeteoResponse = await response.json();
  const currentCondition = weatherCodeToCondition(data.current.weather_code);

  const daily = data.daily.time.map((date, index) => {
    const condition = weatherCodeToCondition(data.daily.weather_code[index]);
    return {
      date,
      dayLabel: formatDayLabel(date),
      high: Math.round(data.daily.temperature_2m_max[index]),
      low: Math.round(data.daily.temperature_2m_min[index]),
      condition,
      conditionLabel: getConditionLabel(condition),
    };
  });

  return {
    locationName,
    current: {
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      condition: currentCondition,
      conditionLabel: getConditionLabel(currentCondition),
    },
    daily,
  };
}
