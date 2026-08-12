import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  CollapsingLocationHeaderScrollContent,
  CollapsingLocationHeaderStickyOverlay,
  LOCATION_COLLAPSE_END,
} from './src/components/CollapsingLocationHeader';
import { LocationSearchModal } from './src/components/LocationSearchModal';
import { TodayCard } from './src/components/TodayCard';
import { WeatherAlertsCard } from './src/components/WeatherAlertsCard';
import { WeatherInsightsCard } from './src/components/WeatherInsightsCard';
import { WeatherBackground } from './src/components/WeatherBackground';
import { WeeklyForecastCard } from './src/components/WeeklyForecastCard';
import { useWeather } from './src/hooks/useWeather';
import { useTemperatureUnit } from './src/hooks/useTemperatureUnit';
import { ensureNotificationPermissions } from './src/services/notificationService';
import { buildTodaySummary } from './src/utils/weatherSummary';
import { getWeatherTheme } from './src/utils/weatherTheme';
import { shouldShowLocalTime } from './src/types/location';

export default function App() {
  const {
    weather,
    alerts,
    loading,
    refreshing,
    error,
    refresh,
    selectLocation,
    useCurrentLocation,
  } = useWeather();
  const { unit, toggleUnit } = useTemperatureUnit();
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationSticky, setLocationSticky] = useState(false);
  const notificationSetupDoneRef = useRef(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!weather || notificationSetupDoneRef.current) {
      return;
    }

    notificationSetupDoneRef.current = true;
    void ensureNotificationPermissions();
  }, [weather]);

  if (loading && !weather) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.loadingText}>Loading weather...</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Unable to load weather'}</Text>
        <Pressable style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
        <StatusBar style="dark" />
      </View>
    );
  }

  const theme = getWeatherTheme(weather.current.condition, weather.current.isDay);
  const statusBarStyle = 'light';
  const today = weather.daily[0];
  const todaySummary = today
    ? buildTodaySummary(today.conditionLabel, today.high, today.low, unit)
    : '';
  const openLocationSearch = () => setLocationModalVisible(true);
  const showLocalTime = shouldShowLocalTime(weather.countryCode);
  const locationHeaderProps = {
    locationName: weather.locationName,
    timezone: weather.timezone,
    showLocalTime,
    textColor: theme.text,
    accentColor: theme.accent,
    cardBackground: theme.cardBackground,
    scrollY,
    onPress: openLocationSearch,
  };

  return (
    <SafeAreaProvider>
      <WeatherBackground condition={weather.current.condition} isDay={weather.current.isDay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.screen}>
            <CollapsingLocationHeaderStickyOverlay
              {...locationHeaderProps}
              stickyActive={locationSticky}
            />
            <Animated.ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                {
                  useNativeDriver: true,
                  listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    setLocationSticky(offsetY >= LOCATION_COLLAPSE_END * 0.35);
                  },
                }
              )}
            >
              <View style={styles.headerRow}>
                <Text style={[styles.header, { color: theme.text }]}>Weather Alerts</Text>
                <Pressable
                  onPress={refresh}
                  disabled={refreshing}
                  style={[
                    styles.refreshChip,
                    { backgroundColor: theme.cardBackground },
                    refreshing && styles.refreshChipDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Refresh weather"
                >
                  {refreshing ? (
                    <ActivityIndicator size="small" color={theme.accent} />
                  ) : (
                    <Text style={[styles.refreshChipText, { color: theme.accent }]}>
                      Refresh
                    </Text>
                  )}
                </Pressable>
              </View>
              <CollapsingLocationHeaderScrollContent {...locationHeaderProps} />
              <WeatherAlertsCard alerts={alerts} theme={theme} />
              <TodayCard
                summary={todaySummary}
                current={weather.current}
                hourly={weather.hourly}
                unit={unit}
                onToggleUnit={toggleUnit}
              />
              {weather.insights ? (
                <WeatherInsightsCard
                  insights={weather.insights}
                  timezone={weather.timezone}
                  uvIndex={weather.current.uvIndex}
                  theme={theme}
                />
              ) : null}
              <WeeklyForecastCard
                daily={weather.daily}
                accentCondition={weather.current.condition}
                isDay={weather.current.isDay}
                unit={unit}
              />
            </Animated.ScrollView>
          </View>
        </SafeAreaView>
        <LocationSearchModal
          visible={locationModalVisible}
          theme={theme}
          onClose={() => setLocationModalVisible(false)}
          onSelect={selectLocation}
          onUseCurrentLocation={useCurrentLocation}
        />
        <StatusBar style={statusBarStyle} />
      </WeatherBackground>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  header: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
  },
  refreshChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshChipDisabled: {
    opacity: 0.7,
  },
  refreshChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4A5568',
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
