import { ActivityIndicator, Animated, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  CollapsingLocationHeaderScrollContent,
  LOCATION_COLLAPSE_END,
} from './CollapsingLocationHeader';
import { SavedCitiesIndicator } from './SavedCitiesIndicator';
import { TodayCard } from './TodayCard';
import { WeatherAlertsCard } from './WeatherAlertsCard';
import { WeatherInsightsCard } from './WeatherInsightsCard';
import { WeeklyForecastCard } from './WeeklyForecastCard';
import { WeatherAlert } from '../types/alert';
import { CurrentWeather, DailyForecast, HourlyForecast, WeatherInsights } from '../types/weather';
import { TemperatureUnit } from '../utils/temperature';
import { WeatherTheme } from '../utils/weatherTheme';

interface WeatherHomeScrollProps {
  scrollY: Animated.Value;
  onScrollStickyChange: (sticky: boolean) => void;
  locationName: string;
  timezone: string;
  theme: WeatherTheme;
  onOpenLocationSearch: () => void;
  cityRotationCount: number;
  cityRotationIndex: number;
  summary: string;
  current: CurrentWeather | null;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  insights: WeatherInsights | null;
  alerts: WeatherAlert[];
  unit: TemperatureUnit;
  onToggleUnit: () => void;
  refreshing: boolean;
  onRefresh: () => void;
}

export function WeatherHomeScroll({
  scrollY,
  onScrollStickyChange,
  locationName,
  timezone,
  theme,
  onOpenLocationSearch,
  cityRotationCount,
  cityRotationIndex,
  summary,
  current,
  hourly,
  daily,
  insights,
  alerts,
  unit,
  onToggleUnit,
  refreshing,
  onRefresh,
}: WeatherHomeScrollProps) {
  const locationHeaderProps = {
    locationName,
    timezone,
    textColor: theme.text,
    accentColor: theme.accent,
    cardBackground: theme.cardBackground,
    scrollY,
    onPress: onOpenLocationSearch,
  };

  if (!current) {
    return (
      <View style={styles.pageLoading}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <Animated.ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          onScrollStickyChange(offsetY >= LOCATION_COLLAPSE_END * 0.35);
        },
      })}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: theme.text }]}>Weather Alerts</Text>
        <Pressable
          onPress={onRefresh}
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
            <Text style={[styles.refreshChipText, { color: theme.accent }]}>Refresh</Text>
          )}
        </Pressable>
      </View>
      <CollapsingLocationHeaderScrollContent {...locationHeaderProps} />
      <SavedCitiesIndicator
        count={cityRotationCount}
        activeIndex={cityRotationIndex}
        accentColor={theme.accent}
      />
      <WeatherAlertsCard alerts={alerts} theme={theme} />
      <TodayCard
        summary={summary}
        current={current}
        hourly={hourly}
        timezone={timezone}
        unit={unit}
        onToggleUnit={onToggleUnit}
      />
      {insights ? (
        <WeatherInsightsCard
          insights={insights}
          timezone={timezone}
          uvIndex={current.uvIndex}
          theme={theme}
        />
      ) : null}
      <WeeklyForecastCard
        daily={daily}
        timezone={timezone}
        accentCondition={current.condition}
        isDay={current.isDay}
        unit={unit}
      />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  pageLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});
