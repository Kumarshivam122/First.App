// ─── FarmTrace Configuration ─────────────────────────────────────────────────
// MQTT-based telemetry — connects directly to broker.emqx.io via WebSocket

export const Config = {
  // MQTT Broker (same broker the ESP32 + NodeMCU publish to)
  MQTT_BROKER_WS: 'ws://broker.emqx.io:8083/mqtt',
  MQTT_CLIENT_ID: `FarmTrace_Mobile_${Math.random().toString(16).slice(2, 8)}`,

  // Topics published by ESP32 Container Node
  TOPIC_CONTAINER_DATA:   'farmtrace/container/data',
  TOPIC_CONTAINER_STATUS: 'farmtrace/container/status',

  // Topics published by NodeMCU Driver Node
  TOPIC_DRIVER_DATA:   'farmtrace/driver/data',
  TOPIC_DRIVER_STATUS: 'farmtrace/driver/status',

  // Sensor thresholds (used for alert indicators)
  THRESHOLDS: {
    TEMPERATURE_MAX: 30,
    TEMPERATURE_MIN: 0,
    HUMIDITY_MAX: 90,
    HUMIDITY_MIN: 20,
    MQ6_MAX: 600,
    MQ3_MAX: 800,
  },
};
