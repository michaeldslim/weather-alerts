import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CurrentWeather } from '../types/weather';
import {
  convertTemperature,
  formatTemperature,
  TemperatureUnit,
} from '../utils/temperature';
import { getWeatherEmoji, getWeatherTheme } from '../utils/weatherTheme';

interface TodayCardProps {
  locationName: string;
  current: CurrentWeather;
  unit: TemperatureUnit;
  onToggleUnit: () => void;
  onLocationPress: () => void;
}

export function TodayCard({
  locationName,
  current,
  unit,
  onToggleUnit,
  onLocationPress,
}: TodayCardProps) {
  const theme = getWeatherTheme(current.condition);

  const displayTemp = convertTemperature(current.temperature, unit);
  const displayFeelsLike = convertTemperature(current.feelsLike, unit);

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <Pressable onPress={onLocationPress} style={styles.locationButton}>
        <Text style={[styles.location, { color: theme.text }]}>{locationName}</Text>
        <Text style={[styles.locationHint, { color: theme.text }]}>Tap to change city</Text>
      </Pressable>
      <Text style={styles.emoji}>{getWeatherEmoji(current.condition)}</Text>
      <Text style={[styles.condition, { color: theme.text }]}>
        {current.conditionLabel}
      </Text>

      <Pressable onPress={onToggleUnit} style={styles.temperatureButton}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  locationButton: {
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
  },
  locationHint: {
    fontSize: 12,
    opacity: 0.65,
    marginTop: 2,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginVertical: 4,
  },
  condition: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 0,
  },
  temperatureButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  temperature: {
    fontSize: 56,
    fontWeight: '200',
    letterSpacing: -2,
  },
  tapHint: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
