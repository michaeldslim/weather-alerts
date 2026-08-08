import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { WeatherCondition } from '../types/weather';
import { getWeatherTheme } from '../utils/weatherTheme';

interface WeatherBackgroundProps {
  condition: WeatherCondition;
  children: ReactNode;
}

export function WeatherBackground({ condition, children }: WeatherBackgroundProps) {
  const theme = getWeatherTheme(condition);

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
