# FarmTrace

A React Native app for monitoring cold-chain shipments in transit — live sensor
readings (temperature, humidity, ethylene, battery), driver hours-of-service
logging, trip management, and gateway (ESP32/NodeMCU) connectivity.

Rebuilt as a standalone project with a CI pipeline that produces installable
`.apk` files automatically — no local Android SDK required.

## Screens
- **Home** — trip summary, live status banner, sensor snapshot, driver hours
- **Monitor** — live sensor readings with min/max
- **Logbook** — driving/rest timeline and hours-of-service summary
- **Trips** — shipment list and trip history
- **Profile** — driver info, stats, and settings

## Getting the APK (no local setup needed)

This repo includes a GitHub Actions workflow (`.github/workflows/build-apk.yml`)
that builds the app automatically:

1. Push this project to a new GitHub repository.
2. GitHub Actions will run automatically (or trigger it manually from the
   **Actions** tab → **Build Android APK** → **Run workflow**).
3. When the run finishes, open it and download the **app-debug-apk** or
   **app-release-apk** artifact — that's your installable `.apk`.

Both build types are signed with the React Native default debug keystore, so
they install directly on a device/emulator with no extra signing setup. For a
real Play Store release, generate your own upload keystore and update the
`signingConfigs.release` block in `android/app/build.gradle`.

## Local development

```sh
npm install
npm start          # Metro bundler
npm run android    # requires Android SDK installed locally
```

To build the APK yourself instead of using CI:

```sh
cd android
./gradlew assembleDebug     # -> android/app/build/outputs/apk/debug/app-debug.apk
./gradlew assembleRelease   # -> android/app/build/outputs/apk/release/app-release.apk
```

## Project structure

```
src/
  screens/       Home, Monitor, Logbook, Trips, Profile
  navigation/     Bottom tab navigator
  services/       API client, local SQLite queue, background sync manager
  theme/          Shared color tokens
```
