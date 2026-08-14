import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CurrentWeather, HourlyForecast } from '../types/weather';
import {
  convertTemperature,
  formatTemperature,
  TemperatureUnit,
} from '../utils/temperature';
import { getWeatherEmoji, getWeatherTheme } from '../utils/weatherTheme';
import { formatHourLabel } from '../utils/weatherCode';

interface TodayCardProps {
  summary: string;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  timezone: string;
  unit: TemperatureUnit;
  onToggleUnit: () => void;
}

export function TodayCard({
  summary,
  current,
  hourly,
  timezone,
  unit,
  onToggleUnit,
}: TodayCardProps) {
  const theme = getWeatherTheme(current.condition, current.isDay);

  const displayTemp = convertTemperature(current.temperature, unit);
  const displayFeelsLike = convertTemperature(current.feelsLike, unit);

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      {summary.length > 0 && (
        <Text style={[styles.summary, { color: theme.text }]}>{summary}</Text>
      )}
      <Text style={styles.emoji}>{getWeatherEmoji(current.condition, current.isDay)}</Text>
      <Text style={[styles.condition, { color: theme.text }]}>
        {current.conditionLabel}
      </Text>

      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggleUnit();
        }}
        style={styles.temperatureButton}
      >
        <Text style={[styles.temperature, { color: theme.text }]}>
          {formatTemperature(displayTemp, unit)}
        </Text>
        <Text style={[styles.tapHint, { color: theme.text }]}>
          Tap to switch to °{unit === 'F' ? 'C' : 'F'}
        </Text>
      </Pressable>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.text }]}>Feels like</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {formatTemperature(displayFeelsLike, unit)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.text }]}>Humidity</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {current.humidity}%
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.text }]}>Wind</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {current.windSpeed} mph
          </Text>
        </View>
      </View>

      {hourly.length > 0 && (
        <View style={styles.hourlyRow}>
          {hourly.map((hour) => {
            const displayHourTemp = convertTemperature(hour.temperature, unit);
            return (
              <View key={hour.time} style={styles.hourlyItem}>
                <Text style={[styles.hourlyLabel, { color: theme.text }]}>
                  {formatHourLabel(hour.time, timezone)}
                </Text>
                <Text style={styles.hourlyEmoji}>
                  {getWeatherEmoji(hour.condition, hour.isDay ?? true)}
                </Text>
                <Text style={[styles.hourlyTemp, { color: theme.text }]}>
                  {formatTemperature(displayHourTemp, unit)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  emoji: {
    fontSize: 40,
    textAlign: 'center',
    marginVertical: 2,
  },
  summary: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.85,
    textAlign: 'left',
    marginBottom: 4,
  },
  condition: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 0,
  },
  temperatureButton: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '200',
    letterSpacing: -2,
  },
  tapHint: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  hourlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  hourlyItem: {
    flex: 1,
    alignItems: 'center',
  },
  hourlyLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 2,
  },
  hourlyEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  hourlyTemp: {
    fontSize: 13,
    fontWeight: '600',
  },
});
