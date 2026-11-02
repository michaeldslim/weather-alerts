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
      cityId?: number;
    };

export const MAX_SAVED_CITIES = 5;

export interface SavedCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  label: string;
}

export function savedCityFromLocationResult(location: LocationResult): SavedCity {
  return {
    id: location.id,
    name: location.name,
    latitude: location.latitude,
    longitude: location.longitude,
    countryCode: location.countryCode,
    label: formatLocationLabel(location),
  };
}

export function savedCityToManualSource(city: SavedCity): LocationSource {
  return {
    type: 'manual',
    latitude: city.latitude,
    longitude: city.longitude,
    name: city.label,
    countryCode: city.countryCode,
    cityId: city.id,
  };
}

export function locationSourceCacheKey(source: LocationSource): string {
  if (source.type === 'gps') {
    return 'gps';
  }

  if (source.cityId !== undefined) {
    return `city:${source.cityId}`;
  }

  return `coord:${source.latitude.toFixed(4)},${source.longitude.toFixed(4)}`;
}

export function locationSourcesEqual(a: LocationSource, b: LocationSource): boolean {
  if (a.type === 'gps' && b.type === 'gps') {
    return true;
  }

  if (a.type === 'manual' && b.type === 'manual') {
    if (a.cityId !== undefined && b.cityId !== undefined) {
      return a.cityId === b.cityId;
    }

    return a.latitude === b.latitude && a.longitude === b.longitude;
  }

  return false;
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
