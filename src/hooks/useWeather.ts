import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { fetchWeatherAlerts } from '../services/alertsApi';
import { notifyWeatherAlerts } from '../services/notificationService';
import { fetchWeather } from '../services/weatherApi';
import { WeatherAlert } from '../types/alert';
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
  alerts: WeatherAlert[];
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
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource>({ type: 'gps' });
  const locationSourceRef = useRef<LocationSource>({ type: 'gps' });
  const previousAlertIdsRef = useRef<Set<string>>(new Set());
  const skipNextNotificationRef = useRef(true);
  const loadGenerationRef = useRef(0);
  const hasInitiallyLoadedRef = useRef(false);

  const handleAlertsUpdate = useCallback((nextAlerts: WeatherAlert[]) => {
    const currentIds = new Set(nextAlerts.map((alert) => alert.id));

    if (skipNextNotificationRef.current) {
      previousAlertIdsRef.current = currentIds;
      skipNextNotificationRef.current = false;
      return;
    }

    const newAlerts = nextAlerts.filter((alert) => !previousAlertIdsRef.current.has(alert.id));
    if (newAlerts.length > 0) {
      void notifyWeatherAlerts(newAlerts);
    }

    previousAlertIdsRef.current = currentIds;
  }, []);

  const loadWeather = useCallback(async () => {
    const activeSource = locationSourceRef.current;
    const generation = ++loadGenerationRef.current;

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

      if (generation !== loadGenerationRef.current) {
        return;
      }

      const [data, alertData] = await Promise.all([
        fetchWeather(latitude, longitude, locationName),
        fetchWeatherAlerts(latitude, longitude),
      ]);

      if (generation !== loadGenerationRef.current) {
        return;
      }

      setWeather(data);
      setAlerts(alertData);
      handleAlertsUpdate(alertData);
    } catch (err) {
      if (generation !== loadGenerationRef.current) {
        return;
      }

      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      if (generation !== loadGenerationRef.current) {
        return;
      }

      setLoading(false);
      hasInitiallyLoadedRef.current = true;
    }
  }, [handleAlertsUpdate]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (!hasInitiallyLoadedRef.current) {
        return;
      }

      if (previousAppState.match(/inactive|background/) && nextAppState === 'active') {
        void loadWeather();
      }
    });

    return () => subscription.remove();
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
      skipNextNotificationRef.current = true;
      await loadWeather();
    },
    [loadWeather]
  );

  const useCurrentLocation = useCallback(async () => {
    const gpsSource: LocationSource = { type: 'gps' };
    locationSourceRef.current = gpsSource;
    setLocationSource(gpsSource);
    skipNextNotificationRef.current = true;
    await loadWeather();
  }, [loadWeather]);

  return {
    weather,
    alerts,
    loading,
    error,
    locationSource,
    refresh,
    selectLocation,
    useCurrentLocation,
  };
}
