import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherAlert } from '../types/alert';
import { LocationSource } from '../types/location';
import { WeatherData } from '../types/weather';

const WEATHER_CACHE_KEY = 'weatherSnapshot';

export interface WeatherSnapshot {
  weather: WeatherData;
  alerts: WeatherAlert[];
  locationSource: LocationSource;
  savedAt: string;
}

function isLocationSource(value: unknown): value is LocationSource {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const source = value as LocationSource;
  if (source.type === 'gps') {
    return true;
  }

  return (
    source.type === 'manual' &&
    typeof source.latitude === 'number' &&
    typeof source.longitude === 'number' &&
    typeof source.name === 'string' &&
    (source.countryCode === undefined || typeof source.countryCode === 'string')
  );
}

function isWeatherSnapshot(value: unknown): value is WeatherSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as WeatherSnapshot;
  return (
    typeof snapshot.savedAt === 'string' &&
    snapshot.weather != null &&
    typeof snapshot.weather.locationName === 'string' &&
    Array.isArray(snapshot.alerts) &&
    isLocationSource(snapshot.locationSource)
  );
}

export async function loadWeatherSnapshot(): Promise<WeatherSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isWeatherSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveWeatherSnapshot(snapshot: WeatherSnapshot): Promise<void> {
  try {
    await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore write failures; live data still works for this session.
  }
}
