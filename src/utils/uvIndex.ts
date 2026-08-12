export function getUvIndexAbbrev(uvIndex: number): 'L' | 'M' | 'H' | 'E' {
  if (uvIndex < 3) return 'L';
  if (uvIndex < 6) return 'M';
  if (uvIndex < 8) return 'H';
  return 'E';
}

export function getUvIndexCategory(uvIndex: number): string {
  if (uvIndex < 3) return 'Low';
  if (uvIndex < 6) return 'Moderate';
  if (uvIndex < 8) return 'High';
  if (uvIndex < 11) return 'Very High';
  return 'Extreme';
}

export function getUvIndexAccent(uvIndex: number): string {
  if (uvIndex < 3) return '#68D391';
  if (uvIndex < 6) return '#F6E05E';
  if (uvIndex < 8) return '#F6AD55';
  if (uvIndex < 11) return '#FC8181';
  return '#9F7AEA';
}

export const UV_INDEX_SCALE_MAX = 11;

export const UV_INDEX_SCALE_SEGMENTS = [
  { upTo: 2, color: '#68D391' },
  { upTo: 5, color: '#F6E05E' },
  { upTo: 7, color: '#F6AD55' },
  { upTo: 10, color: '#FC8181' },
  { upTo: UV_INDEX_SCALE_MAX, color: '#9F7AEA' },
] as const;

export function formatUvIndexWithLevel(uvIndex: number): string {
  return `${Math.round(uvIndex)} (${getUvIndexAbbrev(uvIndex)})`;
}
