/**
 * SettingsScreen — App info and MQTT config display
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { Config } from '../config';

const InfoRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const SettingsScreen = () => (
  <View style={styles.screen}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>MQTT Configuration</Text>
        <InfoRow label="Broker" value="broker.emqx.io" />
        <InfoRow label="MQTT Port" value="1883" />
        <InfoRow label="WebSocket Port" value="8083" />
        <InfoRow label="Client ID" value={Config.MQTT_CLIENT_ID} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Subscribed Topics</Text>
        <InfoRow label="Container Data" value={Config.TOPIC_CONTAINER_DATA} />
        <InfoRow label="Container Status" value={Config.TOPIC_CONTAINER_STATUS} />
        <InfoRow label="Driver Data" value={Config.TOPIC_DRIVER_DATA} />
        <InfoRow label="Driver Status" value={Config.TOPIC_DRIVER_STATUS} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Alert Thresholds</Text>
        <InfoRow label="Temp Max" value={`${Config.THRESHOLDS.TEMPERATURE_MAX}°C`} />
        <InfoRow label="Temp Min" value={`${Config.THRESHOLDS.TEMPERATURE_MIN}°C`} />
        <InfoRow label="Humidity Max" value={`${Config.THRESHOLDS.HUMIDITY_MAX}%`} />
        <InfoRow label="MQ-6 Max" value={`${Config.THRESHOLDS.MQ6_MAX} ADC`} />
        <InfoRow label="MQ-3 Max" value={`${Config.THRESHOLDS.MQ3_MAX} ADC`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <InfoRow label="App" value="FarmTrace Mobile" />
        <InfoRow label="Version" value="2.0.0" />
        <InfoRow label="Connection" value="Direct MQTT (WebSocket)" />
        <InfoRow label="Hardware" value="ESP32 + ESP8266" />
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.primary, marginBottom: 10, letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  value: { fontSize: 13, color: colors.text, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
});

export default SettingsScreen;
