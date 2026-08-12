import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { WeatherCondition } from '../types/weather';
import { getWeatherTheme } from '../utils/weatherTheme';

const TRANSITION_MS = 450;

interface WeatherAppearance {
  condition: WeatherCondition;
  isDay: boolean;
}

interface WeatherBackgroundProps {
  condition: WeatherCondition;
  isDay: boolean;
  children: ReactNode;
}

function appearancesEqual(a: WeatherAppearance, b: WeatherAppearance): boolean {
  return a.condition === b.condition && a.isDay === b.isDay;
}

export function WeatherBackground({ condition, isDay, children }: WeatherBackgroundProps) {
  const [baseAppearance, setBaseAppearance] = useState<WeatherAppearance>({
    condition,
    isDay,
  });
  const [overlayAppearance, setOverlayAppearance] = useState<WeatherAppearance | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const baseRef = useRef<WeatherAppearance>({ condition, isDay });
  const overlayRef = useRef<WeatherAppearance | null>(null);

  useEffect(() => {
    const nextAppearance = { condition, isDay };
    const from = overlayRef.current ?? baseRef.current;
    if (appearancesEqual(from, nextAppearance)) {
      return;
    }

    animRef.current?.stop();

    if (overlayRef.current) {
      baseRef.current = overlayRef.current;
      setBaseAppearance(overlayRef.current);
    }

    overlayRef.current = nextAppearance;
    setOverlayAppearance(nextAppearance);
    fadeAnim.setValue(0);

    animRef.current = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: TRANSITION_MS,
      useNativeDriver: true,
    });

    animRef.current.start(({ finished }) => {
      if (!finished) {
        return;
      }

      baseRef.current = nextAppearance;
      overlayRef.current = null;
      setBaseAppearance(nextAppearance);
      setOverlayAppearance(null);
      fadeAnim.setValue(0);
    });

    return () => {
      animRef.current?.stop();
    };
  }, [condition, fadeAnim, isDay]);

  const baseTheme = getWeatherTheme(baseAppearance.condition, baseAppearance.isDay);
  const overlayTheme = overlayAppearance
    ? getWeatherTheme(overlayAppearance.condition, overlayAppearance.isDay)
    : null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={baseTheme.gradient} style={StyleSheet.absoluteFill} />
      {overlayTheme ? (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <LinearGradient colors={overlayTheme.gradient} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
