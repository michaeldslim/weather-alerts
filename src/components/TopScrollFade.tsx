import { LinearGradient } from 'expo-linear-gradient';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Fade zone below the status bar / notch. */
const FADE_EXTENSION = 64;

/** Scroll distance before the top scrim is fully visible. */
const FADE_SCROLL_END = 48;

function withAlpha(hexColor: string, alpha: number): string {
  const normalized = hexColor.replace('#', '');
  if (normalized.length !== 6) {
    return hexColor;
  }

  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');

  return `#${normalized}${alphaHex}`;
}

interface TopScrollFadeProps {
  /** Top stop of the weather background gradient — blends the scrim with the sky. */
  topColor: string;
  scrollY: Animated.Value;
}

/** Top scrim — hidden at scroll top; fades in as content moves upward. */
export function TopScrollFade({ topColor, scrollY }: TopScrollFadeProps) {
  const insets = useSafeAreaInsets();
  const height = insets.top + FADE_EXTENSION;
  const opacity = scrollY.interpolate({
    inputRange: [0, FADE_SCROLL_END * 0.5, FADE_SCROLL_END],
    outputRange: [0, 0.65, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { height, opacity }]}>
      <LinearGradient
        colors={[topColor, withAlpha(topColor, 0.85), withAlpha(topColor, 0)]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 8,
  },
});
