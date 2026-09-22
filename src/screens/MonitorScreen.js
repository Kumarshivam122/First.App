import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

const sensors = [
  { label: 'Temperature', value: '5.8°C', min: '4.2°C', max: '7.1°C', status: 'Normal', color: colors.info },
  { label: 'Humidity', value: '82.4%', min: '78%', max: '85%', status: 'Normal', color: '#0369a1' },
  { label: 'Ethylene', value: '1.2 ppm', min: '—', max: '—', status: 'Normal', color: '#c2410c' },
  { label: 'Battery', value: '87%', min: '—', max: '—', status: 'Good', color: colors.success },
  { label: 'Vibration', value: '0.18 g', min: '—', max: '—', status: 'Normal', color: '#7c3aed' },
];

const MonitorScreen = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.liveRow}>
        <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
        <Text style={styles.liveText}>Live · Updated 4s ago</Text>
      </View>

      {sensors.map((s, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: s.color + '18' }]}>
              <View style={[styles.iconDot, { backgroundColor: s.color }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sensorLabel}>{s.label}</Text>
              <Text style={styles.sensorValue}>{s.value}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.successBg }]}>
              <Text style={[styles.statusText, { color: colors.success }]}>● {s.status}</Text>
            </View>
          </View>
          {(s.min !== '—' || s.max !== '—') && (
            <View style={styles.minMaxRow}>
              <Text style={styles.minMaxText}>Min: {s.min}</Text>
              <Text style={styles.minMaxText}>Max: {s.max}</Text>
            </View>
          )}
          {/* Chart placeholder */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>Chart renders on device</Text>
          </View>
        </View>
      ))}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  sensorLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sensorValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  minMaxRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  minMaxText: {
    fontSize: 12,
    color: colors.textLight,
  },
  chartPlaceholder: {
    height: 60,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartText: {
    fontSize: 11,
    color: colors.textLight,
  },
});

export default MonitorScreen;
