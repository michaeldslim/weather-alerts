export function formatPrecipitationAmount(inches: number): string {
  if (inches < 0.05) {
    return 'Trace';
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
  amountInches: number
): string {
  if (chancePercent <= 0 && amountInches < 0.05) {
    return '—';
  }

  const chance = formatPrecipitationChance(chancePercent);
  if (amountInches < 0.05) {
    return chance;
  }

  return `${chance} · ${formatPrecipitationAmount(amountInches)}`;
}
