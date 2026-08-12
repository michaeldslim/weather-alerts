export type WeatherCondition =
  | 'clear'
  | 'partlyCloudy'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

export interface CurrentWeather {
  temperature: number;
  condition: WeatherCondition;
  conditionLabel: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  uvIndex: number;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  dayLabel: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  conditionLabel: string;
  precipChancePercent?: number;
  precipAmountInches?: number;
}

export interface HourlyForecast {
  time: string;
  hourLabel: string;
  temperature: number;
  condition: WeatherCondition;
}

export interface SunDaylight {
  sunrise: string;
  sunset: string;
  nextSunrise: string | null;
  daylightMinutes: number;
}

export interface AirQuality {
  aqi: number;
  category: string;
  pm25: number;
}

export interface WeatherInsights {
  sun: SunDaylight;
  airQuality: AirQuality | null;
}

export interface WeatherData {
  locationName: string;
  timezone: string;
  countryCode: string;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  insights?: WeatherInsights;
}
