import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWeather } from '../services/weatherApi';
import {
  formatLocationLabel,
  LocationResult,
  LocationSource,
} from '../types/location';
import { WeatherData } from '../types/weather';

const DEFAULT_LOCATION = {
  latitude: 40.7128,
  longitude: -74.006,
  name: 'New York',
};

interface UseWeatherResult {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  locationSource: LocationSource;
  refresh: () => Promise<void>;
  selectLocation: (location: LocationResult) => Promise<void>;
  useCurrentLocation: () => Promise<void>;
}

async function resolveGpsLocation(): Promise<{
  latitude: number;
  longitude: number;
  name: string;
}> {
  let latitude = DEFAULT_LOCATION.latitude;
  let longitude = DEFAULT_LOCATION.longitude;
  let locationName = DEFAULT_LOCATION.name;

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    const [place] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    if (place) {
      locationName = place.city ?? place.subregion ?? place.region ?? locationName;
    }
  }

  return { latitude, longitude, name: locationName };
}

export function useWeather(): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource>({ type: 'gps' });
  const locationSourceRef = useRef<LocationSource>({ type: 'gps' });

  const loadWeather = useCallback(async () => {
    const activeSource = locationSourceRef.current;

    setLoading(true);
    setError(null);

    try {
      let latitude: number;
      let longitude: number;
      let locationName: string;

      if (activeSource.type === 'manual') {
        latitude = activeSource.latitude;
        longitude = activeSource.longitude;
        locationName = activeSource.name;
      } else {
        const gpsLocation = await resolveGpsLocation();
        latitude = gpsLocation.latitude;
        longitude = gpsLocation.longitude;
        locationName = gpsLocation.name;
      }

      const data = await fetchWeather(latitude, longitude, locationName);
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const refresh = useCallback(() => loadWeather(), [loadWeather]);

  const selectLocation = useCallback(
    async (location: LocationResult) => {
      const manualSource: LocationSource = {
        type: 'manual',
        latitude: location.latitude,
        longitude: location.longitude,
        name: formatLocationLabel(location),
      };
      locationSourceRef.current = manualSource;
      setLocationSource(manualSource);
      await loadWeather();
    },
    [loadWeather]
  );

  const useCurrentLocation = useCallback(async () => {
    const gpsSource: LocationSource = { type: 'gps' };
    locationSourceRef.current = gpsSource;
    setLocationSource(gpsSource);
    await loadWeather();
  }, [loadWeather]);

  return {
    weather,
    loading,
    error,
    locationSource,
    refresh,
    selectLocation,
    useCurrentLocation,
  };
}
