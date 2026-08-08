import { WeatherCondition } from '../types/weather';

export interface WeatherTheme {
  gradient: [string, string, string];
  accent: string;
  text: string;
  cardBackground: string;
}

const themes: Record<WeatherCondition, WeatherTheme> = {
  clear: {
    gradient: ['#2E5F9E', '#4A7FA8', '#B8943A'],
    accent: '#FFD700',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.28)',
  },
  partlyCloudy: {
    gradient: ['#3D5A7A', '#5C7A96', '#7A8FA3'],
    accent: '#E8F0FE',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.28)',
  },
  cloudy: {
    gradient: ['#2D3748', '#4A5568', '#5A6578'],
    accent: '#E2E8F0',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.32)',
  },
  fog: {
    gradient: ['#4A5568', '#5A6578', '#6B7A8F'],
    accent: '#EDF2F7',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.3)',
  },
  rain: {
    gradient: ['#1A365D', '#2C5282', '#3D6A9E'],
    accent: '#90CDF4',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.32)',
  },
  snow: {
    gradient: ['#6B7F94', '#8499AD', '#9BB0C4'],
    accent: '#FFFFFF',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.25)',
  },
  thunderstorm: {
    gradient: ['#0F1419', '#1A202C', '#2D3748'],
    accent: '#F6E05E',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.35)',
  },
};

export function getWeatherTheme(condition: WeatherCondition): WeatherTheme {
  return themes[condition];
}

export function getWeatherEmoji(condition: WeatherCondition): string {
  const emojis: Record<WeatherCondition, string> = {
    clear: '☀️',
    partlyCloudy: '⛅',
    cloudy: '☁️',
    fog: '🌫️',
    rain: '🌧️',
    snow: '❄️',
    thunderstorm: '⛈️',
  };
  return emojis[condition];
}
