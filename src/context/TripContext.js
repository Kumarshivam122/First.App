/**
 * TripContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the current active trip and transport state.
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Config } from '../config';

const TripContext = createContext(null);

export const useTrip = () => {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used inside TripProvider');
  return ctx;
};

const DEMO_TRIPS = [
  {
    id: 'FT-2026-001',
    origin: 'Dhanbad',
    destination: 'Ranchi',
    status: 'active',
    date: '21 Sep 2026',
    startTime: '08:00',
    cargoId: Config.DEMO_CARGO_ID,
    driverId: Config.DEMO_DRIVER_ID,
    vehicle: 'JH10AB1234',
    alerts: 2,
    recordCount: 0,
  },
  {
    id: 'FT-2026-000',
    origin: 'Kolkata',
    destination: 'Dhanbad',
    status: 'completed',
    date: '18 Sep 2026',
    startTime: '06:30',
    cargoId: Config.DEMO_CARGO_ID,
    driverId: Config.DEMO_DRIVER_ID,
    vehicle: 'JH10AB1234',
    alerts: 0,
    recordCount: 2048,
  },
];

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useState(DEMO_TRIPS);
  const [activeTrip, setActiveTrip] = useState(
    DEMO_TRIPS.find(t => t.status === 'active') || null,
  );
  const [drivingSeconds, setDrivingSeconds] = useState(16320); // 4h 32m
  const [restSeconds, setRestSeconds] = useState(4500);        // 1h 15m
  const [driverStatus, setDriverStatus] = useState('driving'); // 'driving' | 'resting'
  const [logbook, setLogbook] = useState([
    { time: '14:20', title: 'Delivery Checkpoint', desc: 'Arrived at checkpoint B', dot: '#16A34A' },
    { time: '12:15', title: 'Driving', desc: 'Resumed driving after rest', dot: '#16A34A' },
    { time: '11:30', title: 'Rest', desc: 'Rest period — 45 minutes', dot: '#F59E0B' },
    { time: '09:45', title: 'Driving', desc: 'Started driving — NH-2', dot: '#16A34A' },
    { time: '08:10', title: 'Vehicle Inspection', desc: 'All systems clear', dot: '#2563EB' },
    { time: '08:00', title: 'Trip Started', desc: 'Origin: Dhanbad warehouse', dot: '#16A34A' },
  ]);

  const timerRef = useRef(null);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  };

  const startTimer = useCallback((which) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (which === 'driving') setDrivingSeconds(s => s + 1);
      else setRestSeconds(s => s + 1);
    }, 1000);
  }, []);

  const addLogEntry = useCallback((title, desc, dot = '#16A34A') => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLogbook(prev => [{ time, title, desc, dot }, ...prev]);
  }, []);

  const startRest = useCallback(() => {
    if (driverStatus === 'resting') return;
    setDriverStatus('resting');
    startTimer('rest');
    addLogEntry('Rest', 'Rest period started', '#F59E0B');
  }, [driverStatus, startTimer, addLogEntry]);

  const startDriving = useCallback(() => {
    if (driverStatus === 'driving') return;
    setDriverStatus('driving');
    startTimer('driving');
    addLogEntry('Driving', 'Resumed driving', '#16A34A');
  }, [driverStatus, startTimer, addLogEntry]);

  const startNewTrip = useCallback((origin, destination) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newTrip = {
      id: `FT-${now.getFullYear()}-${String(trips.length).padStart(3, '0')}`,
      origin: origin || 'Current Location',
      destination: destination || 'Destination',
      status: 'active',
      date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      startTime: time,
      cargoId: Config.DEMO_CARGO_ID,
      driverId: Config.DEMO_DRIVER_ID,
      vehicle: 'JH10AB1234',
      alerts: 0,
      recordCount: 0,
    };
    setTrips(prev => [newTrip, ...prev.map(t =>
      t.status === 'active' ? { ...t, status: 'completed' } : t,
    )]);
    setActiveTrip(newTrip);
    setDrivingSeconds(0);
    setRestSeconds(0);
    setDriverStatus('driving');
    startTimer('driving');
    addLogEntry('Trip Started', `Origin: ${newTrip.origin}`, '#16A34A');
  }, [trips, startTimer, addLogEntry]);

  const endTrip = useCallback(() => {
    if (!activeTrip) return;
    clearInterval(timerRef.current);
    addLogEntry('Trip Ended', `Destination: ${activeTrip.destination}`, '#2563EB');
    setTrips(prev => prev.map(t =>
      t.id === activeTrip.id ? { ...t, status: 'completed' } : t,
    ));
    setActiveTrip(null);
    setDriverStatus('driving');
  }, [activeTrip, addLogEntry]);

  // Start timer for demo (driving by default)
  React.useEffect(() => {
    startTimer('driving');
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTrip,
        drivingSeconds,
        restSeconds,
        driverStatus,
        logbook,
        formatTime,
        startRest,
        startDriving,
        startNewTrip,
        endTrip,
        addLogEntry,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};
