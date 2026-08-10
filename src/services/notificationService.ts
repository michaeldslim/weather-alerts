import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { WeatherAlert } from '../types/alert';

const ANDROID_CHANNEL_ID = 'weather-alerts';

let configured = false;
let permissionPromptAttempted = false;

export function configureNotifications(): void {
  if (configured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  configured = true;
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  configureNotifications();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Weather Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  if (permissionPromptAttempted) {
    return false;
  }

  permissionPromptAttempted = true;

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return requested.granted;
}

export async function notifyWeatherAlerts(alerts: WeatherAlert[]): Promise<void> {
  const allowed = await ensureNotificationPermissions();
  if (!allowed) {
    return;
  }

  for (const alert of alerts) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: alert.event,
        body: alert.headline,
        data: { alertId: alert.id },
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
      },
      trigger: null,
    });
  }
}
