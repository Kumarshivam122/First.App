/**
 * DevicesScreen — Hardware device status + connection info
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { useMqtt } from '../context/MqttContext';

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value ?? '—'}</Text>
  </View>
);

const DeviceCard = ({ name, icon, online, data, lastTime }) => {
  const timeAgo = lastTime
    ? `${Math.max(0, Math.floor((Date.now() - lastTime.getTime()) / 1000))}s ago`
    : 'No data';

  return (
    <View style={[styles.deviceCard, { borderColor: online ? colors.success : colors.border }]}>
      <View style={styles.deviceHeader}>
        <Text style={styles.deviceIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.deviceName}>{name}</Text>
          <Text style={styles.deviceTime}>Last seen: {timeAgo}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: online ? colors.successBg : colors.dangerBg }]}>
          <Text style={[styles.statusPillText, { color: online ? colors.success : colors.danger }]}>
            {online ? '● ONLINE' : '● OFFLINE'}
          </Text>
        </View>
      </View>
      {data && (
        <View style={styles.deviceBody}>
          {Object.entries(data).filter(([k]) =>
            !['device', 'device_type', 'encoded_data', 'timestamp_iso', 'timestamp_source'].includes(k) &&
            !k.endsWith('_source')
          ).slice(0, 8).map(([key, val]) => (
            <InfoRow
              key={key}
              label={key}
              value={typeof val === 'object' ? JSON.stringify(val) : String(val)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const DevicesScreen = () => {
  const {
    connectionStatus, containerData, driverData,
    containerOnline, driverOnline, lastContainerTime, lastDriverTime,
    packetCount, debugLog,
  } = useMqtt();

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Hardware Devices</Text>

        {/* MQTT Status */}
        <View style={styles.mqttCard}>
          <Text style={styles.mqttTitle}>MQTT Connection</Text>
          <InfoRow label="Broker" value="broker.emqx.io" />
          <InfoRow label="Port" value="8083 (WebSocket)" />
          <InfoRow label="Status" value={connectionStatus} />
          <InfoRow label="Container Packets" value={String(packetCount.container)} />
          <InfoRow label="Driver Packets" value={String(packetCount.driver)} />
        </View>

        {/* Devices */}
        <DeviceCard
          name="Container ESP32"
          icon="📦"
          online={containerOnline}
          data={containerData}
          lastTime={lastContainerTime}
        />

        <DeviceCard
          name="Driver NodeMCU (ESP8266)"
          icon="🚛"
          online={driverOnline}
          data={driverData}
          lastTime={lastDriverTime}
        />

        {/* Activity Log */}
        <Text style={styles.sectionTitle}>ACTIVITY LOG</Text>
        <View style={styles.logCard}>
          {debugLog.length === 0 && (
            <Text style={styles.logEmpty}>No activity yet</Text>
          )}
          {debugLog.slice(0, 15).map((entry, i) => (
            <Text key={i} style={styles.logEntry}>{entry}</Text>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 },
  mqttCard: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  mqttTitle: { fontSize: 14, fontWeight: '700', color: colors.primary, marginBottom: 10 },
  deviceCard: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1.5 },
  deviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  deviceIcon: { fontSize: 28 },
  deviceName: { fontSize: 15, fontWeight: '700', color: colors.text },
  deviceTime: { fontSize: 11, color: colors.textMuted },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusPillText: { fontSize: 10, fontWeight: '800' },
  deviceBody: { borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  infoLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '500', maxWidth: '40%' },
  infoValue: { fontSize: 12, color: colors.text, fontWeight: '600', maxWidth: '58%', textAlign: 'right' },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1, marginBottom: 8, marginTop: 8 },
  logCard: { backgroundColor: colors.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  logEmpty: { fontSize: 12, color: colors.textMuted, textAlign: 'center', paddingVertical: 10 },
  logEntry: { fontSize: 11, color: colors.textSecondary, fontFamily: 'monospace', paddingVertical: 2 },
});

export default DevicesScreen;
