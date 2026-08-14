import { TemperatureUnit } from './temperature';

const INCHES_TO_MM = 25.4;

export function formatPrecipitationAmount(
  inches: number,
  unit: TemperatureUnit = 'F'
): string {
  if (inches < 0.05) {
    return 'Trace';
  }

  if (unit === 'C') {
    const millimeters = inches * INCHES_TO_MM;
    if (millimeters < 2.5) {
      return '< 1 mm';
    }
    return `${millimeters.toFixed(1)} mm`;
  }

  if (inches < 0.1) {
    return '< 0.1 in';
  }

  return `${inches.toFixed(1)} in`;
}

export function formatPrecipitationChance(chancePercent: number): string {
  return `${Math.round(chancePercent)}%`;
}

export function formatDailyPrecipLabel(
  chancePercent: number,
  amountInches: number,
  unit: TemperatureUnit = 'F'
): string {
  if (chancePercent <= 0 && amountInches < 0.05) {
    return '—';
  }

  const chance = formatPrecipitationChance(chancePercent);
  if (amountInches < 0.05) {
    return chance;
  }

  return `${chance} · ${formatPrecipitationAmount(amountInches, unit)}`;
}
