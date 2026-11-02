import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
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
  loadSavedCities,
  removeSavedCityById,
  saveSavedCities,
  upsertSavedCity,
} from '../services/savedCitiesStorage';
import {
  locationSourceCacheKey,
  locationSourcesEqual,
  LocationResult,
  LocationSource,
  SavedCity,
  savedCityFromLocationResult,
  savedCityToManualSource,
} from '../types/location';
import { WeatherData } from '../types/weather';
import { buildCityRotation, findRotationIndex } from '../utils/cityRotation';

const DEFAULT_LOCATION = {
  latitude: 40.7128,
  longitude: -74.006,
  name: 'New York',
};

/** Max wait for a fresh GPS fix before using NYC fallback (simulator / no signal). */
const GPS_FIX_TIMEOUT_MS = 5_000;
const REVERSE_GEOCODE_TIMEOUT_MS = 4_000;

type ResolvedLocation = {
  latitude: number;
  longitude: number;
  name: string;
  countryCode: string;
};

function rejectAfter(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('timeout')), ms);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, rejectAfter(ms)]);
}

interface UseWeatherResult {
  weather: WeatherData | null;
  alerts: WeatherAlert[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  locationSource: LocationSource;
  savedCities: SavedCity[];
  cityRotationCount: number;
  cityRotationIndex: number;
  canSwipeCities: boolean;
  cityRotation: LocationSource[];
  getCityPageData: (source: LocationSource) => {
    weather: WeatherData | null;
    alerts: WeatherAlert[];
    isActive: boolean;
  };
  refresh: () => Promise<void>;
  selectLocation: (location: LocationResult, saveToList: boolean) => Promise<void>;
  selectSavedCity: (city: SavedCity) => Promise<void>;
  removeSavedCity: (cityId: number) => Promise<void>;
  useCurrentLocation: () => Promise<void>;
  goToCityAtIndex: (index: number) => Promise<void>;
}

function getFallbackLocation(): ResolvedLocation {
  return {
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    name: DEFAULT_LOCATION.name,
    countryCode: 'US',
  };
}

async function labelGpsCoordinates(
  latitude: number,
  longitude: number,
  fallback: ResolvedLocation
): Promise<ResolvedLocation> {
  let locationName = fallback.name;
  let countryCode = fallback.countryCode;

  try {
    const [place] = await withTimeout(
      Location.reverseGeocodeAsync({ latitude, longitude }),
      REVERSE_GEOCODE_TIMEOUT_MS
    );
    if (place) {
      locationName = place.city ?? place.subregion ?? place.region ?? locationName;
      countryCode = place.isoCountryCode ?? countryCode;
    } else {
      locationName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
    }
  } catch {
    locationName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
  }

  return { latitude, longitude, name: locationName, countryCode };
}

async function resolveGpsLocation(): Promise<ResolvedLocation> {
  const fallback = getFallbackLocation();

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return fallback;
    }

    const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 600_000 });
    if (lastKnown) {
      const { latitude, longitude } = lastKnown.coords;
      return labelGpsCoordinates(latitude, longitude, fallback);
    }

    const position = await withTimeout(
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      }),
      GPS_FIX_TIMEOUT_MS
    );

    const { latitude, longitude } = position.coords;
    return labelGpsCoordinates(latitude, longitude, fallback);
  } catch {
    return fallback;
  }
}

