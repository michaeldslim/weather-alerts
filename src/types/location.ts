export interface LocationResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  admin1?: string;
}

export type LocationSource =
  | { type: 'gps' }
  | {
      type: 'manual';
      latitude: number;
      longitude: number;
      name: string;
      countryCode: string;
    };

export function shouldShowLocalTime(countryCode: string | undefined): boolean {
  return countryCode !== undefined && countryCode.toUpperCase() !== 'US';
}

export function formatLocationLabel(location: LocationResult): string {
  const { name, admin1, country } = location;

  if (admin1 && admin1.toLowerCase() !== name.toLowerCase()) {
    return `${name}, ${admin1}`;
  }

  if (country && country.toLowerCase() !== name.toLowerCase()) {
    return `${name}, ${country}`;
  }

  return name;
}
