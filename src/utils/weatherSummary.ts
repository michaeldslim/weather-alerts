import {
  convertTemperature,
  formatTemperature,
  TemperatureUnit,
} from './temperature';

export function buildTodaySummary(
  conditionLabel: string,
  high: number,
  low: number,
  unit: TemperatureUnit
): string {
  const displayHigh = convertTemperature(high, unit);
  const displayLow = convertTemperature(low, unit);

  return `${conditionLabel} today. High ${formatTemperature(displayHigh, unit)}, low ${formatTemperature(displayLow, unit)}.`;
}
