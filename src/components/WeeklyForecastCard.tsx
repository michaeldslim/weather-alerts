import { StyleSheet, Text, View } from 'react-native';
import { DailyForecast } from '../types/weather';
import { getTimezoneCalendarDateKey } from '../utils/localTime';
import { formatDailyPrecipLabel } from '../utils/precipitation';
import { convertTemperature, TemperatureUnit } from '../utils/temperature';
import { formatDayLabel } from '../utils/weatherCode';
import { getWeatherEmoji, getWeatherTheme } from '../utils/weatherTheme';

interface WeeklyForecastCardProps {
  daily: DailyForecast[];
  timezone: string;
  accentCondition: DailyForecast['condition'];
  isDay: boolean;
  unit: TemperatureUnit;
}

export function WeeklyForecastCard({
  daily,
  timezone,
  accentCondition,
  isDay,
  unit,
}: WeeklyForecastCardProps) {
  const theme = getWeatherTheme(accentCondition, isDay);
  const cityToday = getTimezoneCalendarDateKey(timezone);

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>7-Day Forecast</Text>
      {daily.map((day) => {
        const dayIsDay = day.date === cityToday ? isDay : true;

        return (
        <View key={day.date} style={styles.row}>
          <Text style={[styles.day, { color: theme.text }]}>
            {formatDayLabel(day.date, timezone)}
          </Text>
          <Text style={styles.emoji}>{getWeatherEmoji(day.condition, dayIsDay)}</Text>
          <Text
            style={[styles.precip, { color: theme.text }]}
            numberOfLines={1}
          >
            {formatDailyPrecipLabel(
              day.precipChancePercent ?? 0,
              day.precipAmountInches ?? 0
            )}
          </Text>
          <View style={styles.tempGroup}>
            <Text style={[styles.low, { color: theme.text }]}>
              {convertTemperature(day.low, unit)}°
            </Text>
            <Text style={[styles.high, { color: theme.text }]}>
              {convertTemperature(day.high, unit)}°
            </Text>
          </View>
        </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  day: {
    width: 56,
    fontSize: 15,
    fontWeight: '500',
  },
  emoji: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  precip: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.85,
    paddingHorizontal: 4,
  },
  tempGroup: {
    flexDirection: 'row',
    gap: 10,
    width: 72,
    justifyContent: 'flex-end',
  },
  high: {
    fontSize: 15,
    fontWeight: '600',
  },
  low: {
    fontSize: 15,
    opacity: 0.6,
  },
});
