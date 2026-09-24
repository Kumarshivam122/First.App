
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { useNodeMcu } from '../context/NodeMcuContext';

export default function NetworkTelemetryScreen() {
  const { status, sensorData } = useNodeMcu();
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Network Telemetry</Text>
      <View style={styles.card}>
        <Text style={styles.text}>API Status: {status.nodemcuApi}</Text>
        <Text style={styles.text}>Packets Received: {status.packetCount}</Text>
        <Text style={styles.text}>Data Age: {sensorData.dataAge}s</Text>
        <Text style={styles.text}>Last Success: {status.lastSuccess ? status.lastSuccess.toLocaleTimeString() : 'Never'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: colors.text },
  card: { padding: 16, backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  text: { fontSize: 16, color: colors.text, marginBottom: 8 }
});
