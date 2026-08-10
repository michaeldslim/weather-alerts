import AsyncStorage from '@react-native-async-storage/async-storage';
import { TemperatureUnit } from '../utils/temperature';

const TEMPERATURE_UNIT_KEY = 'temperatureUnit';

function isTemperatureUnit(value: string | null): value is TemperatureUnit {
  return value === 'F' || value === 'C';
}

export async function loadTemperatureUnit(): Promise<TemperatureUnit | null> {
  try {
    const value = await AsyncStorage.getItem(TEMPERATURE_UNIT_KEY);
    return isTemperatureUnit(value) ? value : null;
  } catch {
    return null;
  }
}

export async function saveTemperatureUnit(unit: TemperatureUnit): Promise<void> {
  try {
    await AsyncStorage.setItem(TEMPERATURE_UNIT_KEY, unit);
  } catch {
    // Ignore write failures; in-memory unit still works for this session.
  }
}
