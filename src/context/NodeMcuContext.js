/**
 * NodeMcuContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the live connection to the backend via Socket.IO and
 * falls back to NodeMCU local Wi-Fi API polling.
 *
 * Architecture:
 *   Hardware → MQTT → Backend (Socket.IO) → this context → all screens
 *   Fallback: NodeMCU AP (192.168.4.1) → phone polling → this context
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
    setStatus(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  // ── Fetch one sensor packet from NodeMCU (fallback) ────────────────────────

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
      let parsed;
      if (raw.container && raw.driver) {
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
      updateStatus({
        nodemcuApi: 'CONNECTED',
        lastError: null,
        lastSuccess: new Date(),
        packetCount: (status.packetCount ?? 0) + 1,
      });
      addDebugLog(`OK — temp=${parsed.temperature} hum=${parsed.humidity} mq6=${parsed.mq6}`);
    } catch (err) {
      clearTimeout(tid);
      const msg = err.name === 'AbortError'
        ? 'Timeout — NodeMCU not reachable at 192.168.4.1'
        : `Fetch error: ${err.message}`;
      updateStatus({ nodemcuApi: 'ERROR', lastError: msg });
      addDebugLog(`FAIL — ${msg}`);
    }
  }, [addDebugLog, updateStatus, status.packetCount]);

  // ── Data-age ticker (updates every second) ────────────────────────────────

  useEffect(() => {
    ageTimer.current = setInterval(() => {
      setSensorData(prev => {
        if (!prev.timestamp || prev.dataAge === undefined) return prev;
        return { ...prev, dataAge: (prev.dataAge ?? 0) + 1 };
      });
    }, 1000);
    return () => clearInterval(ageTimer.current);
  }, []);

  // ── Socket.IO Connection (same pipeline as the website) ───────────────────

  useEffect(() => {
    const socketUrl = Config.API_BASE.replace('/api', '');
    const socket = io(socketUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      updateStatus({ nodemcuApi: 'CONNECTED', lastError: null });
      addDebugLog(`Socket connected (${socket.id})`);
    });

    socket.on('disconnect', () => {
      updateStatus({ nodemcuApi: 'DISCONNECTED' });
      addDebugLog('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      updateStatus({ nodemcuApi: 'ERROR', lastError: 'Socket connection failed' });
      addDebugLog(`Socket error: ${err.message}`);
    });

    socket.on('farmtrace:driver:data', (data) => {
      const parsed = {
        mq3:    data.mq3    ?? null,
        accelX: data.motion?.x ?? data.accelX ?? null,
        accelY: data.motion?.y ?? data.accelY ?? null,
        accelZ: data.motion?.z ?? data.accelZ ?? null,
        gyroX:  data.gyro?.x  ?? data.gyroX  ?? null,
        gyroY:  data.gyro?.y  ?? data.gyroY  ?? null,
        gyroZ:  data.gyro?.z  ?? data.gyroZ  ?? null,
        timestamp: data.timestamp ?? Date.now(),
        dataAge: 0,
      };
      setSensorData(prev => ({ ...prev, ...parsed }));
      updateStatus({
        nodemcuApi: 'CONNECTED',
        lastSuccess: new Date(),
      });
      addDebugLog(`Driver pkt — MQ3: ${parsed.mq3}`);
    });

    socket.on('farmtrace:container:data', (data) => {
      const parsed = {
        temperature: data.temperature ?? null,
        humidity:    data.humidity    ?? null,
        mq6:         data.mq6         ?? null,
        sequence:    data.sequence    ?? null,
        timestamp:   data.timestamp   ?? Date.now(),
        dataAge: 0,
      };
      setSensorData(prev => ({ ...prev, ...parsed }));
      updateStatus({
        nodemcuApi: 'CONNECTED',
        lastSuccess: new Date(),
      });
      addDebugLog(`Container pkt — Seq: ${parsed.sequence}, Temp: ${parsed.temperature}°C`);
    });

    socket.on('farmtrace:status', (s) => {
      addDebugLog(`Status: ${JSON.stringify(s)}`);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Start / Stop polling (fallback for local NodeMCU AP) ──────────────────

  const startPolling = useCallback(() => {
    if (pollTimer.current) return;
    setIsPolling(true);
    updateStatus({ nodemcuApi: 'CONNECTING' });
    addDebugLog('Starting NodeMCU poll…');

    fetchOnce();
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
        socket: socketRef.current,
      }}
    >
      {children}
    </NodeMcuContext.Provider>
  );
};
