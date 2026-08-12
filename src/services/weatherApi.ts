import { HourlyForecast, WeatherData } from '../types/weather';
import {
  formatDayLabel,
  formatHourLabel,
  getConditionLabel,
  weatherCodeToCondition,
} from '../utils/weatherCode';

const HOURLY_FORECAST_COUNT = 6;

interface OpenMeteoResponse {
  timezone: string;
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    uv_index: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

function mapUpcomingHourlyForecasts(
  times: string[],
  temperatures: number[],
  weatherCodes: number[]
): HourlyForecast[] {
  const now = Date.now();
  const hourly: HourlyForecast[] = [];

  for (let i = 0; i < times.length && hourly.length < HOURLY_FORECAST_COUNT; i++) {
    if (new Date(times[i]).getTime() <= now) {
      continue;
    }

    const condition = weatherCodeToCondition(weatherCodes[i]);
    hourly.push({
      time: times[i],
      hourLabel: formatHourLabel(times[i]),
      temperature: Math.round(temperatures[i]),
      condition,
    });
  }

  return hourly;
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
  locationName: string,
  countryCode: string
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,uv_index,is_day',
    hourly: 'temperature_2m,weather_code',
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

  const hourly = mapUpcomingHourlyForecasts(
    data.hourly.time,
    data.hourly.temperature_2m,
    data.hourly.weather_code
  );

  return {
    locationName,
    timezone: data.timezone,
    countryCode,
    current: {
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      uvIndex: data.current.uv_index,
      isDay: data.current.is_day === 1,
      condition: currentCondition,
      conditionLabel: getConditionLabel(currentCondition),
    },
    hourly,
    daily,
  };
}
