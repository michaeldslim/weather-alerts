import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CityWeatherPager } from './src/components/CityWeatherPager';
import {
  CollapsingLocationHeaderStickyOverlay,
} from './src/components/CollapsingLocationHeader';
import { LocationSearchModal } from './src/components/LocationSearchModal';
import { TopScrollFade } from './src/components/TopScrollFade';
import { WeatherBackground } from './src/components/WeatherBackground';
import { WeatherHomeScroll } from './src/components/WeatherHomeScroll';
import { useCityDaylight } from './src/hooks/useCityDaylight';
import { useWeather } from './src/hooks/useWeather';
import { useTemperatureUnit } from './src/hooks/useTemperatureUnit';
import { resolveIsDayForWeather } from './src/utils/sunDaylight';
import { ensureNotificationPermissions } from './src/services/notificationService';
import { LocationSource } from './src/types/location';
import { buildTodaySummary } from './src/utils/weatherSummary';
import { getWeatherTheme } from './src/utils/weatherTheme';

export default function App() {
  const {
    weather,
    loading,
    refreshing,
    error,
    refresh,
    selectLocation,
    selectSavedCity,
    removeSavedCity,
    savedCities,
    useCurrentLocation,
    cityRotation,
    cityRotationCount,
    cityRotationIndex,
    getCityPageData,
    goToCityAtIndex,
  } = useWeather();
  const { unit, toggleUnit } = useTemperatureUnit();
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationSticky, setLocationSticky] = useState(false);
  const notificationSetupDoneRef = useRef(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const activeSource = cityRotation[cityRotationIndex] ?? cityRotation[0];
  const activePageWeather =
    (activeSource ? getCityPageData(activeSource).weather : null) ?? weather;
  const displayIsDay = useCityDaylight(activePageWeather);

  useEffect(() => {
    scrollY.setValue(0);
    setLocationSticky(false);
  }, [cityRotationIndex, scrollY]);

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

  const shellWeather = activePageWeather ?? weather;
  const theme = getWeatherTheme(shellWeather.current.condition, displayIsDay);
  const statusBarStyle = 'light';
  const openLocationSearch = () => setLocationModalVisible(true);
  const renderCityPage = (source: LocationSource) => {
    const pageData = getCityPageData(source);
    const pageWeather = pageData.weather;
    const pageIsDay = pageWeather ? resolveIsDayForWeather(pageWeather) : displayIsDay;
    const pageTheme = pageWeather
      ? getWeatherTheme(pageWeather.current.condition, pageIsDay)
      : theme;
    const today = pageWeather?.daily[0];
    const todaySummary =
      today && pageWeather
        ? buildTodaySummary(today.conditionLabel, today.high, today.low, unit)
        : '';

    return (
      <WeatherHomeScroll
        scrollY={scrollY}
        onScrollStickyChange={setLocationSticky}
        locationName={pageWeather?.locationName ?? 'Loading…'}
        timezone={pageWeather?.timezone ?? weather.timezone}
        theme={pageTheme}
        onOpenLocationSearch={openLocationSearch}
        cityRotationCount={cityRotationCount}
        cityRotationIndex={cityRotationIndex}
        summary={todaySummary}
        current={
          pageWeather?.current
            ? { ...pageWeather.current, isDay: pageIsDay }
            : null
        }
        hourly={pageWeather?.hourly ?? []}
        daily={pageWeather?.daily ?? []}
        insights={pageWeather?.insights ?? null}
        alerts={pageData.alerts}
        unit={unit}
        onToggleUnit={toggleUnit}
        refreshing={pageData.isActive && refreshing}
        onRefresh={refresh}
      />
    );
  };

  const locationHeaderProps = {
    locationName: shellWeather.locationName,
    timezone: shellWeather.timezone,
    textColor: theme.text,
    accentColor: theme.accent,
    cardBackground: theme.cardBackground,
    scrollY,
    onPress: openLocationSearch,
  };

  return (
    <SafeAreaProvider>
      <WeatherBackground
        condition={shellWeather.current.condition}
        isDay={displayIsDay}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.screen}>
            <CollapsingLocationHeaderStickyOverlay
              {...locationHeaderProps}
              stickyActive={locationSticky}
            />
            <TopScrollFade topColor={theme.gradient[0]} scrollY={scrollY} />
            <CityWeatherPager
              rotation={cityRotation}
              activeIndex={cityRotationIndex}
              onPageIndexChange={(index) => {
                void goToCityAtIndex(index);
              }}
              renderPage={renderCityPage}
            />
          </View>
        </SafeAreaView>
        <LocationSearchModal
          visible={locationModalVisible}
          theme={theme}
          savedCities={savedCities}
          onClose={() => setLocationModalVisible(false)}
          onSelect={(location, saveToList) => {
            void selectLocation(location, saveToList);
          }}
          onSelectSavedCity={selectSavedCity}
          onRemoveSavedCity={(cityId) => {
            void removeSavedCity(cityId);
          }}
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
