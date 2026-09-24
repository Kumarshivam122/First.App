
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { useNodeMcu } from '../context/NodeMcuContext';

export default function LiveLoadTestingScreen() {
  const { sensorData } = useNodeMcu();
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Live Load Testing</Text>
      <View style={styles.card}>
        <Text style={styles.text}>Testing active on hardware data</Text>
        <Text style={styles.text}>Current Temp: {sensorData.temperature}°C</Text>
        <Text style={styles.text}>Current Humidity: {sensorData.humidity}%</Text>
        <Text style={styles.text}>Current Gas (MQ6): {sensorData.mq6}</Text>
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
