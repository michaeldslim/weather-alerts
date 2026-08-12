import { useLocalTime } from '../hooks/useLocalTime';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

export const LOCATION_COLLAPSE_END = 72;

interface CollapsingLocationHeaderProps {
  locationName: string;
  timezone: string;
  showLocalTime: boolean;
  textColor: string;
  accentColor: string;
  cardBackground: string;
  scrollY: Animated.Value;
  onPress: () => void;
}

function useCollapseAnimation(scrollY: Animated.Value) {
  return {
    inlineOpacity: scrollY.interpolate({
      inputRange: [0, LOCATION_COLLAPSE_END * 0.45, LOCATION_COLLAPSE_END],
      outputRange: [1, 0.35, 0],
      extrapolate: 'clamp',
    }),
    stickyOpacity: scrollY.interpolate({
      inputRange: [0, LOCATION_COLLAPSE_END * 0.35, LOCATION_COLLAPSE_END],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    }),
    stickyTranslateY: scrollY.interpolate({
      inputRange: [0, LOCATION_COLLAPSE_END],
      outputRange: [-8, 0],
      extrapolate: 'clamp',
    }),
  };
}

/** Inline city name — place inside ScrollView content. */
export function CollapsingLocationHeaderScrollContent({
  locationName,
  timezone,
  showLocalTime,
  textColor,
  scrollY,
  onPress,
}: CollapsingLocationHeaderProps) {
  const { inlineOpacity } = useCollapseAnimation(scrollY);
  const localTime = useLocalTime(showLocalTime ? timezone : undefined);

  return (
    <Animated.View style={[styles.inlineContainer, { opacity: inlineOpacity }]}>
      <Pressable onPress={onPress} style={styles.inlinePressable}>
        <Text style={[styles.inlineLocation, { color: textColor }]}>{locationName}</Text>
        {showLocalTime && localTime.length > 0 && (
          <Text style={[styles.localTime, { color: textColor }]}>{localTime}</Text>
        )}
        <Text style={[styles.hint, { color: textColor }]}>Tap to change city</Text>
      </Pressable>
    </Animated.View>
  );
}

interface CollapsingLocationHeaderStickyProps extends CollapsingLocationHeaderProps {
  stickyActive: boolean;
}

/** Sticky city chip — left-aligned pill; fades in as user scrolls up. */
export function CollapsingLocationHeaderStickyOverlay({
  locationName,
  timezone,
  showLocalTime,
  textColor,
  accentColor,
  cardBackground,
  scrollY,
  stickyActive,
  onPress,
}: CollapsingLocationHeaderStickyProps) {
  const { stickyOpacity, stickyTranslateY } = useCollapseAnimation(scrollY);
  const localTime = useLocalTime(showLocalTime ? timezone : undefined);

  return (
    <Animated.View
      pointerEvents={stickyActive ? 'box-none' : 'none'}
      style={[styles.stickyWrapper, { opacity: stickyOpacity }]}
    >
      <Animated.View style={{ transform: [{ translateY: stickyTranslateY }] }}>
        <Pressable
          onPress={onPress}
          style={[styles.stickyChip, { backgroundColor: cardBackground }]}
          accessibilityRole="button"
          accessibilityLabel={
            showLocalTime && localTime.length > 0
              ? `${locationName}, ${localTime}. Tap to change city`
              : `${locationName}. Tap to change city`
          }
        >
          <Text style={[styles.stickyChipCity, { color: accentColor }]} numberOfLines={1}>
            {locationName}
          </Text>
          {showLocalTime && localTime.length > 0 && (
            <Text style={[styles.stickyChipTime, { color: textColor }]}>{localTime}</Text>
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inlineContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  inlinePressable: {
    alignItems: 'flex-start',
  },
  inlineLocation: {
    fontSize: 22,
    fontWeight: '700',
  },
  localTime: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.85,
    marginTop: 2,
  },
  hint: {
    fontSize: 11,
    opacity: 0.65,
    marginTop: 4,
  },
  stickyWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  stickyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: '100%',
    alignItems: 'flex-start',
  },
  stickyChipCity: {
    fontSize: 14,
    fontWeight: '600',
  },
  stickyChipTime: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.85,
    marginTop: 2,
  },
});
