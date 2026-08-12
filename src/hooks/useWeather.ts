import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWeatherAlerts } from '../services/alertsApi';
import { fetchAirQuality } from '../services/airQualityApi';
import { notifyWeatherAlerts } from '../services/notificationService';
import { fetchWeather } from '../services/weatherApi';
import {
  loadWeatherSnapshot,
  saveWeatherSnapshot,
} from '../services/weatherCacheStorage';
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
  refreshing: boolean;
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
  countryCode: string;
}> {
  let latitude = DEFAULT_LOCATION.latitude;
  let longitude = DEFAULT_LOCATION.longitude;
  let locationName = DEFAULT_LOCATION.name;
  let countryCode = 'US';

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') {
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: 600_000 })) ??
      (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }));

    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    const [place] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    if (place) {
      locationName = place.city ?? place.subregion ?? place.region ?? locationName;
      countryCode = place.isoCountryCode ?? countryCode;
    }
  }

  return { latitude, longitude, name: locationName, countryCode };
}

export function useWeather(): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource>({ type: 'gps' });
  const locationSourceRef = useRef<LocationSource>({ type: 'gps' });
  const weatherRef = useRef<WeatherData | null>(null);
  const previousAlertIdsRef = useRef<Set<string>>(new Set());
  const skipNextNotificationRef = useRef(true);
  const loadInFlightRef = useRef(false);

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
    if (loadInFlightRef.current) {
      return;
    }

    const hasCachedWeather = weatherRef.current !== null;
    loadInFlightRef.current = true;

    if (hasCachedWeather) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const activeSource = locationSourceRef.current;
      let latitude: number;
      let longitude: number;
      let locationName: string;
      let countryCode: string;

      if (activeSource.type === 'manual') {
        latitude = activeSource.latitude;
        longitude = activeSource.longitude;
        locationName = activeSource.name;
        countryCode = activeSource.countryCode;
      } else {
        const gpsLocation = await resolveGpsLocation();
        latitude = gpsLocation.latitude;
        longitude = gpsLocation.longitude;
        locationName = gpsLocation.name;
        countryCode = gpsLocation.countryCode;
      }

      const [data, alertData, airQuality] = await Promise.all([
        fetchWeather(latitude, longitude, locationName, countryCode),
        fetchWeatherAlerts(latitude, longitude),
        fetchAirQuality(latitude, longitude),
      ]);

      if (!data.insights) {
        throw new Error('Missing weather insights');
      }

      const weatherData: WeatherData = {
        ...data,
        insights: {
          ...data.insights,
          airQuality,
        },
      };

      weatherRef.current = weatherData;
      setWeather(weatherData);
      setAlerts(alertData);
      handleAlertsUpdate(alertData);

      void saveWeatherSnapshot({
        weather: weatherData,
        alerts: alertData,
        locationSource: locationSourceRef.current,
        savedAt: new Date().toISOString(),
      });
    } catch (err) {
      if (!weatherRef.current) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      loadInFlightRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [handleAlertsUpdate]);

  const loadWeatherRef = useRef(loadWeather);
  loadWeatherRef.current = loadWeather;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const snapshot = await loadWeatherSnapshot();
      if (cancelled) {
        return;
      }

      if (snapshot) {
        weatherRef.current = snapshot.weather;
        setWeather(snapshot.weather);
        setAlerts(snapshot.alerts);
        locationSourceRef.current = snapshot.locationSource;
        setLocationSource(snapshot.locationSource);
        setLoading(false);
      }

      await loadWeatherRef.current();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(() => loadWeather(), [loadWeather]);

  const selectLocation = useCallback(
    async (location: LocationResult) => {
      const manualSource: LocationSource = {
        type: 'manual',
        latitude: location.latitude,
        longitude: location.longitude,
        name: formatLocationLabel(location),
        countryCode: location.countryCode,
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
    refreshing,
    error,
    locationSource,
    refresh,
    selectLocation,
    useCurrentLocation,
  };
}
