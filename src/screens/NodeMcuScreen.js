/**
 * NodeMcuScreen  (Gateway tab)
 * ─────────────────────────────────────────────────────────────────────────────
 * Live NodeMCU data viewer.
 *
 * ┌──────────────────────────────────────────────┐
 * │ 📡 GATEWAY STATUS   [CONNECT] [DISCONNECT]   │
 * │ Status: CONNECTED / DISCONNECTED / ERROR      │
 * │ IP: 192.168.4.1  Packets: 1024               │
 * ├──────────────────────────────────────────────┤
 * │ CONTAINER (ESP32 via nRF24)                   │
 * │  Temperature  28.4 °C                         │
 * │  Humidity     64.2 %                          │
 * │  MQ-6 Gas     1320                            │
 * ├──────────────────────────────────────────────┤
 * │ GATEWAY / DRIVER (NodeMCU onboard)            │
 * │  MQ-3 Alcohol  870                            │
 * │  Accel X       0.12 g                         │
 * │  Accel Y       0.04 g                         │
 * │  Accel Z       9.72 g                         │
 * │  Gyro X        0.02 °/s                       │
 * │  Gyro Y        0.01 °/s                       │
 * │  Gyro Z        0.03 °/s                       │
 * ├──────────────────────────────────────────────┤
 * │ Last updated 2s ago   [REFRESH]              │
 * ├──────────────────────────────────────────────┤
 * │ DEBUG LOG  (last 20 entries)                  │
 * └──────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNodeMcu } from '../context/NodeMcuContext';
import { colors } from '../theme/colors';
import { Config } from '../config';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val, decimals = 1) =>
  val === null || val === undefined ? '—' : Number(val).toFixed(decimals);

const statusColor = (s) => {
  if (s === 'CONNECTED')    return colors.success;
  if (s === 'CONNECTING')   return colors.warning;
  if (s === 'ERROR')        return colors.danger;
  return colors.textLight;
};

const statusBg = (s) => {
  if (s === 'CONNECTED')    return colors.successBg;
  if (s === 'CONNECTING')   return colors.warningBg;
  if (s === 'ERROR')        return colors.dangerBg;
  return colors.borderLight;
};

const dataAgeText = (age) => {
  if (age === null || age === undefined) return 'Never';
  if (age < 5)  return `${age}s ago`;
  if (age < 60) return `${age}s ago — stale`;
  return `${Math.floor(age / 60)}m ago — very stale`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SensorRow = ({ label, value, unit, alert }) => (
  <View style={sensorStyles.row}>
    <Text style={sensorStyles.label}>{label}</Text>
    <Text style={[sensorStyles.value, alert && { color: colors.danger }]}>
      {value} {unit}
    </Text>
  </View>
);

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionLabel}>{title}</Text>
);

const StatusBadge = ({ status }) => (
  <View style={[styles.badge, { backgroundColor: statusBg(status) }]}>
    <Text style={[styles.badgeText, { color: statusColor(status) }]}>
      ● {status}
    </Text>
  </View>
);

// ─── Screen ──────────────────────────────────────────────────────────────────

const NodeMcuScreen = () => {
  const { status, sensorData, isPolling, debugLog, startPolling, stopPolling, refresh } =
    useNodeMcu();
  const [showDebug, setShowDebug] = useState(false);

  const handleConnect = () => {
    if (isPolling) {
      Alert.alert(
        'Already Connected',
        'NodeMCU polling is already running.',
        [{ text: 'OK' }],
      );
      return;
    }
    Alert.alert(
      'Connect to NodeMCU',
      `Make sure your phone is connected to the\n"FarmTrace_Gateway" Wi-Fi network.\n\nThe app will poll http://${Config.NODEMCU_IP}/api/data every 2 seconds.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Connect', onPress: startPolling },
      ],
    );
  };

  const handleDisconnect = () => {
    if (!isPolling) return;
    Alert.alert(
      'Disconnect',
      'Stop receiving live sensor data from NodeMCU?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: stopPolling },
      ],
    );
  };

  const isAlertMq6   = sensorData.mq6   !== null && sensorData.mq6   > Config.THRESHOLDS.MQ6_MAX;
  const isAlertMq3   = sensorData.mq3   !== null && sensorData.mq3   > Config.THRESHOLDS.MQ3_MAX;
  const isAlertTemp  = sensorData.temperature !== null &&
    (sensorData.temperature > Config.THRESHOLDS.TEMPERATURE_MAX ||
     sensorData.temperature < Config.THRESHOLDS.TEMPERATURE_MIN);
  const accelTotal   = sensorData.accelX !== null
    ? Math.sqrt(
        Math.pow(sensorData.accelX, 2) +
        Math.pow(sensorData.accelY, 2) +
        Math.pow(sensorData.accelZ, 2),
      )
    : null;
  const isAlertAccel = accelTotal !== null && Math.abs(accelTotal - 9.81) > Config.THRESHOLDS.ACCEL_MAX;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Status Banner ──────────────────────────────────────────────────── */}
      <View style={[
        styles.banner,
        { borderColor: statusColor(status.nodemcuApi) + '40',
          backgroundColor: statusBg(status.nodemcuApi) },
      ]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>NodeMCU Gateway</Text>
          <Text style={styles.bannerIp}>
            {Config.NODEMCU_IP}:{Config.NODEMCU_PORT}
          </Text>
          {status.lastError && (
            <Text style={styles.bannerError} numberOfLines={2}>
              {status.lastError}
            </Text>
          )}
        </View>
        <StatusBadge status={status.nodemcuApi} />
      </View>

      {/* ── Action Buttons ─────────────────────────────────────────────────── */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, isPolling && styles.btnDisabled]}
          onPress={handleConnect}
          disabled={isPolling}
        >
          <Text style={styles.btnPrimaryText}>
            {isPolling ? '● Connected' : '⚡ Connect'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnDanger, !isPolling && styles.btnDisabled]}
          onPress={handleDisconnect}
          disabled={!isPolling}
        >
          <Text style={[styles.btnDangerText, !isPolling && { opacity: 0.4 }]}>
            Disconnect
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnOutline, !isPolling && styles.btnDisabled]}
          onPress={refresh}
          disabled={!isPolling}
        >
          <Text style={[styles.btnOutlineText, !isPolling && { opacity: 0.4 }]}>
            ↺
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <View style={styles.statsBar}>
        <Text style={styles.statItem}>
          Packets: {status.packetCount}
        </Text>
        <Text style={styles.statItem}>
          Last: {dataAgeText(sensorData.dataAge)}
        </Text>
        {isPolling && (
          <Text style={[styles.statItem, { color: colors.success }]}>
            ● Live
          </Text>
        )}
      </View>

      {/* ── Container Sensors (ESP32) ──────────────────────────────────────── */}
      <SectionHeader title="CONTAINER — ESP32 via nRF24" />
      <View style={styles.card}>
        <SensorRow
          label="Temperature"
          value={fmt(sensorData.temperature)}
          unit="°C"
          alert={isAlertTemp}
        />
        <SensorRow
          label="Humidity"
          value={fmt(sensorData.humidity)}
          unit="%"
        />
        <SensorRow
          label="MQ-6 Gas"
          value={fmt(sensorData.mq6, 0)}
          unit="ADC"
          alert={isAlertMq6}
        />
        {isAlertMq6 && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertText}>
              ⚠ MQ-6 exceeds threshold ({Config.THRESHOLDS.MQ6_MAX})
            </Text>
          </View>
        )}
        {isAlertTemp && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertText}>
              ⚠ Temperature out of range ({Config.THRESHOLDS.TEMPERATURE_MIN}–{Config.THRESHOLDS.TEMPERATURE_MAX} °C)
            </Text>
          </View>
        )}
      </View>

      {/* ── Gateway / Driver Sensors (NodeMCU) ────────────────────────────── */}
      <SectionHeader title="GATEWAY — NodeMCU Onboard" />
      <View style={styles.card}>
        <SensorRow
          label="MQ-3 Alcohol"
          value={fmt(sensorData.mq3, 0)}
          unit="ADC"
          alert={isAlertMq3}
        />
        {isAlertMq3 && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertText}>
              ⚠ MQ-3 exceeds threshold ({Config.THRESHOLDS.MQ3_MAX})
            </Text>
          </View>
        )}

        <View style={styles.divider} />
        <Text style={styles.subLabel}>MPU-6050 Accelerometer</Text>
        <SensorRow label="Accel X" value={fmt(sensorData.accelX, 3)} unit="g" alert={isAlertAccel} />
        <SensorRow label="Accel Y" value={fmt(sensorData.accelY, 3)} unit="g" />
        <SensorRow label="Accel Z" value={fmt(sensorData.accelZ, 3)} unit="g" />

        <View style={styles.divider} />
        <Text style={styles.subLabel}>MPU-6050 Gyroscope</Text>
        <SensorRow label="Gyro X" value={fmt(sensorData.gyroX, 3)} unit="°/s" />
        <SensorRow label="Gyro Y" value={fmt(sensorData.gyroY, 3)} unit="°/s" />
        <SensorRow label="Gyro Z" value={fmt(sensorData.gyroZ, 3)} unit="°/s" />

        {isAlertAccel && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertText}>
              ⚠ High vibration / impact detected
            </Text>
          </View>
        )}
      </View>

      {/* ── Connection Guide (when disconnected) ──────────────────────────── */}
      {!isPolling && (
        <>
          <SectionHeader title="HOW TO CONNECT" />
          <View style={styles.card}>
            <Step n="1" done={false} title='Open phone Wi-Fi settings'
              desc='Go to Settings → Wi-Fi on your Android phone.' />
            <Step n="2" done={false} title='Connect to FarmTrace_Gateway'
              desc='Select "FarmTrace_Gateway" from available networks. No password needed if default firmware.' />
            <Step n="3" done={false} title='Return to this screen'
              desc='Press the Connect button above. The app will start polling 192.168.4.1/api/data.' />
            <Step n="4" done={false} title='Verify sensor values appear'
              desc='Temperature, Humidity, and MQ-6 from the container should populate within 5 seconds.' />
          </View>
        </>
      )}

      {/* ── Debug Log ──────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.debugToggle}
        onPress={() => setShowDebug(v => !v)}
      >
        <Text style={styles.debugToggleText}>
          {showDebug ? '▾ Hide Debug Log' : '▸ Show Debug Log'} ({debugLog.length} entries)
        </Text>
      </TouchableOpacity>

      {showDebug && (
        <View style={styles.debugCard}>
          {debugLog.length === 0 && (
            <Text style={styles.debugEntry}>No log entries yet.</Text>
          )}
          {debugLog.map((entry, i) => (
            <Text key={i} style={styles.debugEntry}>{entry}</Text>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

// ─── Step helper ─────────────────────────────────────────────────────────────

const Step = ({ n, title, desc, done }) => (
  <View style={stepStyles.item}>
    <View style={[stepStyles.num, done && stepStyles.numDone]}>
      <Text style={[stepStyles.numText, done && stepStyles.numTextDone]}>
        {done ? '✓' : n}
      </Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={stepStyles.title}>{title}</Text>
      <Text style={stepStyles.desc}>{desc}</Text>
    </View>
  </View>
);

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  bannerIp: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  bannerError: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    flex: 2,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  btnDanger: {
    borderWidth: 1,
    borderColor: colors.danger,
    flex: 2,
  },
  btnDangerText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 14,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  btnOutlineText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 18,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  statsBar: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  statItem: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textLight,
    letterSpacing: 0.4,
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 6,
  },
  alertBanner: {
    backgroundColor: colors.dangerBg,
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  alertText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  debugToggle: {
    paddingVertical: 10,
    marginBottom: 4,
  },
  debugToggleText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  debugCard: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  debugEntry: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

const sensorStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'monospace',
  },
});

const stepStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  num: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  numText: {
    fontWeight: '700',
    fontSize: 12,
    color: colors.textMuted,
  },
  numTextDone: {
    color: '#fff',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  desc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
});

export default NodeMcuScreen;