export function useWeather(): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource>({ type: 'gps' });
  const [savedCities, setSavedCities] = useState<SavedCity[]>([]);
  const locationSourceRef = useRef<LocationSource>({ type: 'gps' });
  const savedCitiesRef = useRef<SavedCity[]>([]);
  const weatherCacheRef = useRef<
    Map<string, { weather: WeatherData; alerts: WeatherAlert[] }>
  >(new Map());
  /** Cache key for the city currently shown in `weather` state (avoids stale cross-city flash). */
  const weatherSourceKeyRef = useRef<string | null>(null);
  const weatherRef = useRef<WeatherData | null>(null);
  const previousAlertIdsRef = useRef<Set<string>>(new Set());
  const skipNextNotificationRef = useRef(true);
  const loadInFlightRef = useRef(false);
  const initialLoadCompleteRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

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
      const loadedKey = locationSourceCacheKey(locationSourceRef.current);
      weatherSourceKeyRef.current = loadedKey;
      weatherCacheRef.current.set(loadedKey, {
        weather: weatherData,
        alerts: alertData,
      });

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

  const persistSavedCities = useCallback((cities: SavedCity[]) => {
    savedCitiesRef.current = cities;
    setSavedCities(cities);
    void saveSavedCities(cities);
  }, []);

  const applyLocationSource = useCallback(
    async (source: LocationSource) => {
      locationSourceRef.current = source;
      skipNextNotificationRef.current = true;

      const sourceKey = locationSourceCacheKey(source);
      const cached = weatherCacheRef.current.get(sourceKey);
      if (cached) {
        weatherRef.current = cached.weather;
        weatherSourceKeyRef.current = sourceKey;
        setWeather(cached.weather);
        setAlerts(cached.alerts);
      } else {
        weatherSourceKeyRef.current = null;
      }

      setLocationSource(source);
      await loadWeather();
    },
    [loadWeather]
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [snapshot, storedCities] = await Promise.all([
        loadWeatherSnapshot(),
        loadSavedCities(),
      ]);
      if (cancelled) {
        return;
      }

      savedCitiesRef.current = storedCities;
      setSavedCities(storedCities);

      if (snapshot) {
        weatherRef.current = snapshot.weather;
        setWeather(snapshot.weather);
        setAlerts(snapshot.alerts);
        locationSourceRef.current = snapshot.locationSource;
        setLocationSource(snapshot.locationSource);
        const snapshotKey = locationSourceCacheKey(snapshot.locationSource);
        weatherSourceKeyRef.current = snapshotKey;
        weatherCacheRef.current.set(snapshotKey, {
          weather: snapshot.weather,
          alerts: snapshot.alerts,
        });
        setLoading(false);
      }

      await loadWeatherRef.current();
      initialLoadCompleteRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (!initialLoadCompleteRef.current) {
        return;
      }

      if (previousAppState.match(/inactive|background/) && nextAppState === 'active') {
        void loadWeatherRef.current();
      }
    });

    return () => subscription.remove();
  }, []);

  const refresh = useCallback(() => loadWeather(), [loadWeather]);

  const selectLocation = useCallback(
    async (location: LocationResult, saveToList: boolean) => {
      const city = savedCityFromLocationResult(location);
      if (saveToList) {
        const nextSaved = upsertSavedCity(savedCitiesRef.current, city);
        persistSavedCities(nextSaved);
      }
      await applyLocationSource(savedCityToManualSource(city));
    },
    [applyLocationSource, persistSavedCities]
  );

  const selectSavedCity = useCallback(
    async (city: SavedCity) => {
      await applyLocationSource(savedCityToManualSource(city));
    },
    [applyLocationSource]
  );

  const removeSavedCity = useCallback(
    async (cityId: number) => {
      const removed = savedCitiesRef.current.find((city) => city.id === cityId);
      if (!removed) {
        return;
      }

      const nextSaved = removeSavedCityById(savedCitiesRef.current, cityId);
      persistSavedCities(nextSaved);
      weatherCacheRef.current.delete(locationSourceCacheKey(savedCityToManualSource(removed)));

      if (locationSourcesEqual(locationSourceRef.current, savedCityToManualSource(removed))) {
        await applyLocationSource({ type: 'gps' });
      }
    },
    [applyLocationSource, persistSavedCities]
  );

  const useCurrentLocation = useCallback(async () => {
    await applyLocationSource({ type: 'gps' });
  }, [applyLocationSource]);

  const goToCityAtIndex = useCallback(
    async (index: number) => {
      const rotation = buildCityRotation(
        savedCitiesRef.current,
        locationSourceRef.current
      );
      const source = rotation[index];
      if (!source || locationSourcesEqual(source, locationSourceRef.current)) {
        return;
      }

      await applyLocationSource(source);
    },
    [applyLocationSource]
  );

  const cityRotation = buildCityRotation(savedCities, locationSource);
  const cityRotationIndex = findRotationIndex(cityRotation, locationSource);
  const cityRotationCount = cityRotation.length;
  const canSwipeCities = cityRotationCount > 1;

  const getCityPageData = useCallback(
    (source: LocationSource) => {
      const sourceKey = locationSourceCacheKey(source);
      const cached = weatherCacheRef.current.get(sourceKey);
      const isActive = locationSourcesEqual(source, locationSource);

      if (isActive) {
        if (weather && weatherSourceKeyRef.current === sourceKey) {
          return { weather, alerts, isActive: true };
        }

        if (cached) {
          return { weather: cached.weather, alerts: cached.alerts, isActive: true };
        }

        return { weather: null, alerts: [], isActive: true };
      }

      return {
        weather: cached?.weather ?? null,
        alerts: cached?.alerts ?? [],
        isActive: false,
      };
    },
    [alerts, locationSource, weather]
  );

  return {
    weather,
    alerts,
    loading,
    refreshing,
    error,
    locationSource,
    savedCities,
    cityRotationCount,
    cityRotationIndex,
    canSwipeCities,
    cityRotation,
    getCityPageData,
    refresh,
    selectLocation,
    selectSavedCity,
    removeSavedCity,
    useCurrentLocation,
    goToCityAtIndex,
  };
}
