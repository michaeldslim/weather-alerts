export type WeatherAlertSeverity =
  | 'Extreme'
  | 'Severe'
  | 'Moderate'
  | 'Minor'
  | 'Unknown';

export interface WeatherAlert {
  id: string;
  event: string;
  headline: string;
  severity: WeatherAlertSeverity;
  description: string;
  areaDesc: string;
  expires: string;
}
