/**
 * DashboardScreen — Home tab
 * Live overview of all sensor data from both hardware devices.
 * All data comes from MqttContext (real MQTT from broker.emqx.io).
 */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { colors } from '../theme/colors';
import { useMqtt } from '../context/MqttContext';
import { Config } from '../config';

const fmt = (val, dec = 1) =>
  val === null || val === undefined ? '—' : Number(val).toFixed(dec);

const StatusDot = ({ online }) => (
  <View style={[styles.dot, { backgroundColor: online ? colors.success : colors.danger }]} />
);

const SensorTile = ({ label, value, unit, icon, color, alert }) => (
  <View style={[styles.tile, alert && { borderColor: colors.danger }]}>
    <Text style={styles.tileIcon}>{icon}</Text>
    <Text style={styles.tileLabel}>{label}</Text>
    <Text style={[styles.tileValue, { color: alert ? colors.danger : color || colors.text }]}>
      {value}<Text style={styles.tileUnit}> {unit}</Text>
    </Text>
    {alert && <Text style={styles.alertBadge}>⚠ ALERT</Text>}
  </View>
);

const ConnBadge = ({ status }) => {
  const isOk = status === 'CONNECTED';
  const isWarn = status === 'CONNECTING';
  const bg = isOk ? colors.successBg : isWarn ? colors.warningBg : colors.dangerBg;
  const fg = isOk ? colors.success : isWarn ? colors.warning : colors.danger;
  return (
    <View style={[styles.connBadge, { backgroundColor: bg }]}>
      <Text style={[styles.connBadgeText, { color: fg }]}>● {status}</Text>
    </View>
  );
};

const DashboardScreen = () => {
  const {
    connectionStatus, containerData, driverData,
    containerOnline, driverOnline, packetCount,
  } = useMqtt();

  const cd = containerData || {};
  const dd = driverData || {};

  const tempAlert = cd.temperature != null && (cd.temperature > Config.THRESHOLDS.TEMPERATURE_MAX || cd.temperature < Config.THRESHOLDS.TEMPERATURE_MIN);
  const gasAlert = cd.mq6 != null && cd.mq6 > Config.THRESHOLDS.MQ6_MAX;
  const mq3Alert = dd.mq3 != null && dd.mq3 > Config.THRESHOLDS.MQ3_MAX;
  const allSafe = !tempAlert && !gasAlert && !mq3Alert && connectionStatus === 'CONNECTED';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={styles.title}>FarmTrace</Text>
        <Text style={styles.subtitle}>Live Hardware Telemetry</Text>

        {/* MQTT Connection */}
        <View style={styles.connRow}>
          <Text style={styles.connLabel}>MQTT Broker</Text>
          <ConnBadge status={connectionStatus} />
        </View>

        {/* Overall Status */}
        <View style={[styles.statusCard, {
          backgroundColor: allSafe ? colors.successBg : colors.dangerBg,
          borderColor: allSafe ? colors.success : colors.danger,
        }]}>
          <Text style={styles.statusEmoji}>{allSafe ? '✅' : '⚠️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusTitle, { color: allSafe ? colors.success : colors.danger }]}>
              {allSafe ? 'ALL SYSTEMS NORMAL' : 'ATTENTION REQUIRED'}
            </Text>
            <Text style={styles.statusSub}>
              Packets: {packetCount.container + packetCount.driver} received
            </Text>
          </View>
        </View>

        {/* Device Status */}
        <Text style={styles.section}>DEVICES</Text>
        <View style={styles.deviceRow}>
          <View style={styles.deviceCard}>
            <StatusDot online={containerOnline} />
            <Text style={styles.deviceName}>Container ESP32</Text>
            <Text style={styles.deviceStatus}>{containerOnline ? 'Online' : 'Offline'}</Text>
            <Text style={styles.devicePkts}>{packetCount.container} pkts</Text>
          </View>
          <View style={styles.deviceCard}>
            <StatusDot online={driverOnline} />
            <Text style={styles.deviceName}>Driver NodeMCU</Text>
            <Text style={styles.deviceStatus}>{driverOnline ? 'Online' : 'Offline'}</Text>
            <Text style={styles.devicePkts}>{packetCount.driver} pkts</Text>
          </View>
        </View>

        {/* Container Sensors */}
        <Text style={styles.section}>CONTAINER SENSORS</Text>
        <View style={styles.grid}>
          <SensorTile label="Temperature" value={fmt(cd.temperature)} unit="°C" icon="🌡️" color={colors.cyan} alert={tempAlert} />
          <SensorTile label="Humidity" value={fmt(cd.humidity)} unit="%" icon="💧" color={colors.info} />
          <SensorTile label="MQ-6 Gas" value={fmt(cd.mq6, 0)} unit="ADC" icon="🔥" color={colors.orange} alert={gasAlert} />
          <SensorTile label="Battery" value={fmt(cd.battery)} unit="%" icon="🔋" color={colors.success} />
          <SensorTile label="Solar" value={fmt(cd.solar)} unit="V" icon="☀️" color={colors.warning} />
          <SensorTile label="Sequence" value={cd.sequence ?? '—'} unit="" icon="📦" color={colors.purple} />
        </View>

        {/* Driver Sensors */}
        <Text style={styles.section}>DRIVER SENSORS</Text>
        <View style={styles.grid}>
          <SensorTile label="MQ-3 Alcohol" value={fmt(dd.mq3, 0)} unit="ADC" icon="🍺" color={colors.purple} alert={mq3Alert} />
          <SensorTile label="Temperature" value={fmt(dd.temperature)} unit="°C" icon="🌡️" color={colors.cyan} />
          <SensorTile label="Motion X" value={fmt(dd.motion?.x, 2)} unit="m/s²" icon="📐" color={colors.info} />
          <SensorTile label="Motion Z" value={fmt(dd.motion?.z, 2)} unit="m/s²" icon="📐" color={colors.info} />
          <SensorTile label="Battery" value={fmt(dd.battery)} unit="%" icon="🔋" color={colors.success} />
          <SensorTile label="Solar" value={fmt(dd.solar)} unit="V" icon="☀️" color={colors.warning} />
        </View>

        {/* GPS */}
        {cd.gps && (
          <>
            <Text style={styles.section}>GPS LOCATION</Text>
            <View style={styles.gpsCard}>
              <Text style={styles.gpsIcon}>📍</Text>
              <View>
                <Text style={styles.gpsText}>Lat: {cd.gps.lat?.toFixed(6)}</Text>
                <Text style={styles.gpsText}>Lng: {cd.gps.lng?.toFixed(6)}</Text>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: 26, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 16 },
  connRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  connLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  connBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  connBadgeText: { fontSize: 12, fontWeight: '700' },
  statusCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 20, gap: 12 },
  statusEmoji: { fontSize: 28 },
  statusTitle: { fontSize: 14, fontWeight: '800' },
  statusSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  section: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1, marginBottom: 10, marginTop: 8 },
  deviceRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  deviceCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginBottom: 6 },
  deviceName: { fontSize: 12, fontWeight: '700', color: colors.text, textAlign: 'center' },
  deviceStatus: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  devicePkts: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  tile: { width: '48%', backgroundColor: colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border },
  tileIcon: { fontSize: 20, marginBottom: 6 },
  tileLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  tileValue: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 2 },
  tileUnit: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
  alertBadge: { fontSize: 10, color: colors.danger, fontWeight: '700', marginTop: 4 },
  gpsCard: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 12, marginBottom: 16 },
  gpsIcon: { fontSize: 24 },
  gpsText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
});

export default DashboardScreen;
