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
}

export interface DailyForecast {
  date: string;
  dayLabel: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  conditionLabel: string;
}

export interface HourlyForecast {
  time: string;
  hourLabel: string;
  temperature: number;
  condition: WeatherCondition;
}

export interface WeatherData {
  locationName: string;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}
