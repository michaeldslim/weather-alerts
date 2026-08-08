export type CountryCode = 'US' | 'KR' | 'JP';

export interface SupportedCountry {
  code: CountryCode;
  label: string;
}

export const SUPPORTED_COUNTRIES: SupportedCountry[] = [
  { code: 'US', label: 'United States' },
  { code: 'KR', label: 'South Korea' },
  { code: 'JP', label: 'Japan' },
];

export interface LocationResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export type LocationSource =
  | { type: 'gps' }
  | { type: 'manual'; latitude: number; longitude: number; name: string };

export function formatLocationLabel(location: LocationResult): string {
  if (location.admin1) {
    return `${location.name}, ${location.admin1}`;
  }
  return location.name;
}
