/**
 * LogbookScreen — Logbook tab
 * Shows driving/rest timers and timeline from TripContext.
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal,
} from 'react-native';
import { useState } from 'react';
import { colors } from '../theme/colors';
import { useTrip } from '../context/TripContext';

const LogbookScreen = () => {
  const { drivingSeconds, restSeconds, driverStatus, logbook, formatTime, startRest, startDriving, addLogEntry } =
    useTrip();
  const [showAddModal, setShowAddModal] = useState(false);
  const [customNote, setCustomNote] = useState('');

  const handleToggleRest = () => {
    if (driverStatus === 'driving') {
      startRest();
    } else {
      startDriving();
    }
  };

  const handleAddEvent = () => {
    setShowAddModal(true);
  };

  const handleCustomEvent = (type) => {
    const desc = customNote.trim() || type;
    const dotColor = type === 'Rest' ? colors.warning
      : type === 'Fuel Stop' ? '#F59E0B'
      : colors.primary;
    addLogEntry(type, desc, dotColor);
    setShowAddModal(false);
    setCustomNote('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, driverStatus === 'driving' && styles.summaryCardActive]}>
          <Text style={styles.summaryLabel}>Driving</Text>
          <Text style={styles.summaryValue}>{formatTime(drivingSeconds)}</Text>
        </View>
        <View style={[styles.summaryCard, driverStatus === 'resting' && styles.summaryCardRest]}>
          <Text style={styles.summaryLabel}>Rest</Text>
          <Text style={styles.summaryValue}>{formatTime(restSeconds)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.successBg, borderColor: '#BBF7D0' }]}>
          <Text style={[styles.summaryLabel, { color: colors.primaryDark }]}>Status</Text>
          <Text style={[styles.summaryValue, { color: colors.success, fontSize: 13 }]}>
            {driverStatus === 'driving' ? '🟢 Driving' : '🟡 Resting'}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleToggleRest}>
          <Text style={styles.primaryBtnText}>
            {driverStatus === 'driving' ? '⏸ Start Rest' : '▶ Resume Driving'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={handleAddEvent}>
          <Text style={styles.outlineBtnText}>+ Add Event</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <Text style={styles.sectionLabel}>TODAY'S TIMELINE</Text>
      <View style={styles.timelineCard}>
        {logbook.map((ev, i) => (
          <View key={i} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineDot, { backgroundColor: ev.dot }]} />
              {i < logbook.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTime}>{ev.time}</Text>
              <Text style={styles.timelineTitle}>{ev.title}</Text>
              <Text style={styles.timelineDesc}>{ev.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Add Event Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <Text style={modal.title}>Add Logbook Entry</Text>
            <TextInput
              style={modal.input}
              value={customNote}
              onChangeText={setCustomNote}
              placeholder="Optional note..."
              placeholderTextColor={colors.textLight}
            />
            {['Vehicle Inspection', 'Delivery Checkpoint', 'Fuel Stop', 'Rest', 'Other'].map(type => (
              <TouchableOpacity
                key={type}
                style={modal.option}
                onPress={() => handleCustomEvent(type)}
              >
                <Text style={modal.optionText}>{type}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={modal.cancelBtn} onPress={() => setShowAddModal(false)}>
              <Text style={modal.cancelText}>Cancel</Text>
            </TouchableOpacity>
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
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  summaryCardRest: {
    borderColor: colors.warning,
    backgroundColor: colors.warningBg,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  timelineCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 14,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: 4,
    marginBottom: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineTime: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  timelineDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
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
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    backgroundColor: colors.background,
  },
  option: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  cancelBtn: {
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelText: {
    fontSize: 15,
    color: colors.textMuted,
  },
});

export default LogbookScreen;
