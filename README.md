# Weather Alerts

A mobile weather app built with Expo, React Native, and TypeScript. It shows current conditions and a 7-day forecast for your location or any city worldwide, with dynamic backgrounds that match the weather.

## Features

- **Current weather** — temperature, feels-like, humidity, wind, and condition label
- **7-day forecast** — daily highs/lows with weather icons
- **GPS location** — uses device location on launch (falls back to New York if permission is denied)
- **City search** — search any city worldwide via Open-Meteo geocoding
- **°F / °C toggle** — tap the temperature to switch units (synced across cards)
- **Dynamic themes** — gradient background adapts to conditions (clear, rain, snow, etc.)
- **Error handling** — retry button when the weather API fails

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | [Expo](https://expo.dev) SDK 57 |
| UI | React Native 0.86, TypeScript |
| Location | `expo-location` |
| Styling | `expo-linear-gradient`, `react-native-safe-area-context` |
| Weather data | [Open-Meteo](https://open-meteo.com/) (no API key required) |
| Distribution | EAS Build & Update |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm
- For native builds: Android Studio (Android) and/or Xcode (iOS)
- For EAS builds: [EAS CLI](https://docs.expo.dev/eas/) and an Expo account

## Getting Started

```bash
git clone https://github.com/mike008/weather-alerts.git
cd weather-alerts
npm install
```

Start the development server:

```bash
npm start
```

Run on a device or emulator:

```bash
npm run android          # Android emulator or connected device
npm run ios              # iOS simulator (macOS only)
npm run android:device   # Android physical device
npm run ios:device       # iOS physical device
```

## How It Works

1. On launch, the app requests foreground location permission.
2. If granted, it fetches coordinates and reverse-geocodes the city name.
3. If denied, it uses New York (40.7128, -74.006) as a fallback.
4. Weather data is fetched from Open-Meteo and rendered in two cards.
5. Tap the location name to open city search; choose **Use current location** to return to GPS.

### APIs

**Forecast** (no API key):

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lon}
  &current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code
  &daily=weather_code,temperature_2m_max,temperature_2m_min
  &temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=7
```

**Geocoding** (city search):

```
GET https://geocoding-api.open-meteo.com/v1/search?name={query}&count=8&language=en
```

Open-Meteo free tier: 10,000 requests/day. Non-commercial use only.

## Native Builds & EAS

This project uses the **bare workflow** (`android/` is checked in). For EAS Build and OTA updates, see [docs/EAS_BUILD_AND_UPDATE.md](docs/EAS_BUILD_AND_UPDATE.md).

Quick reference:

```bash
eas build --platform android --profile production
eas update --channel production
```

`runtimeVersion` in `app.json` must be set manually (e.g. `"1.5.0"`) and kept in sync with native builds.

## Roadmap

- App resume refresh (auto-update when returning from background)
- Weather alerts / push notifications
- Animated gradient transitions
- Haptic feedback on unit toggle
- Persist temperature unit and last city (AsyncStorage)
- Dark mode system preference

## License

MIT — see [LICENSE](LICENSE).
