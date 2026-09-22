// ─── FarmTrace Configuration ─────────────────────────────────────────────────
// Change these values without touching any screen or service file.

export const Config = {
  // NodeMCU local AP settings
  NODEMCU_IP: '192.168.4.1',
  NODEMCU_PORT: 80,
  NODEMCU_TIMEOUT_MS: 3000,
  NODEMCU_POLL_INTERVAL_MS: 2000, // how often we pull /api/data

  // MQTT (used by driver phone to publish and owner to subscribe)
  MQTT_BROKER: 'broker.emqx.io',
  MQTT_PORT: 1883,
  MQTT_WS_PORT: 8083,       // WebSocket port for browser / web dashboard
  MQTT_CLIENT_PREFIX: 'farmtrace_',
  MQTT_TOPIC_TELEMETRY: (cargoId) => `farmtrace/${cargoId}/telemetry`,
  MQTT_TOPIC_STATUS:    (cargoId) => `farmtrace/${cargoId}/status`,
  MQTT_TOPIC_ALERTS:    (cargoId) => `farmtrace/${cargoId}/alerts`,
  MQTT_TOPIC_COMMANDS:  (cargoId) => `farmtrace/${cargoId}/commands`,

  // Backend API (set to your server when available)
  API_BASE: 'http://10.0.2.2:5000/api',

  // Sensor thresholds (used for alert generation)
  THRESHOLDS: {
    TEMPERATURE_MAX: 30,
    TEMPERATURE_MIN: 0,
    HUMIDITY_MAX: 90,
    HUMIDITY_MIN: 20,
    MQ6_MAX: 2000,   // gas threshold (raw ADC)
    MQ3_MAX: 1500,   // alcohol threshold (raw ADC)
    ACCEL_MAX: 3.0,  // g-force for vibration alert
  },

  // Demo cargo (replace with real login/assignment in Phase 3)
  DEMO_CARGO_ID: 'CARGO001',
  DEMO_DRIVER_ID: 'DRIVER001',
};
