
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { useNodeMcu } from '../context/NodeMcuContext';

export default function HardwareDevicesScreen() {
  const { status } = useNodeMcu();
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hardware Devices</Text>
      <View style={styles.card}>
        <Text style={styles.bold}>Container ESP32</Text>
        <Text style={styles.text}>Status: {status.nodemcuApi === 'CONNECTED' ? 'Online' : 'Offline'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.bold}>Driver NodeMCU Gateway</Text>
        <Text style={styles.text}>Status: {status.nodemcuApi === 'CONNECTED' ? 'Online' : 'Offline'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: colors.text },
  card: { padding: 16, backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  bold: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  text: { fontSize: 14, color: colors.textMuted }
});
