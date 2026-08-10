import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WeatherAlert } from '../types/alert';
import { WeatherTheme } from '../utils/weatherTheme';

interface WeatherAlertsCardProps {
  alerts: WeatherAlert[];
  theme: WeatherTheme;
}

function getSeverityAccent(severity: WeatherAlert['severity']): string {
  switch (severity) {
    case 'Extreme':
    case 'Severe':
      return '#FC8181';
    case 'Moderate':
      return '#F6AD55';
    case 'Minor':
      return '#F6E05E';
    default:
      return '#CBD5E0';
  }
}

function formatExpires(expires: string): string {
  if (!expires) {
    return '';
  }

  const date = new Date(expires);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `Until ${date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export function WeatherAlertsCard({ alerts, theme }: WeatherAlertsCardProps) {
  const [expanded, setExpanded] = useState(true);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <View style={[styles.headerRow, !expanded && styles.headerRowCollapsed]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Active Alerts ({alerts.length})
        </Text>
        <Pressable
          onPress={() => setExpanded((prev) => !prev)}
          style={[styles.toggleChip, { backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Hide alerts' : 'Show alerts'}
        >
          <Text style={[styles.toggleChipText, { color: theme.accent }]}>
            {expanded ? 'Hide' : 'Show'}
          </Text>
        </Pressable>
      </View>
      {expanded &&
        alerts.map((alert, index) => {
          const accent = getSeverityAccent(alert.severity);
          const expiresLabel = formatExpires(alert.expires);

          return (
            <View
              key={alert.id}
              style={[
                styles.alertRow,
                index < alerts.length - 1 && styles.alertRowBorder,
                { borderLeftColor: accent },
              ]}
            >
              <Text style={[styles.event, { color: theme.text }]}>{alert.event}</Text>
              <Text style={[styles.headline, { color: theme.text }]}>{alert.headline}</Text>
              {alert.areaDesc ? (
                <Text style={[styles.meta, { color: theme.text }]}>{alert.areaDesc}</Text>
              ) : null}
              {expiresLabel ? (
                <Text style={[styles.meta, { color: theme.text }]}>{expiresLabel}</Text>
              ) : null}
              {alert.description ? (
                <Text
                  style={[styles.description, { color: theme.text }]}
                  numberOfLines={4}
                >
                  {alert.description}
                </Text>
              ) : null}
            </View>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  headerRowCollapsed: {
    marginBottom: 0,
  },
  toggleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 56,
    alignItems: 'center',
  },
  toggleChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  alertRow: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 10,
  },
  alertRowBorder: {
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  event: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  headline: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.95,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    opacity: 0.75,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    opacity: 0.85,
    marginTop: 6,
    lineHeight: 18,
  },
});
