import { TemperatureUnit } from './temperature';

const MPH_TO_KMH = 1.609344;

export function convertWindSpeed(mph: number, unit: TemperatureUnit): number {
  return unit === 'F' ? mph : Math.round(mph * MPH_TO_KMH);
}

export function formatWindSpeed(mph: number, unit: TemperatureUnit): string {
  const value = convertWindSpeed(mph, unit);
  return unit === 'F' ? `${value} mph` : `${value} km/h`;
}
