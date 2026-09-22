/**
 * TripScreen — Trips tab
 * Shows trip list and handles start/end trip with real state.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal,
} from 'react-native';
import { colors } from '../theme/colors';
import { useTrip } from '../context/TripContext';

const TripScreen = () => {
  const { trips, activeTrip, startNewTrip, endTrip } = useTrip();
  const [modalVisible, setModalVisible] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleStartTrip = () => {
    if (activeTrip) {
      Alert.alert(
        'Active Trip Exists',
        `You have an active trip (${activeTrip.id}). End it first before starting a new one.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'End & Start New',
            style: 'destructive',
            onPress: () => {
              endTrip();
              setModalVisible(true);
            },
          },
        ],
      );
      return;
    }
    setOrigin('Dhanbad');
    setDestination('');
    setModalVisible(true);
  };

  const handleConfirmNewTrip = () => {
    if (!destination.trim()) {
      Alert.alert('Required', 'Please enter a destination.');
      return;
    }
    startNewTrip(origin.trim() || 'Current Location', destination.trim());
    setModalVisible(false);
    setOrigin('');
    setDestination('');
  };

  const handleTripPress = (trip) => {
    if (trip.status === 'active') {
      Alert.alert(
        `Trip ${trip.id}`,
        `${trip.origin} → ${trip.destination}\nStarted: ${trip.startTime}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'End This Trip',
            style: 'destructive',
            onPress: () => {
              Alert.alert('Confirm', 'End this trip?', [
                { text: 'No', style: 'cancel' },
                { text: 'Yes, End Trip', style: 'destructive', onPress: endTrip },
              ]);
            },
          },
        ],
      );
    } else {
      Alert.alert(
        `Trip ${trip.id}`,
        `${trip.origin} → ${trip.destination}\nDate: ${trip.date}\nRecords: ${trip.recordCount.toLocaleString()}\nAlerts: ${trip.alerts}`,
        [{ text: 'Close' }],
      );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <TouchableOpacity style={styles.newTripBtn} onPress={handleStartTrip}>
        <Text style={styles.newTripBtnText}>+ Start New Trip</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>ALL SHIPMENTS</Text>
      {trips.map(trip => (
        <TouchableOpacity key={trip.id} style={styles.tripCard} onPress={() => handleTripPress(trip)}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripId}>{trip.id}</Text>
            <View style={[styles.badge, trip.status === 'active' ? styles.badgeActive : styles.badgeDone]}>
              <Text style={[styles.badgeText, trip.status === 'active'
                ? { color: colors.success } : { color: colors.textMuted }]}>
                {trip.status === 'active' ? '● Active' : 'Completed'}
              </Text>
            </View>
          </View>
          <Text style={styles.tripRoute}>{trip.origin} → {trip.destination}</Text>
          <View style={styles.tripMeta}>
            <Text style={styles.tripMetaText}>{trip.date}</Text>
            <Text style={styles.tripMetaText}>{trip.recordCount.toLocaleString()} records</Text>
            {trip.alerts > 0 && (
              <Text style={[styles.tripMetaText, { color: colors.warning }]}>
                ⚠ {trip.alerts} alerts
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}

      {/* New Trip Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <Text style={modal.title}>Start New Trip</Text>
            <Text style={modal.label}>Origin</Text>
            <TextInput
              style={modal.input}
              value={origin}
              onChangeText={setOrigin}
              placeholder="e.g. Dhanbad warehouse"
              placeholderTextColor={colors.textLight}
            />
            <Text style={modal.label}>Destination</Text>
            <TextInput
              style={modal.input}
              value={destination}
              onChangeText={setDestination}
              placeholder="e.g. Ranchi market"
              placeholderTextColor={colors.textLight}
              autoFocus
            />
            <View style={modal.btnRow}>
              <TouchableOpacity
                style={modal.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={modal.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modal.startBtn}
                onPress={handleConfirmNewTrip}
              >
                <Text style={modal.startText}>Start Trip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  badgeActive: { backgroundColor: colors.successBg },
  badgeDone:   { backgroundColor: colors.borderLight },
  badgeText:   { fontSize: 12, fontWeight: '600' },
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
    marginBottom: 20,
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
    padding: 13,
    fontSize: 15,
    color: colors.text,
    marginBottom: 16,
    backgroundColor: colors.background,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 15,
  },
  startBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  startText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default TripScreen;
