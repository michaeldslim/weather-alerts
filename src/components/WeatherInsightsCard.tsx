import { StyleSheet, Text, View } from 'react-native';
import { WeatherInsights } from '../types/weather';
import {
  AIR_QUALITY_SCALE_MAX,
  AIR_QUALITY_SCALE_SEGMENTS,
  getAirQualityAccent,
} from '../utils/airQuality';
import {
  buildSunStatus,
  formatDaylightDuration,
  formatTimeInTimezone,
} from '../utils/sunDaylight';
import {
  getUvIndexAccent,
  getUvIndexCategory,
  UV_INDEX_SCALE_MAX,
  UV_INDEX_SCALE_SEGMENTS,
} from '../utils/uvIndex';
import { WeatherTheme } from '../utils/weatherTheme';
import { ScaleBar } from './ScaleBar';

interface WeatherInsightsCardProps {
  insights: WeatherInsights;
  timezone: string;
  uvIndex: number;
  theme: WeatherTheme;
}

export function WeatherInsightsCard({
  insights,
  timezone,
  uvIndex,
  theme,
}: WeatherInsightsCardProps) {
  const { sun, airQuality } = insights;
  const sunStatus = buildSunStatus(sun.sunrise, sun.sunset, sun.nextSunrise, timezone);
  const roundedUv = Math.round(uvIndex);
  const uvCategory = getUvIndexCategory(uvIndex);
  const uvAccent = getUvIndexAccent(uvIndex);

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>Outlook</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Sun & Daylight</Text>
        <View style={styles.sunRow}>
          <View style={styles.sunItem}>
            <Text style={[styles.sunLabel, { color: theme.text }]}>Sunrise</Text>
            <Text style={[styles.sunValue, { color: theme.text }]}>
              {formatTimeInTimezone(sun.sunrise, timezone)}
            </Text>
          </View>
          <View style={styles.sunItem}>
            <Text style={[styles.sunLabel, { color: theme.text }]}>Sunset</Text>
            <Text style={[styles.sunValue, { color: theme.text }]}>
              {formatTimeInTimezone(sun.sunset, timezone)}
            </Text>
          </View>
        </View>
        <Text style={[styles.meta, { color: theme.text }]}>
          {formatDaylightDuration(sun.daylightMinutes)} daylight
          {sunStatus.length > 0 ? ` · ${sunStatus}` : ''}
        </Text>
      </View>

      <View style={[styles.sectionDivider, styles.section]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>UV Index</Text>
        <View style={styles.metricHeader}>
          <View style={[styles.metricBadge, { backgroundColor: uvAccent }]}>
            <Text style={styles.metricBadgeValue}>{roundedUv}</Text>
          </View>
          <View style={styles.metricDetails}>
            <Text style={[styles.metricCategory, { color: theme.text }]}>{uvCategory}</Text>
            <Text style={[styles.meta, { color: theme.text }]}>Current UV level</Text>
          </View>
        </View>
        <ScaleBar
          value={uvIndex}
          max={UV_INDEX_SCALE_MAX}
          segments={[...UV_INDEX_SCALE_SEGMENTS]}
          markerColor={theme.text}
        />
        <View style={styles.scaleLabels}>
          <Text style={[styles.scaleLabel, { color: theme.text }]}>0 Low</Text>
          <Text style={[styles.scaleLabel, { color: theme.text }]}>11+ Extreme</Text>
        </View>
      </View>

      <View style={[styles.sectionDivider, styles.section, styles.lastSection]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Air Quality</Text>
        {airQuality ? (
          <>
            <View style={styles.metricHeader}>
              <View
                style={[
                  styles.metricBadge,
                  { backgroundColor: getAirQualityAccent(airQuality.aqi) },
                ]}
              >
                <Text style={styles.metricBadgeValue}>{airQuality.aqi}</Text>
              </View>
              <View style={styles.metricDetails}>
                <Text style={[styles.metricCategory, { color: theme.text }]}>
                  {airQuality.category}
                </Text>
                <Text style={[styles.meta, { color: theme.text }]}>
                  PM2.5 {airQuality.pm25} µg/m³ · US AQI
                </Text>
              </View>
            </View>
            <ScaleBar
              value={airQuality.aqi}
              max={AIR_QUALITY_SCALE_MAX}
              segments={[...AIR_QUALITY_SCALE_SEGMENTS]}
              markerColor={theme.text}
            />
            <View style={styles.scaleLabels}>
              <Text style={[styles.scaleLabel, { color: theme.text }]}>0 Good</Text>
              <Text style={[styles.scaleLabel, { color: theme.text }]}>300+ Hazardous</Text>
            </View>
          </>
        ) : (
          <Text style={[styles.meta, { color: theme.text }]}>Unavailable for this location</Text>
        )}
      </View>
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
  section: {
    marginBottom: 16,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionDivider: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.9,
  },
  sunRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 6,
  },
  sunItem: {
    flex: 1,
  },
  sunLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 2,
  },
  sunValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    opacity: 0.75,
    lineHeight: 17,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  metricBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricBadgeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  metricDetails: {
    flex: 1,
    gap: 4,
  },
  metricCategory: {
    fontSize: 16,
    fontWeight: '600',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scaleLabel: {
    fontSize: 10,
    opacity: 0.65,
  },
});
