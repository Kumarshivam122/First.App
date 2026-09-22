import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

const DashboardScreen = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Greeting */}
      <Text style={styles.greeting}>{greeting}, Rajesh</Text>
      <Text style={styles.subtitle}>Trip FT-2026-001 · Dhanbad → Ranchi</Text>

      {/* Container Status Banner */}
      <View style={styles.statusBanner}>
        <View style={styles.statusDot} />
        <View>
          <Text style={styles.statusTitle}>Container Status: SAFE</Text>
          <Text style={styles.statusSub}>Last synchronized 12 seconds ago</Text>
        </View>
      </View>

      {/* Sensor Cards */}
      <Text style={styles.sectionLabel}>LIVE SENSOR READINGS</Text>
      <View style={styles.sensorGrid}>
        <SensorCard label="Temperature" value="5.8°C" status="Normal" color={colors.info} />
        <SensorCard label="Humidity" value="82.4%" status="Normal" color="#0369a1" />
        <SensorCard label="Ethylene" value="1.2 ppm" status="Normal" color="#c2410c" />
        <SensorCard label="Battery" value="87%" status="Good" color={colors.success} />
      </View>

      {/* Driver Status */}
      <Text style={styles.sectionLabel}>DRIVER STATUS</Text>
      <View style={styles.driverRow}>
        <View style={styles.driverCard}>
          <Text style={styles.driverCardLabel}>Driving</Text>
          <Text style={styles.driverCardValue}>04:32 h</Text>
        </View>
        <View style={styles.driverCard}>
          <Text style={styles.driverCardLabel}>Rest</Text>
          <Text style={[styles.driverCardValue, { color: colors.textMuted }]}>01:15 h</Text>
        </View>
      </View>

      <View style={styles.driverRow}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Start Rest</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      {/* Connectivity */}
      <Text style={styles.sectionLabel}>CONNECTIVITY</Text>
      <View style={styles.card}>
        <ConnRow label="Gateway" status="Connected" ok />
        <ConnRow label="MQTT" status="Connected" ok />
        <ConnRow label="Internet" status="Connected" ok />
        <ConnRow label="Backend" status="Connected" ok last />
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const SensorCard = ({ label, value, status, color }) => (
  <View style={styles.sensorCard}>
    <View style={[styles.sensorIcon, { backgroundColor: color + '18' }]}>
      <View style={[styles.sensorIconDot, { backgroundColor: color }]} />
    </View>
    <Text style={styles.sensorLabel}>{label}</Text>
    <Text style={styles.sensorValue}>{value}</Text>
    <Text style={[styles.sensorStatus, { color: colors.success }]}>● {status}</Text>
  </View>
);

const ConnRow = ({ label, status, ok, last }) => (
  <View style={[styles.connRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
    <Text style={styles.connLabel}>{label}</Text>
    <View style={[styles.connBadge, { backgroundColor: ok ? colors.successBg : colors.dangerBg }]}>
      <Text style={[styles.connBadgeText, { color: ok ? colors.success : colors.danger }]}>
        ● {status}
      </Text>
    </View>
  </View>
);

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
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  statusDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  statusSub: {
    fontSize: 12,
    color: colors.primaryDark,
    opacity: 0.7,
    marginTop: 1,
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
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sensorValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 2,
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
  driverCardLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  driverCardValue: {
    fontSize: 22,
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
    fontSize: 15,
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
    fontSize: 15,
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
