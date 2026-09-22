# FarmTrace Mobile — Fixed & Complete

Cold-chain agricultural monitoring app (React Native 0.87, Android).

---

## What Was Fixed

### 🔴 Critical Crash Fix
- **Removed `react-native-vector-icons`** — this package requires native font linking
  that fails on React Native 0.87 + New Architecture (Fabric). Replaced with emoji icons.
  This was the install-crash error.

### 🔴 gradle.properties corruption
- The `org.gradle.java.home` line was concatenated with `android.newDsl=false` on the same
  line, causing a Gradle parse error. Fixed with separate lines.

### 🟡 Missing Gateway/NodeMCU Screen
- Added **Gateway tab (📡)** — the `NodeMcuScreen` that shows live hardware data.
- Added **Connect / Disconnect** buttons that actually start/stop polling.
- Shows all 10 sensor values: Temperature, Humidity, MQ-6, MQ-3, Accel XYZ, Gyro XYZ.
- Shows real-time data age, packet counter, alert banners, debug log.

### 🟡 All Buttons Non-Functional → Fixed
| Screen | Button | Was | Now |
|---|---|---|---|
| Dashboard | Start Rest | nothing | starts rest timer |
| Dashboard | Add Event | nothing | shows event picker alert |
| Dashboard | Connect (banner) | missing | starts NodeMCU polling |
| Trips | Start New Trip | nothing | opens modal with origin/dest |
| Trips | Trip Card | nothing | shows trip details / end trip |
| Logbook | Start Rest | nothing | toggles driving/rest timer |
| Logbook | Add Event | nothing | opens event type modal |
| Profile | Gateway Settings | nothing | modal to change IP |
| Profile | MQTT Config | nothing | shows MQTT info |
| Profile | Alert Thresholds | nothing | shows all thresholds |
| Profile | Export Data | nothing | instructions alert |
| Profile | About FarmTrace | nothing | shows version + hardware info |
| Profile | Logout | nothing | confirmation + stops polling |
| Gateway | Connect | **missing** | starts real HTTP polling |
| Gateway | Disconnect | **missing** | stops polling |
| Gateway | Refresh | **missing** | one-shot fetch |

### 🟡 Hardcoded Sensor Data → Real Data
- Dashboard, Monitor, Gateway screens now consume `NodeMcuContext`
- Values update live from `GET http://192.168.4.1/api/data` every 2 seconds
- Supports both flat JSON and nested JSON from NodeMCU firmware
- Shows `—` when not connected (not fake random values)

### 🟡 No State Management → Context
- `NodeMcuContext` — manages NodeMCU polling, sensor data, connection status, debug log
- `TripContext` — manages trips, driving/rest timers, logbook entries

### 🟡 No Real-Time Timers → Live Timers
- Driving timer ticks every second
- Rest timer ticks every second
- Data age counter ticks every second

### 🟡 Android Network → Fixed
- `AndroidManifest.xml` — added `ACCESS_WIFI_STATE`, `CHANGE_WIFI_STATE`
- `network_security_config.xml` — allows HTTP to `192.168.4.1` (NodeMCU local AP)
  while keeping HTTPS enforcement for all other connections

---

## Project Structure

```
farmtrace/
├── src/
│   ├── config/
│   │   └── index.js          ← ALL configurable values (IP, MQTT, thresholds)
│   ├── context/
│   │   ├── NodeMcuContext.js  ← NodeMCU polling & sensor state
│   │   └── TripContext.js     ← Trip management & driver timers
│   ├── navigation/
│   │   └── AppNavigator.js    ← 6 tabs (Home, Monitor, Gateway, Logbook, Trips, Profile)
│   ├── screens/
│   │   ├── DashboardScreen.js ← Live summary (uses context)
│   │   ├── MonitorScreen.js   ← Detailed sensor view (uses context)
│   │   ├── NodeMcuScreen.js   ← 📡 NEW: Raw NodeMCU data viewer
│   │   ├── LogbookScreen.js   ← Driver timers + event log
│   │   ├── TripScreen.js      ← Trip list + start/end
│   │   └── ProfileScreen.js   ← Settings + MQTT toggle
│   ├── services/
│   │   ├── api.js             ← NodeMCU & backend API calls
│   │   ├── DatabaseService.js ← Local queue (in-memory, Phase 2)
│   │   └── SyncService.js     ← Background sync manager
│   └── theme/
│       └── colors.js
├── android/
│   └── app/src/main/
│       ├── AndroidManifest.xml               ← Wi-Fi permissions added
│       └── res/xml/network_security_config.xml ← NEW: HTTP allowed to 192.168.4.1
├── App.tsx                    ← Wraps app in context providers
└── package.json               ← react-native-vector-icons removed
```

---

## Configuration

Edit **`src/config/index.js`** — change these without touching any screen:

```js
NODEMCU_IP: '192.168.4.1'          // NodeMCU access point IP
MQTT_BROKER: 'broker.emqx.io'      // MQTT broker hostname
MQTT_PORT: 1883                     // MQTT port
NODEMCU_POLL_INTERVAL_MS: 2000     // How often to poll /api/data
THRESHOLDS.TEMPERATURE_MAX: 30     // Alert above this °C
THRESHOLDS.MQ6_MAX: 2000           // Alert above this ADC value
```

---

## NodeMCU Expected JSON

The app accepts both formats from `GET http://192.168.4.1/api/data`:

**Flat (current firmware):**
```json
{
  "temperature": 28.4,
  "humidity": 64.2,
  "mq6": 1320,
  "mq3": 870,
  "accelX": 0.12,
  "accelY": 0.04,
  "accelZ": 9.72,
  "gyroX": 0.02,
  "gyroY": 0.01,
  "gyroZ": 0.03,
  "timestamp": 123456
}
```

**Nested (future firmware):**
```json
{
  "container": { "temperature": 28.4, "humidity": 64.2, "mq6": 1320, "sequence": 42 },
  "driver": { "mq3": 870, "motion": { "accelX": 0.12, "accelY": 0.04, "accelZ": 9.72, "gyroX": 0.02, "gyroY": 0.01, "gyroZ": 0.03 } }
}
```

---

## Build & Run

### Prerequisites
- Node.js ≥ 22.11.0
- JDK 17 (set `org.gradle.java.home` in `android/gradle.properties` if needed)
- Android Studio / Android SDK (API 24+)
- Android device or emulator

### Steps

```bash
cd farmtrace
npm install
npx react-native run-android
```

---

## Physical Test Procedure

1. Power on NodeMCU gateway device
2. On your Android phone: Settings → Wi-Fi → connect to **FarmTrace_Gateway**
3. Open the FarmTrace app
4. Tap the **Gateway** tab (📡)
5. Tap **⚡ Connect**
6. Within 5 seconds you should see Temperature, Humidity, MQ-6 values populate
7. Tap **Monitor** tab — see the same values with min/max tracking
8. Tap **Home** tab — status banner should show SAFE / ALERT

---

## Known Limitations (Future Phases)

- MQTT bridge is UI-only; actual MQTT publish requires adding `react-native-mqtt` or `mqtt.js`
- Database is in-memory (no persistence between app restarts); add `react-native-sqlite-storage` for Phase 3
- No login/authentication yet; add navigation stack + AsyncStorage for persistent sessions
- Owner dashboard is web-only; add separate owner tab navigator in Phase 3
