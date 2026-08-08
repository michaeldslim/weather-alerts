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
