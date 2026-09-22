/**
 * DashboardScreen — Home tab
 * Shows live sensor summary + driver status + connectivity.
 * All values come from NodeMcuContext (real hardware) and TripContext.
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { useNodeMcu } from '../context/NodeMcuContext';
import { useTrip } from '../context/TripContext';
import { Config } from '../config';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (val, dec = 1) =>
  val === null || val === undefined ? '—' : Number(val).toFixed(dec);

const dataAgeLabel = (age) => {
  if (age === null || age === undefined) return 'Never';
  if (age === 0) return 'Just now';
  if (age < 60)  return `${age}s ago`;
  return `${Math.floor(age / 60)}m ago`;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const SensorCard = ({ label, value, unit, status, color, alert }) => (
  <View style={styles.sensorCard}>
    <View style={[styles.sensorIcon, { backgroundColor: color + '20' }]}>
      <View style={[styles.sensorIconDot, { backgroundColor: alert ? colors.danger : color }]} />
    </View>
    <Text style={styles.sensorLabel}>{label}</Text>
    <Text style={[styles.sensorValue, alert && { color: colors.danger }]}>
      {value}<Text style={styles.sensorUnit}> {unit}</Text>
    </Text>
    <Text style={[styles.sensorStatus, { color: alert ? colors.danger : colors.success }]}>
      {alert ? '⚠ Alert' : `● ${status}`}
    </Text>
  </View>
);

const ConnRow = ({ label, status, last }) => {
  const ok = status === 'CONNECTED';
  const warn = status === 'CONNECTING';
  const col = ok ? colors.success : warn ? colors.warning : colors.danger;
  const bg  = ok ? colors.successBg : warn ? colors.warningBg : colors.dangerBg;
  return (
    <View style={[styles.connRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
      <Text style={styles.connLabel}>{label}</Text>
      <View style={[styles.connBadge, { backgroundColor: bg }]}>
        <Text style={[styles.connBadgeText, { color: col }]}>● {status}</Text>
      </View>
    </View>
  );
};

// ─── Screen ──────────────────────────────────────────────────────────────────

const DashboardScreen = () => {
  const { status, sensorData, isPolling, startPolling } = useNodeMcu();
  const { activeTrip, drivingSeconds, restSeconds, driverStatus, formatTime, startRest, startDriving } = useTrip();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const overallSafe =
    status.nodemcuApi === 'CONNECTED' &&
    (sensorData.mq6  === null || sensorData.mq6  <= Config.THRESHOLDS.MQ6_MAX) &&
    (sensorData.mq3  === null || sensorData.mq3  <= Config.THRESHOLDS.MQ3_MAX) &&
    (sensorData.temperature === null ||
      (sensorData.temperature <= Config.THRESHOLDS.TEMPERATURE_MAX &&
       sensorData.temperature >= Config.THRESHOLDS.TEMPERATURE_MIN));

  const isAlertMq6  = sensorData.mq6  !== null && sensorData.mq6  > Config.THRESHOLDS.MQ6_MAX;
  const isAlertTemp = sensorData.temperature !== null &&
    (sensorData.temperature > Config.THRESHOLDS.TEMPERATURE_MAX ||
     sensorData.temperature < Config.THRESHOLDS.TEMPERATURE_MIN);

  const handleToggleRest = () => {
    if (driverStatus === 'driving') {
      startRest();
      Alert.alert('Rest Started', 'Rest timer is now running.');
    } else {
      startDriving();
      Alert.alert('Driving Resumed', 'Driving timer is now running.');
    }
  };

  const handleAddEvent = () => {
    Alert.alert(
      'Add Event',
      'Select event type:',
      [
        { text: 'Vehicle Inspection', onPress: () => {} },
        { text: 'Delivery Checkpoint', onPress: () => {} },
        { text: 'Fuel Stop', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Greeting */}
      <Text style={styles.greeting}>{greeting}, Driver</Text>
      <Text style={styles.subtitle}>
        {activeTrip
          ? `Trip ${activeTrip.id} · ${activeTrip.origin} → ${activeTrip.destination}`
          : 'No active trip'}
      </Text>

      {/* Container Status Banner */}
      <View style={[
        styles.statusBanner,
        {
          backgroundColor: overallSafe ? colors.successBg : colors.dangerBg,
          borderColor: overallSafe ? '#BBF7D0' : '#FECACA',
        },
      ]}>
        <View style={[styles.statusDot, { backgroundColor: overallSafe ? colors.success : colors.danger }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>
            Container Status: {overallSafe ? 'SAFE' : 'ALERT'}
          </Text>
          <Text style={styles.statusSub}>
            {isPolling
              ? `Last synchronized ${dataAgeLabel(sensorData.dataAge)}`
              : 'Gateway not connected — tap Gateway tab to connect'}
          </Text>
        </View>
        {!isPolling && (
          <TouchableOpacity style={styles.connectNowBtn} onPress={startPolling}>
            <Text style={styles.connectNowText}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sensor Cards */}
      <Text style={styles.sectionLabel}>LIVE SENSOR READINGS</Text>
      <View style={styles.sensorGrid}>
        <SensorCard
          label="Temperature"
          value={fmt(sensorData.temperature)}
          unit="°C"
          status="Normal"
          color={colors.info}
          alert={isAlertTemp}
        />
        <SensorCard
          label="Humidity"
          value={fmt(sensorData.humidity)}
          unit="%"
          status="Normal"
          color="#0369a1"
        />
        <SensorCard
          label="MQ-6 Gas"
          value={fmt(sensorData.mq6, 0)}
          unit="ADC"
          status="Normal"
          color="#c2410c"
          alert={isAlertMq6}
        />
        <SensorCard
          label="MQ-3 Alcohol"
          value={fmt(sensorData.mq3, 0)}
          unit="ADC"
          status="Normal"
          color="#7c3aed"
        />
      </View>

      {/* Driver Status */}
      <Text style={styles.sectionLabel}>DRIVER STATUS</Text>
      <View style={styles.driverRow}>
        <View style={[styles.driverCard, driverStatus === 'driving' && styles.driverCardActive]}>
          <Text style={styles.driverCardLabel}>Driving</Text>
          <Text style={[styles.driverCardValue, driverStatus !== 'driving' && { color: colors.textMuted }]}>
            {formatTime(drivingSeconds)}
          </Text>
        </View>
        <View style={[styles.driverCard, driverStatus === 'resting' && styles.driverCardActive]}>
          <Text style={styles.driverCardLabel}>Rest</Text>
          <Text style={[styles.driverCardValue, driverStatus !== 'resting' && { color: colors.textMuted }]}>
            {formatTime(restSeconds)}
          </Text>
        </View>
      </View>

      <View style={styles.driverRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleToggleRest}>
          <Text style={styles.primaryButtonText}>
            {driverStatus === 'driving' ? '⏸ Start Rest' : '▶ Resume Driving'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineButton} onPress={handleAddEvent}>
          <Text style={styles.outlineButtonText}>+ Add Event</Text>
        </TouchableOpacity>
      </View>

      {/* Connectivity */}
      <Text style={styles.sectionLabel}>CONNECTIVITY</Text>
      <View style={styles.card}>
        <ConnRow label="Gateway" status={isPolling ? status.nodemcuApi : 'DISCONNECTED'} />
        <ConnRow label="NodeMCU API" status={status.nodemcuApi} />
        <ConnRow label="MQTT" status="DISCONNECTED" />
        <ConnRow label="Internet" status="DISCONNECTED" last />
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  statusDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  statusSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  connectNowBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  connectNowText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  sensorCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sensorIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sensorIconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sensorLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sensorValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 2,
  },
  sensorUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
  },
  sensorStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  driverRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  driverCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  driverCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  driverCardLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  driverCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  connRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  connLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  connBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  connBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DashboardScreen;
