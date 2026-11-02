import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_SAVED_CITIES, SavedCity } from '../types/location';

const SAVED_CITIES_KEY = 'savedCities';

function isSavedCity(value: unknown): value is SavedCity {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const city = value as SavedCity;
  return (
    typeof city.id === 'number' &&
    typeof city.name === 'string' &&
    typeof city.latitude === 'number' &&
    typeof city.longitude === 'number' &&
    typeof city.countryCode === 'string' &&
    typeof city.label === 'string'
  );
}

export async function loadSavedCities(): Promise<SavedCity[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_CITIES_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isSavedCity).slice(0, MAX_SAVED_CITIES);
  } catch {
    return [];
  }
}

export async function saveSavedCities(cities: SavedCity[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      SAVED_CITIES_KEY,
      JSON.stringify(cities.slice(0, MAX_SAVED_CITIES))
    );
  } catch {
    // Ignore write failures; in-memory list still works for this session.
  }
}

export function upsertSavedCity(cities: SavedCity[], next: SavedCity): SavedCity[] {
  const withoutDuplicate = cities.filter((city) => city.id !== next.id);
  return [next, ...withoutDuplicate].slice(0, MAX_SAVED_CITIES);
}

export function removeSavedCityById(cities: SavedCity[], cityId: number): SavedCity[] {
  return cities.filter((city) => city.id !== cityId);
}
