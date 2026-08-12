export type AirQualityCategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export function getAirQualityCategory(aqi: number): AirQualityCategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getAirQualityAccent(aqi: number): string {
  if (aqi <= 50) return '#68D391';
  if (aqi <= 100) return '#F6E05E';
  if (aqi <= 150) return '#F6AD55';
  if (aqi <= 200) return '#FC8181';
  if (aqi <= 300) return '#E53E3E';
  return '#9B2C2C';
}

export const AIR_QUALITY_SCALE_MAX = 300;

export const AIR_QUALITY_SCALE_SEGMENTS = [
  { upTo: 50, color: '#68D391' },
  { upTo: 100, color: '#F6E05E' },
  { upTo: 150, color: '#F6AD55' },
  { upTo: 200, color: '#FC8181' },
  { upTo: 300, color: '#E53E3E' },
] as const;
