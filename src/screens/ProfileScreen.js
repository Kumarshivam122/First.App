/**
 * ProfileScreen — Profile tab
 * Driver profile with working settings navigation.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal,
  TextInput, Switch,
} from 'react-native';
import { colors } from '../theme/colors';
import { Config } from '../config';
import { useNodeMcu } from '../context/NodeMcuContext';
import { useTrip } from '../context/TripContext';

const ProfileScreen = () => {
  const { status, isPolling, stopPolling } = useNodeMcu();
  const { trips } = useTrip();

  const [showGatewaySettings, setShowGatewaySettings] = useState(false);
  const [gatewayIp, setGatewayIp] = useState(Config.NODEMCU_IP);
  const [showAbout, setShowAbout] = useState(false);
  const [mqttEnabled, setMqttEnabled] = useState(false);

  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const totalAlerts = trips.reduce((sum, t) => sum + (t.alerts || 0), 0);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: () => {
          if (isPolling) stopPolling();
          Alert.alert('Logged Out', 'You have been logged out.');
        },
      },
    ]);
  };

  const handleExport = () => {
    Alert.alert('Export Data', 'Data export is available in the web dashboard. Connect to the backend to download CSV reports.');
  };

  const handleAlertThresholds = () => {
    Alert.alert(
      'Alert Thresholds',
      `Current thresholds:\n\n` +
      `Temperature: ${Config.THRESHOLDS.TEMPERATURE_MIN}–${Config.THRESHOLDS.TEMPERATURE_MAX} °C\n` +
      `Humidity: ${Config.THRESHOLDS.HUMIDITY_MIN}–${Config.THRESHOLDS.HUMIDITY_MAX} %\n` +
      `MQ-6 (Gas): ${Config.THRESHOLDS.MQ6_MAX} ADC\n` +
      `MQ-3 (Alcohol): ${Config.THRESHOLDS.MQ3_MAX} ADC\n` +
      `Vibration: ${Config.THRESHOLDS.ACCEL_MAX} g\n\n` +
      `Edit thresholds in src/config/index.js`,
      [{ text: 'OK' }],
    );
  };

  const handleMqttConfig = () => {
    Alert.alert(
      'MQTT Configuration',
      `Broker: ${Config.MQTT_BROKER}\nPort: ${Config.MQTT_PORT}\n\n` +
      'MQTT bridge publishes sensor data to the cloud when enabled.\n\n' +
      'Configure in src/config/index.js',
      [{ text: 'OK' }],
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Avatar */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>RK</Text>
        </View>
        <Text style={styles.name}>Rajesh Kumar</Text>
        <Text style={styles.role}>{Config.DEMO_DRIVER_ID} · Driver</Text>
        <View style={[
          styles.statusPill,
          { backgroundColor: isPolling ? colors.successBg : colors.borderLight },
        ]}>
          <Text style={[
            styles.statusPillText,
            { color: isPolling ? colors.success : colors.textMuted },
          ]}>
            {isPolling
              ? `● Gateway: ${status.nodemcuApi}`
              : '○ Gateway: Disconnected'}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Information</Text>
        <InfoRow label="Phone" value="+91 9876543210" />
        <InfoRow label="Vehicle" value="JH10AB1234" />
        <InfoRow label="Cargo ID" value={Config.DEMO_CARGO_ID} />
        <InfoRow label="MQTT Packets Sent" value={status.packetCount?.toString() ?? '0'} />
      </View>

      {/* Stats */}
      <Text style={styles.sectionLabel}>PERFORMANCE</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedTrips}</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>98%</Text>
          <Text style={styles.statLabel}>Safety</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: totalAlerts > 0 ? colors.warning : colors.text }]}>
            {totalAlerts}
          </Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </View>
      </View>

      {/* MQTT Toggle */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>MQTT Bridge</Text>
        <View style={styles.mqttRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.mqttLabel}>Enable MQTT Bridge</Text>
            <Text style={styles.mqttDesc}>
              Publish sensor data to {Config.MQTT_BROKER}
            </Text>
          </View>
          <Switch
            value={mqttEnabled}
            onValueChange={(v) => {
              setMqttEnabled(v);
              if (v) {
                Alert.alert(
                  'MQTT Bridge',
                  'MQTT publishing requires a real broker connection.\nConfigure in src/config/index.js.\n\nFor demo: broker.emqx.io is used.',
                );
              }
            }}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={mqttEnabled ? colors.primary : colors.textLight}
          />
        </View>
        <Text style={[styles.mqttStatus, { color: mqttEnabled ? colors.success : colors.textLight }]}>
          {mqttEnabled ? '● MQTT enabled (connecting…)' : '○ MQTT disabled'}
        </Text>
      </View>

      {/* Settings */}
      <View style={styles.card}>
        <SettingsRow label="Gateway Settings" onPress={() => setShowGatewaySettings(true)} />
        <SettingsRow label="MQTT Configuration" onPress={handleMqttConfig} />
        <SettingsRow label="Alert Thresholds" onPress={handleAlertThresholds} />
        <SettingsRow label="Export Data" onPress={handleExport} />
        <SettingsRow label="About FarmTrace" onPress={() => setShowAbout(true)} last />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Gateway Settings Modal */}
      <Modal visible={showGatewaySettings} animationType="slide" transparent>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <Text style={modal.title}>Gateway Settings</Text>
            <Text style={modal.label}>NodeMCU IP Address</Text>
            <TextInput
              style={modal.input}
              value={gatewayIp}
              onChangeText={setGatewayIp}
              placeholder="192.168.4.1"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
            />
            <Text style={modal.hint}>
              Default: 192.168.4.1 (NodeMCU AP mode)
            </Text>
            <View style={modal.btnRow}>
              <TouchableOpacity
                style={modal.cancelBtn}
                onPress={() => { setShowGatewaySettings(false); setGatewayIp(Config.NODEMCU_IP); }}
              >
                <Text style={modal.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modal.saveBtn}
                onPress={() => {
                  setShowGatewaySettings(false);
                  Alert.alert('Saved', `Gateway IP set to ${gatewayIp}\n\nRestart the app to apply changes.\n\nFor permanent change, edit Config.NODEMCU_IP in src/config/index.js`);
                }}
              >
                <Text style={modal.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal visible={showAbout} animationType="slide" transparent>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <Text style={modal.title}>About FarmTrace</Text>
            <Text style={modal.body}>
              FarmTrace v0.0.1{'\n\n'}
              Agricultural cold-chain monitoring system.{'\n\n'}
              Hardware:{'\n'}
              • ESP32 (Container) — DHT11 + MQ-6{'\n'}
              • NodeMCU (Gateway) — MQ-3 + MPU6050{'\n'}
              • nRF24L01 wireless link{'\n\n'}
              MQTT Broker: {Config.MQTT_BROKER}:{Config.MQTT_PORT}{'\n'}
              Gateway IP: {Config.NODEMCU_IP}{'\n\n'}
              © 2026 FarmTrace
            </Text>
            <TouchableOpacity style={modal.saveBtn} onPress={() => setShowAbout(false)}>
              <Text style={modal.saveText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={infoStyles.row}>
    <Text style={infoStyles.label}>{label}</Text>
    <Text style={infoStyles.value}>{value}</Text>
  </View>
);

const SettingsRow = ({ label, onPress, last }) => (
  <TouchableOpacity
    style={[settingsStyles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
    onPress={onPress}
    activeOpacity={0.6}
  >
    <Text style={settingsStyles.label}>{label}</Text>
    <Text style={settingsStyles.chevron}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  role: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 8,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  mqttRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  mqttLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  mqttDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  mqttStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 10,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 15,
  },
});

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  label: { fontSize: 13, color: colors.textMuted },
  value:  { fontSize: 13, fontWeight: '600', color: colors.text },
});

const settingsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  label:   { fontSize: 14, fontWeight: '500', color: colors.text },
  chevron: { fontSize: 20, color: colors.textLight },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  hint: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 4,
    marginBottom: 16,
  },
  body: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  cancelText: { color: colors.text, fontWeight: '500', fontSize: 15 },
  saveBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});

export default ProfileScreen;
