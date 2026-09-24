/**
 * NodeMcuContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the live connection to the NodeMCU local Wi-Fi API.
 *
 * Architecture:
 *   NodeMCU AP (192.168.4.1) → phone polling → this context → all screens
 *
 * Connection states: DISCONNECTED | CONNECTING | CONNECTED | ERROR
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { io } from 'socket.io-client';
//
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { Config } from '../config';

// ─── Types ───────────────────────────────────────────────────────────────────

const DEFAULT_STATUS = {
  nodemcuApi: 'DISCONNECTED', // DISCONNECTED | CONNECTING | CONNECTED | ERROR
  lastError: null,
  lastSuccess: null,
  packetCount: 0,
  pendingQueue: 0,
};

const DEFAULT_SENSOR_DATA = {
  // Container (ESP32 via nRF24 → NodeMCU)
  temperature: null,
  humidity: null,
  mq6: null,

  // Gateway (NodeMCU onboard)
  mq3: null,
  accelX: null,
  accelY: null,
  accelZ: null,
  gyroX: null,
  gyroY: null,
  gyroZ: null,

  timestamp: null,
  sequence: null,
  dataAge: null,   // seconds since last packet
};

// ─── Context ─────────────────────────────────────────────────────────────────

const NodeMcuContext = createContext(null);

export const useNodeMcu = () => {
  const ctx = useContext(NodeMcuContext);
  if (!ctx) throw new Error('useNodeMcu must be used inside NodeMcuProvider');
  return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const NodeMcuProvider = ({ children }) => {
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [sensorData, setSensorData] = useState(DEFAULT_SENSOR_DATA);
  const [isPolling, setIsPolling] = useState(false);
  const [debugLog, setDebugLog] = useState([]);

  const pollTimer = useRef(null);
  const socketRef = useRef(null);
  const ageTimer = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const addDebugLog = useCallback((msg) => {
    const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
    setDebugLog(prev => [entry, ...prev].slice(0, 50));
  }, []);

  const updateStatus = useCallback((patch) => {
    setStatus(prev => ({ ...prev, ...patch }));
  }, []);

  // ── Fetch one sensor packet from NodeMCU ──────────────────────────────────

  const fetchOnce = useCallback(async () => {
    const url = `http://${Config.NODEMCU_IP}:${Config.NODEMCU_PORT}/api/data`;
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), Config.NODEMCU_TIMEOUT_MS);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(tid);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();

      // Support both flat and nested NodeMCU JSON formats
      // Flat:   { temperature, humidity, mq6, mq3, accelX … }
      // Nested: { container: { temperature … }, driver: { mq3 … motion: { accelX … } } }
      let parsed;
      if (raw.container && raw.driver) {
        // nested format
        const { container, driver } = raw;
        const motion = driver.motion || {};
        parsed = {
          temperature: container.temperature ?? null,
          humidity:    container.humidity    ?? null,
          mq6:         container.mq6         ?? null,
          mq3:         driver.mq3            ?? null,
          accelX:      motion.accelX         ?? null,
          accelY:      motion.accelY         ?? null,
          accelZ:      motion.accelZ         ?? null,
          gyroX:       motion.gyroX          ?? null,
          gyroY:       motion.gyroY          ?? null,
          gyroZ:       motion.gyroZ          ?? null,
          timestamp:   container.sequence    ?? Date.now(),
          sequence:    container.sequence    ?? null,
        };
      } else {
        // flat format (current firmware)
        parsed = {
          temperature: raw.temperature ?? null,
          humidity:    raw.humidity    ?? null,
          mq6:         raw.mq6         ?? null,
          mq3:         raw.mq3         ?? null,
          accelX:      raw.accelX      ?? null,
          accelY:      raw.accelY      ?? null,
          accelZ:      raw.accelZ      ?? null,
          gyroX:       raw.gyroX       ?? null,
          gyroY:       raw.gyroY       ?? null,
          gyroZ:       raw.gyroZ       ?? null,
          timestamp:   raw.timestamp   ?? Date.now(),
          sequence:    raw.sequence    ?? null,
        };
      }

      parsed.dataAge = 0;
      setSensorData(parsed);
      updateStatus(prev => ({
        nodemcuApi: 'CONNECTED',
        lastError: null,
        lastSuccess: new Date(),
        packetCount: (prev?.packetCount ?? 0) + 1,
      }));
      addDebugLog(`OK — temp=${parsed.temperature} hum=${parsed.humidity} mq6=${parsed.mq6}`);
    } catch (err) {
      clearTimeout(tid);
      const msg = err.name === 'AbortError'
        ? 'Timeout — NodeMCU not reachable at 192.168.4.1'
        : `Fetch error: ${err.message}`;
      updateStatus({ nodemcuApi: 'ERROR', lastError: msg });
      addDebugLog(`FAIL — ${msg}`);
    }
  }, [addDebugLog, updateStatus]);

  // ── Data-age ticker (updates every second) ────────────────────────────────

  useEffect(() => {
    ageTimer.current = setInterval(() => {
      setSensorData(prev => {
        if (!prev.timestamp || !prev.dataAge === undefined) return prev;
        return { ...prev, dataAge: (prev.dataAge ?? 0) + 1 };
      });
    }, 1000);
    return () => clearInterval(ageTimer.current);
  }, []);

  // ── Socket.IO Connection ──────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(Config.API_BASE.replace('/api', ''), { reconnectionAttempts: 10, reconnectionDelay: 2000 });
    socketRef.current = socket;
    
    socket.on('connect', () => updateStatus({ nodemcuApi: 'CONNECTED' }));
    socket.on('disconnect', () => updateStatus({ nodemcuApi: 'DISCONNECTED' }));
    socket.on('connect_error', () => updateStatus({ nodemcuApi: 'ERROR', lastError: 'Socket connection failed' }));
    
    socket.on('farmtrace:driver:data', (data) => {
      setSensorData(prev => ({ ...prev, ...data, dataAge: 0 }));
      updateStatus(prev => ({ lastSuccess: new Date(), packetCount: prev.packetCount + 1 }));
    });
    
    socket.on('farmtrace:container:data', (data) => {
      setSensorData(prev => ({ ...prev, ...data, dataAge: 0 }));
      updateStatus(prev => ({ lastSuccess: new Date(), packetCount: prev.packetCount + 1 }));
    });
    
    return () => socket.disconnect();
  }, [updateStatus]);

  // ── Start / Stop polling ──────────────────────────────────────────────────

  const startPolling = useCallback(() => {
    if (pollTimer.current) return; // already running
    setIsPolling(true);
    updateStatus({ nodemcuApi: 'CONNECTING' });
    addDebugLog('Starting NodeMCU poll…');

    fetchOnce(); // immediate first fetch
    pollTimer.current = setInterval(fetchOnce, Config.NODEMCU_POLL_INTERVAL_MS);
  }, [fetchOnce, addDebugLog, updateStatus]);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    setIsPolling(false);
    updateStatus({ nodemcuApi: 'DISCONNECTED' });
    setSensorData(DEFAULT_SENSOR_DATA);
    addDebugLog('Polling stopped');
  }, [addDebugLog, updateStatus]);

  // cleanup on unmount
  useEffect(() => () => {
    clearInterval(pollTimer.current);
    clearInterval(ageTimer.current);
  }, []);

  // ── Manual one-shot refresh ───────────────────────────────────────────────

  const refresh = useCallback(() => {
    if (!isPolling) return;
    fetchOnce();
  }, [isPolling, fetchOnce]);

  return (
    <NodeMcuContext.Provider
      value={{
        status,
        sensorData,
        isPolling,
        debugLog,
        startPolling,
        stopPolling,
        refresh,
      }}
    >
      {children}
    </NodeMcuContext.Provider>
  );
};
