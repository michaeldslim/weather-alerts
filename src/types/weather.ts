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
}

export interface DailyForecast {
  date: string;
  dayLabel: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  conditionLabel: string;
}

export interface WeatherData {
  locationName: string;
  current: CurrentWeather;
  daily: DailyForecast[];
}
