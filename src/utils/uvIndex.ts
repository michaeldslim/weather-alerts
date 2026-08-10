export function getUvIndexAbbrev(uvIndex: number): 'L' | 'M' | 'H' | 'E' {
  if (uvIndex < 3) return 'L';
  if (uvIndex < 6) return 'M';
  if (uvIndex < 8) return 'H';
  return 'E';
}

export function formatUvIndexWithLevel(uvIndex: number): string {
  return `${Math.round(uvIndex)} (${getUvIndexAbbrev(uvIndex)})`;
}
