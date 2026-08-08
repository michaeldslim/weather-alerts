export type TemperatureUnit = 'F' | 'C';

export function fahrenheitToCelsius(fahrenheit: number): number {
  return Math.round((fahrenheit - 32) * (5 / 9));
}

export function formatTemperature(value: number, unit: TemperatureUnit): string {
  return `${value}°${unit}`;
}

export function convertTemperature(value: number, unit: TemperatureUnit): number {
  return unit === 'F' ? value : fahrenheitToCelsius(value);
}
