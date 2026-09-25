/**
 * MqttContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Connects directly to broker.emqx.io via WebSocket (port 8083).
 * Subscribes to the same MQTT topics the ESP32 + NodeMCU hardware publishes to.
 *
 * Data flow:
 *   ESP32 → WiFi → broker.emqx.io:1883 → topic: farmtrace/container/data
 *   NodeMCU → WiFi → broker.emqx.io:1883 → topic: farmtrace/driver/data
 *   Mobile → WebSocket → broker.emqx.io:8083 → subscribes to both topics
 */

import React, {
  createContext, useContext, useState, useEffect, useRef, useCallback,
} from 'react';
import mqtt from 'mqtt';
import { Config } from '../config';

const MqttContext = createContext(null);

export const useMqtt = () => {
  const ctx = useContext(MqttContext);
  if (!ctx) throw new Error('useMqtt must be used inside MqttProvider');
  return ctx;
};

export const MqttProvider = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [containerData, setContainerData] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [containerOnline, setContainerOnline] = useState(false);
  const [driverOnline, setDriverOnline] = useState(false);
  const [packetCount, setPacketCount] = useState({ container: 0, driver: 0 });
  const [lastContainerTime, setLastContainerTime] = useState(null);
  const [lastDriverTime, setLastDriverTime] = useState(null);
  const [debugLog, setDebugLog] = useState([]);

  const clientRef = useRef(null);
  const containerTimeoutRef = useRef(null);
  const driverTimeoutRef = useRef(null);

  const addLog = useCallback((msg) => {
    const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
    setDebugLog(prev => [entry, ...prev].slice(0, 30));
  }, []);

  // Mark device offline if no data for 15s
  const resetDeviceTimeout = useCallback((device) => {
    if (device === 'container') {
      if (containerTimeoutRef.current) clearTimeout(containerTimeoutRef.current);
      setContainerOnline(true);
      containerTimeoutRef.current = setTimeout(() => setContainerOnline(false), 15000);
    } else {
      if (driverTimeoutRef.current) clearTimeout(driverTimeoutRef.current);
      setDriverOnline(true);
      driverTimeoutRef.current = setTimeout(() => setDriverOnline(false), 15000);
    }
  }, []);

  useEffect(() => {
    addLog('Connecting to broker.emqx.io:8083...');
    setConnectionStatus('CONNECTING');

    const client = mqtt.connect(Config.MQTT_BROKER_WS, {
      clientId: Config.MQTT_CLIENT_ID,
      clean: true,
      connectTimeout: 10000,
      reconnectPeriod: 3000,
    });
    clientRef.current = client;

    client.on('connect', () => {
      setConnectionStatus('CONNECTED');
      addLog('MQTT connected');

      // Subscribe to hardware topics
      const topics = [
        Config.TOPIC_CONTAINER_DATA,
        Config.TOPIC_CONTAINER_STATUS,
        Config.TOPIC_DRIVER_DATA,
        Config.TOPIC_DRIVER_STATUS,
      ];
      client.subscribe(topics, { qos: 0 }, (err) => {
        if (err) {
          addLog(`Subscribe error: ${err.message}`);
        } else {
          addLog(`Subscribed to ${topics.length} topics`);
        }
      });
    });

    client.on('reconnect', () => {
      setConnectionStatus('CONNECTING');
      addLog('Reconnecting...');
    });

    client.on('close', () => {
      setConnectionStatus('DISCONNECTED');
      addLog('Connection closed');
    });

    client.on('error', (err) => {
      setConnectionStatus('ERROR');
      addLog(`Error: ${err.message}`);
    });

    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());

        if (topic === Config.TOPIC_CONTAINER_DATA) {
          setContainerData(data);
          setLastContainerTime(new Date());
          setPacketCount(prev => ({ ...prev, container: prev.container + 1 }));
          resetDeviceTimeout('container');
        } else if (topic === Config.TOPIC_DRIVER_DATA) {
          setDriverData(data);
          setLastDriverTime(new Date());
          setPacketCount(prev => ({ ...prev, driver: prev.driver + 1 }));
          resetDeviceTimeout('driver');
        } else if (topic === Config.TOPIC_CONTAINER_STATUS) {
          addLog(`Container status: ${message.toString()}`);
          resetDeviceTimeout('container');
        } else if (topic === Config.TOPIC_DRIVER_STATUS) {
          addLog(`Driver status: ${message.toString()}`);
          resetDeviceTimeout('driver');
        }
      } catch (e) {
        addLog(`Parse error: ${e.message}`);
      }
    });

    return () => {
      client.end(true);
      clearTimeout(containerTimeoutRef.current);
      clearTimeout(driverTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MqttContext.Provider value={{
      connectionStatus,
      containerData,
      driverData,
      containerOnline,
      driverOnline,
      packetCount,
      lastContainerTime,
      lastDriverTime,
      debugLog,
    }}>
      {children}
    </MqttContext.Provider>
  );
};
