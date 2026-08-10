import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LocationSearchModal } from './src/components/LocationSearchModal';
import { TodayCard } from './src/components/TodayCard';
import { WeatherAlertsCard } from './src/components/WeatherAlertsCard';
import { WeatherBackground } from './src/components/WeatherBackground';
import { WeeklyForecastCard } from './src/components/WeeklyForecastCard';
import { useWeather } from './src/hooks/useWeather';
import { useTemperatureUnit } from './src/hooks/useTemperatureUnit';
import { ensureNotificationPermissions } from './src/services/notificationService';
import { getWeatherTheme } from './src/utils/weatherTheme';

export default function App() {
  const { weather, alerts, loading, error, refresh, selectLocation, useCurrentLocation } =
    useWeather();
  const { unit, toggleUnit } = useTemperatureUnit();
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    void ensureNotificationPermissions();
  }, []);

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

  const theme = getWeatherTheme(weather.current.condition);
  const statusBarStyle = 'light';

  return (
    <SafeAreaProvider>
      <WeatherBackground condition={weather.current.condition}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerRow}>
              <Text style={[styles.header, { color: theme.text }]}>Weather Alerts</Text>
              <Pressable
                onPress={refresh}
                disabled={loading}
                style={[
                  styles.refreshChip,
                  { backgroundColor: theme.cardBackground },
                  loading && styles.refreshChipDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Refresh weather"
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.accent} />
                ) : (
                  <Text style={[styles.refreshChipText, { color: theme.accent }]}>
                    Refresh
                  </Text>
                )}
              </Pressable>
            </View>
            <WeatherAlertsCard alerts={alerts} theme={theme} />
            <TodayCard
              locationName={weather.locationName}
              current={weather.current}
              hourly={weather.hourly}
              unit={unit}
              onToggleUnit={toggleUnit}
              onLocationPress={() => setLocationModalVisible(true)}
            />
            <WeeklyForecastCard
              daily={weather.daily}
              accentCondition={weather.current.condition}
              unit={unit}
            />
          </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
