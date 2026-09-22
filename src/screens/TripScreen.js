import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

const trips = [
  { id: 'FT-2026-001', origin: 'Dhanbad', destination: 'Ranchi', status: 'active', date: '21 Sep 2026', alerts: 2, records: 1024 },
  { id: 'FT-2026-000', origin: 'Kolkata', destination: 'Dhanbad', status: 'completed', date: '18 Sep 2026', alerts: 0, records: 2048 },
];

const TripScreen = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.newTripBtn}>
        <Text style={styles.newTripBtnText}>+ Start New Trip</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>ALL SHIPMENTS</Text>
      {trips.map(trip => (
        <TouchableOpacity key={trip.id} style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripId}>{trip.id}</Text>
            <View style={[styles.badge, trip.status === 'active' ? styles.badgeActive : styles.badgeDone]}>
              <Text style={[styles.badgeText, trip.status === 'active' ? { color: colors.success } : { color: colors.textMuted }]}>
                {trip.status === 'active' ? '● Active' : 'Completed'}
              </Text>
            </View>
          </View>
          <Text style={styles.tripRoute}>{trip.origin} → {trip.destination}</Text>
          <View style={styles.tripMeta}>
            <Text style={styles.tripMetaText}>{trip.date}</Text>
            <Text style={styles.tripMetaText}>{trip.records.toLocaleString()} records</Text>
            {trip.alerts > 0 && (
              <Text style={[styles.tripMetaText, { color: colors.warning }]}>{trip.alerts} alerts</Text>
            )}
          </View>
        </TouchableOpacity>
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
  newTripBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  newTripBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tripCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tripId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: colors.successBg,
  },
  badgeDone: {
    backgroundColor: colors.borderLight,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tripRoute: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  tripMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  tripMetaText: {
    fontSize: 12,
    color: colors.textLight,
  },
});

export default TripScreen;
