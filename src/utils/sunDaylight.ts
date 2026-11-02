import { parseOpenMeteoLocalTime } from './localTime';
import { WeatherData } from '../types/weather';

function formatDurationMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatDaylightDuration(daylightMinutes: number): string {
  return formatDurationMinutes(daylightMinutes);
}

export function formatTimeInTimezone(isoTime: string, timezone: string): string {
  const instant = parseOpenMeteoLocalTime(isoTime, timezone);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(instant);
}

export function isCurrentlyDaylight(
  timezone: string,
  sunrise: string,
  sunset: string,
  now = Date.now()
): boolean {
  const sunriseMs = parseOpenMeteoLocalTime(sunrise, timezone).getTime();
  const sunsetMs = parseOpenMeteoLocalTime(sunset, timezone).getTime();
  return now >= sunriseMs && now < sunsetMs;
}

export function resolveIsDayForWeather(weather: WeatherData, now = Date.now()): boolean {
  const sun = weather.insights?.sun;
  if (sun && weather.timezone) {
    return isCurrentlyDaylight(weather.timezone, sun.sunrise, sun.sunset, now);
  }

  return weather.current.isDay;
}

export function buildSunStatus(
  sunrise: string,
  sunset: string,
  nextSunrise: string | null,
  timezone: string,
  now = Date.now()
): string {
  const sunriseMs = parseOpenMeteoLocalTime(sunrise, timezone).getTime();
  const sunsetMs = parseOpenMeteoLocalTime(sunset, timezone).getTime();

  if (now < sunriseMs) {
    return `Sunrise in ${formatDurationMinutes(Math.round((sunriseMs - now) / 60_000))}`;
  }

  if (now < sunsetMs) {
    return `Dark in ${formatDurationMinutes(Math.round((sunsetMs - now) / 60_000))}`;
  }

  if (nextSunrise) {
    const nextSunriseMs = parseOpenMeteoLocalTime(nextSunrise, timezone).getTime();
    return `Sunrise in ${formatDurationMinutes(Math.round((nextSunriseMs - now) / 60_000))}`;
  }

  return '';
}

export function computeDaylightMinutes(
  sunrise: string,
  sunset: string,
  timezone: string
): number {
  const durationMs =
    parseOpenMeteoLocalTime(sunset, timezone).getTime() -
    parseOpenMeteoLocalTime(sunrise, timezone).getTime();
  return Math.max(0, Math.round(durationMs / 60_000));
}
