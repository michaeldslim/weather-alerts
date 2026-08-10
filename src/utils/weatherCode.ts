import { WeatherCondition } from '../types/weather';

const conditionLabels: Record<WeatherCondition, string> = {
  clear: 'Clear',
  partlyCloudy: 'Partly Cloudy',
  cloudy: 'Cloudy',
  fog: 'Foggy',
  rain: 'Rainy',
  snow: 'Snowy',
  thunderstorm: 'Thunderstorm',
};

export function weatherCodeToCondition(code: number): WeatherCondition {
  if (code === 0) return 'clear';
  if (code <= 3) return 'partlyCloudy';
  if (code <= 48) return 'cloudy';
  if (code <= 57) return 'fog';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'rain';
  if (code <= 86) return 'snow';
  return 'thunderstorm';
}

export function getConditionLabel(condition: WeatherCondition): string {
  return conditionLabels[condition];
}

export function formatDayLabel(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  if (date.toDateString() === today.toDateString()) return 'Today';

  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatHourLabel(dateTime: string): string {
  return new Date(dateTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
  });
}
