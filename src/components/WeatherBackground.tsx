import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { WeatherCondition } from '../types/weather';
import { getWeatherTheme } from '../utils/weatherTheme';

const TRANSITION_MS = 450;

interface WeatherBackgroundProps {
  condition: WeatherCondition;
  children: ReactNode;
}

export function WeatherBackground({ condition, children }: WeatherBackgroundProps) {
  const [baseCondition, setBaseCondition] = useState(condition);
  const [overlayCondition, setOverlayCondition] = useState<WeatherCondition | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const baseRef = useRef(condition);
  const overlayRef = useRef<WeatherCondition | null>(null);

  useEffect(() => {
    const from = overlayRef.current ?? baseRef.current;
    if (from === condition) {
      return;
    }

    animRef.current?.stop();

    if (overlayRef.current) {
      baseRef.current = overlayRef.current;
      setBaseCondition(overlayRef.current);
    }

    overlayRef.current = condition;
    setOverlayCondition(condition);
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

      baseRef.current = condition;
      overlayRef.current = null;
      setBaseCondition(condition);
      setOverlayCondition(null);
      fadeAnim.setValue(0);
    });

    return () => {
      animRef.current?.stop();
    };
  }, [condition, fadeAnim]);

  const baseTheme = getWeatherTheme(baseCondition);
  const overlayTheme = overlayCondition ? getWeatherTheme(overlayCondition) : null;

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
