/**
 * MonitorScreen — Monitor tab
 * Shows live sensor data from NodeMCU with min/max tracking.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { useNodeMcu } from '../context/NodeMcuContext';
import { Config } from '../config';

const fmt = (val, dec = 1) =>
  val === null || val === undefined ? '—' : Number(val).toFixed(dec);

const dataAgeLabel = (age) => {
  if (age === null || age === undefined) return 'Never';
  if (age === 0) return 'Just now';
  if (age < 60)  return `${age}s ago`;
  return `${Math.floor(age / 60)}m ago — stale`;
};

const SensorCard = ({ label, value, unit, min, max, color, alertValue, threshold }) => {
  const isAlert = alertValue !== null && alertValue !== undefined && threshold &&
    alertValue > threshold;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
          <View style={[styles.iconDot, { backgroundColor: isAlert ? colors.danger : color }]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sensorLabel}>{label}</Text>
          <Text style={[styles.sensorValue, isAlert && { color: colors.danger }]}>
            {value}
            <Text style={styles.sensorUnit}> {unit}</Text>
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: isAlert ? colors.dangerBg : colors.successBg },
        ]}>
          <Text style={[
            styles.statusText,
            { color: isAlert ? colors.danger : colors.success },
          ]}>
            {isAlert ? '⚠ Alert' : '● Normal'}
          </Text>
        </View>
      </View>
      {(min !== undefined || max !== undefined) && (
        <View style={styles.minMaxRow}>
          <Text style={styles.minMaxText}>Min: {min}</Text>
          <Text style={styles.minMaxText}>Max: {max}</Text>
          {threshold && (
            <Text style={styles.minMaxText}>Limit: {threshold}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const MonitorScreen = () => {
  const { status, sensorData, isPolling, startPolling } = useNodeMcu();

  // Track min/max per session
  const minMax = useRef({});

  const track = (key, val) => {
    if (val === null || val === undefined) return;
    const n = Number(val);
    if (!minMax.current[key]) minMax.current[key] = { min: n, max: n };
    minMax.current[key].min = Math.min(minMax.current[key].min, n);
    minMax.current[key].max = Math.max(minMax.current[key].max, n);
  };

  // Update min/max whenever sensor data changes
  useEffect(() => {
    track('temperature', sensorData.temperature);
    track('humidity',    sensorData.humidity);
    track('mq6',         sensorData.mq6);
    track('mq3',         sensorData.mq3);
  });

  const mmLabel = (key, dec = 1) => {
    const e = minMax.current[key];
    if (!e) return undefined;
    return `${fmt(e.min, dec)} / ${fmt(e.max, dec)}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.liveRow}>
        <View style={[
          styles.liveDot,
          { backgroundColor: isPolling && status.nodemcuApi === 'CONNECTED'
              ? colors.success : colors.textLight },
        ]} />
        <Text style={styles.liveText}>
          {isPolling && status.nodemcuApi === 'CONNECTED'
            ? `Live · Updated ${dataAgeLabel(sensorData.dataAge)}`
            : 'Not connected to NodeMCU'}
        </Text>
        {!isPolling && (
          <TouchableOpacity style={styles.connectBtn} onPress={startPolling}>
            <Text style={styles.connectBtnText}>Connect Gateway</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CONTAINER (ESP32) */}
      <Text style={styles.sectionLabel}>CONTAINER — ESP32</Text>

      <SensorCard
        label="Temperature"
        value={fmt(sensorData.temperature)}
        unit="°C"
        min={mmLabel('temperature')}
        max={undefined}
        color={colors.info}
        alertValue={sensorData.temperature}
        threshold={Config.THRESHOLDS.TEMPERATURE_MAX}
      />
      <SensorCard
        label="Humidity"
        value={fmt(sensorData.humidity)}
        unit="%"
        min={mmLabel('humidity')}
        max={undefined}
        color="#0369a1"
      />
      <SensorCard
        label="MQ-6 Gas"
        value={fmt(sensorData.mq6, 0)}
        unit="ADC"
        min={mmLabel('mq6', 0)}
        max={undefined}
        color="#c2410c"
        alertValue={sensorData.mq6}
        threshold={Config.THRESHOLDS.MQ6_MAX}
      />

      {/* GATEWAY / DRIVER (NodeMCU) */}
      <Text style={[styles.sectionLabel, { marginTop: 8 }]}>GATEWAY — NodeMCU</Text>

      <SensorCard
        label="MQ-3 Alcohol"
        value={fmt(sensorData.mq3, 0)}
        unit="ADC"
        min={mmLabel('mq3', 0)}
        max={undefined}
        color="#7c3aed"
        alertValue={sensorData.mq3}
        threshold={Config.THRESHOLDS.MQ3_MAX}
      />

      <View style={styles.card}>
        <Text style={styles.subLabel}>MPU-6050 Motion</Text>
        <View style={styles.motionGrid}>
          <MotionVal label="Accel X" value={`${fmt(sensorData.accelX, 3)} g`} />
          <MotionVal label="Accel Y" value={`${fmt(sensorData.accelY, 3)} g`} />
          <MotionVal label="Accel Z" value={`${fmt(sensorData.accelZ, 3)} g`} />
          <MotionVal label="Gyro X"  value={`${fmt(sensorData.gyroX,  3)} °/s`} />
          <MotionVal label="Gyro Y"  value={`${fmt(sensorData.gyroY,  3)} °/s`} />
          <MotionVal label="Gyro Z"  value={`${fmt(sensorData.gyroZ,  3)} °/s`} />
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const MotionVal = ({ label, value }) => (
  <View style={motionStyles.cell}>
    <Text style={motionStyles.label}>{label}</Text>
    <Text style={motionStyles.value}>{value}</Text>
  </View>
);

const motionStyles = StyleSheet.create({
  cell: {
    width: '33%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  label: { fontSize: 10, color: colors.textMuted, fontWeight: '500' },
  value: { fontSize: 13, fontWeight: '700', color: colors.text, fontFamily: 'monospace' },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  connectBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  connectBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  sensorLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sensorValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 1,
  },
  sensorUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  minMaxRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  minMaxText: {
    fontSize: 12,
    color: colors.textLight,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  motionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default MonitorScreen;
