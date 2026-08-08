# EAS Build & Update Guide — Weather Alerts

This guide covers building and distributing **Weather Alerts** with [Expo Application Services (EAS)](https://docs.expo.dev/eas/).

## Project Info

| Field | Value |
|-------|-------|
| App name | Weather Alerts |
| Expo slug | `weather-alerts` |
| Owner | `mike008` |
| Project ID | `37fcc02c-dd03-492c-b6be-6d747c106472` |
| iOS bundle ID | `com.mike008.weatheralerts` |
| Android package | `com.mike008.weatheralerts` |
| Config file | `eas.json` |

---

## Prerequisites

1. [Expo account](https://expo.dev) (logged in as `mike008`)
2. EAS CLI installed globally:
   ```bash
   npm install -g eas-cli
   ```
3. Login:
   ```bash
   eas login
   ```
4. **Apple Developer** account (for iOS builds / App Store)
5. **Google Play Console** account (for Android Play Store)

---

## Build Profiles (`eas.json`)

| Profile | Purpose | Channel |
|---------|---------|---------|
| `development` | Dev client with native modules | `development` |
| `preview` | Internal testing (APK / IPA) | — |
| `production` | Release builds | `production` |

> **Note:** Current `production` profile uses `"distribution": "internal"`. Change to `"store"` in `eas.json` when submitting to App Store / Play Store.

---

## Step 1: Verify EAS Setup

From the project root:

```bash
cd weather-alerts
eas whoami
```

Project should already be linked via `app.json`:

```json
"extra": {
  "eas": {
    "projectId": "37fcc02c-dd03-492c-b6be-6d747c106472"
  }
}
```

If not linked:

```bash
eas init
```

---

## Step 2: Build the App

### Android — internal test (preview)

```bash
eas build --platform android --profile preview
```

### Android — production

```bash
eas build --platform android --profile production
```

On first Android build, EAS will offer to generate a keystore. Choose **Yes** and let EAS manage credentials.

### iOS — production

```bash
eas build --platform ios --profile production
```

First iOS build requires:
- Apple Team ID
- Distribution certificate
- Provisioning profile

EAS can generate these automatically when prompted.

### Both platforms

```bash
eas build --platform all --profile production
```

### Check build status

```bash
eas build:list
```

Or open: https://expo.dev/accounts/mike008/projects/weather-alerts/builds

---

## Step 3: Install & Test

| Profile | How to install |
|---------|----------------|
| `preview` (Android) | Download APK from Expo dashboard → install on device |
| `preview` (iOS) | Install via TestFlight or internal distribution link |
| `development` | Install dev client, then run `npx expo start --dev-client` |
| `production` | Submit to stores (Step 4) or internal distribution link |

---

## Step 4: Submit to Stores

Before submitting, set production distribution to store in `eas.json`:

```json
"production": {
  "distribution": "store",
  "channel": "production",
  "autoIncrement": true
}
```

### Android (Google Play)

```bash
eas submit --platform android --profile production
```

Requires a Google Play service account JSON key (one-time setup in Play Console).

### iOS (App Store)

```bash
eas submit --platform ios --profile production
```

Requires an app created in App Store Connect with bundle ID `com.mike008.weatheralerts`.

### Both

```bash
eas submit --platform all --profile production
```

---

## Step 5: EAS Update (OTA)

Use EAS Update to push **JavaScript / asset changes** without a new store submission.

### 5a. Install expo-updates

```bash
npx expo install expo-updates
```

### 5b. Add to `app.json`

```json
{
  "expo": {
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/37fcc02c-dd03-492c-b6be-6d747c106472"
    }
  }
}
```

### 5c. Rebuild once with updates enabled

OTA only works on builds that include `expo-updates`:

```bash
eas build --platform all --profile production
```

Install this build on devices before publishing updates.

### 5d. Publish an OTA update

After code changes (no native module changes):

```bash
eas update --channel production --message "Describe your change"
```

### 5e. List published updates

```bash
eas update:list
```

### What OTA can / cannot update

| OTA can update | Requires new EAS build |
|----------------|----------------------|
| TS/JS code | New native packages |
| Images, assets | `app.json` permission changes |
| UI layout | App icon / splash (usually) |
| | New `expo-*` native modules |

---

## Step 6: Version Bump (Store Release)

When releasing a new version to the store:

1. Bump version in `app.json`:
   ```json
   "version": "1.0.1"
   ```

2. Enable auto-increment in `eas.json` (recommended):
   ```json
   "production": {
     "autoIncrement": true
   }
   ```

3. Build and submit:
   ```bash
   eas build --platform all --profile production
   eas submit --platform all --profile production
   ```

---

## Recommended Workflow

```
Develop locally (npm start)
        ↓
eas build --profile preview          ← internal test
        ↓
eas build --profile production       ← store / release build
eas submit                           ← upload to stores
        ↓
eas update --channel production      ← quick JS-only fixes
```

---

## Quick Command Reference

| Task | Command |
|------|---------|
| Login | `eas login` |
| Check account | `eas whoami` |
| Build Android | `eas build -p android --profile production` |
| Build iOS | `eas build -p ios --profile production` |
| Build both | `eas build -p all --profile production` |
| List builds | `eas build:list` |
| Submit Android | `eas submit -p android --profile production` |
| Submit iOS | `eas submit -p ios --profile production` |
| OTA update | `eas update --channel production -m "message"` |
| List updates | `eas update:list` |
| View credentials | `eas credentials` |

---

## Troubleshooting

### Custom app icon not showing
- Icons only appear in EAS / native builds, not Expo Go.
- After icon changes: `eas build --profile production` (new build required).

### Location permission issues
- Already configured in `app.json` (`NSLocationWhenInUseUsageDescription`, Android location permissions).
- Permission text changes require a new native build.

### Android keyboard covers search modal
- `softwareKeyboardLayoutMode: "resize"` is set in `app.json`.
- Rebuild native app after changing this setting.

### Build fails on credentials
```bash
eas credentials
```
Review and reset Android keystore or iOS certificates if needed.

---

## Links

- [EAS Build docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit docs](https://docs.expo.dev/submit/introduction/)
- [EAS Update docs](https://docs.expo.dev/eas-update/introduction/)
- [Project dashboard](https://expo.dev/accounts/mike008/projects/weather-alerts)
