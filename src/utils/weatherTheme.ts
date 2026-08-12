import { WeatherCondition } from '../types/weather';

export interface WeatherTheme {
  gradient: [string, string, string];
  accent: string;
  text: string;
  cardBackground: string;
}

const dayThemes: Record<WeatherCondition, WeatherTheme> = {
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

const nightThemes: Record<WeatherCondition, WeatherTheme> = {
  clear: {
    gradient: ['#0B1026', '#141E3A', '#1E2A4A'],
    accent: '#C4D4F0',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.35)',
  },
  partlyCloudy: {
    gradient: ['#101827', '#1F2937', '#374151'],
    accent: '#CBD5E0',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.32)',
  },
  cloudy: {
    gradient: ['#111827', '#1F2937', '#374151'],
    accent: '#E2E8F0',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.35)',
  },
  fog: {
    gradient: ['#1A202C', '#2D3748', '#4A5568'],
    accent: '#EDF2F7',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.34)',
  },
  rain: {
    gradient: ['#0A1628', '#14213D', '#1E3A5F'],
    accent: '#90CDF4',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.36)',
  },
  snow: {
    gradient: ['#2D3748', '#4A5568', '#5A6578'],
    accent: '#E2E8F0',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.32)',
  },
  thunderstorm: {
    gradient: ['#05080C', '#0F1419', '#1A202C'],
    accent: '#F6E05E',
    text: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.38)',
  },
};

export function getWeatherTheme(
  condition: WeatherCondition,
  isDay = true
): WeatherTheme {
  return isDay ? dayThemes[condition] : nightThemes[condition];
}

export function getWeatherEmoji(condition: WeatherCondition, isDay = true): string {
  if (condition === 'clear') {
    return isDay ? '☀️' : '🌙';
  }

  const emojis: Record<Exclude<WeatherCondition, 'clear'>, string> = {
    partlyCloudy: '⛅',
    cloudy: '☁️',
    fog: '🌫️',
    rain: '🌧️',
    snow: '❄️',
    thunderstorm: '⛈️',
  };

  return emojis[condition];
}
