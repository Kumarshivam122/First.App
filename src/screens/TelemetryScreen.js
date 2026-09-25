/**
 * TelemetryScreen — Detailed live telemetry from both devices
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { useMqtt } from '../context/MqttContext';

const Row = ({ label, value, unit, color }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, color && { color }]}>{value ?? '—'}{unit ? ` ${unit}` : ''}</Text>
  </View>
);

const Section = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const TelemetryScreen = () => {
  const { containerData, driverData, lastContainerTime, lastDriverTime } = useMqtt();
  const cd = containerData || {};
  const dd = driverData || {};

  const timeSince = (t) => {
    if (!t) return 'Never';
    const s = Math.floor((Date.now() - t.getTime()) / 1000);
    if (s < 5) return 'Just now';
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Live Telemetry</Text>

        {/* Container */}
        <Section title={`📦 Container ESP32 — ${timeSince(lastContainerTime)}`}>
          <Row label="Temperature" value={cd.temperature?.toFixed(1)} unit="°C" color={colors.cyan} />
          <Row label="Humidity" value={cd.humidity?.toFixed(1)} unit="%" color={colors.info} />
          <Row label="MQ-6 Gas" value={cd.mq6} unit="ADC" color={colors.orange} />
          <Row label="Battery" value={cd.battery?.toFixed(1)} unit="%" color={colors.success} />
          <Row label="Solar" value={cd.solar?.toFixed(2)} unit="V" color={colors.warning} />
          <Row label="Sequence" value={cd.sequence} />
          <Row label="GPS" value={cd.gps ? `${cd.gps.lat?.toFixed(4)}, ${cd.gps.lng?.toFixed(4)}` : '—'} />
        </Section>

        {/* Driver */}
        <Section title={`🚛 Driver NodeMCU — ${timeSince(lastDriverTime)}`}>
          <Row label="MQ-3 Alcohol" value={dd.mq3} unit="ADC" color={colors.purple} />
          <Row label="Temperature" value={dd.temperature?.toFixed(1)} unit="°C" color={colors.cyan} />
          <Row label="Motion X" value={dd.motion?.x?.toFixed(3)} unit="m/s²" />
          <Row label="Motion Y" value={dd.motion?.y?.toFixed(3)} unit="m/s²" />
          <Row label="Motion Z" value={dd.motion?.z?.toFixed(3)} unit="m/s²" />
          <Row label="Gyro X" value={dd.gyro?.x?.toFixed(3)} unit="rad/s" />
          <Row label="Gyro Y" value={dd.gyro?.y?.toFixed(3)} unit="rad/s" />
          <Row label="Gyro Z" value={dd.gyro?.z?.toFixed(3)} unit="rad/s" />
          <Row label="Battery" value={dd.battery?.toFixed(1)} unit="%" color={colors.success} />
          <Row label="Solar" value={dd.solar?.toFixed(2)} unit="V" color={colors.warning} />
          <Row label="MQ3 Source" value={dd.mq3_source} />
          <Row label="Motion Source" value={dd.motion_source} />
        </Section>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  rowLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  rowValue: { fontSize: 14, fontWeight: '700', color: colors.text },
});

export default TelemetryScreen;
