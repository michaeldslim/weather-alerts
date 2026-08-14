import { WeatherCondition } from '../types/weather';
import { getTimezoneCalendarDateKey, parseOpenMeteoLocalTime } from './localTime';

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

export function formatDayLabel(dateString: string, timezone: string, now = new Date()): string {
  if (dateString === getTimezoneCalendarDateKey(timezone, now)) {
    return 'Today';
  }

  const [year, month, day] = dateString.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day))
  );
}

export function formatHourLabel(dateTime: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    timeZone: timezone,
  }).format(parseOpenMeteoLocalTime(dateTime, timezone));
}
