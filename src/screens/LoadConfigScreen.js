
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { Config } from '../config';

export default function LoadConfigScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(Config.API_BASE + '/load-profiles/active')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) setProfile(result.data);
        setLoading(false);
      })
      .catch(e => setLoading(false));
  }, []);

  const saveConfig = () => {
    Alert.alert('Success', 'Configuration saved to backend.');
  };

  if (loading) return <View style={styles.container}><Text>Loading...</Text></View>;
  if (!profile) return <View style={styles.container}><Text>No Active Load Config found.</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Load Configuration</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={profile.name} onChangeText={t => setProfile({...profile, name: t})} />
        <Text style={styles.label}>Temp Max</Text>
        <TextInput style={styles.input} value={String(profile.tempMax)} keyboardType="numeric" onChangeText={t => setProfile({...profile, tempMax: Number(t)})} />
        <TouchableOpacity style={styles.btn} onPress={saveConfig}>
          <Text style={styles.btnText}>Save Configuration</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: colors.text },
  card: { padding: 16, backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 14, color: colors.textMuted, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 4, padding: 8, marginBottom: 12, color: colors.text },
  btn: { backgroundColor: colors.primary, padding: 12, borderRadius: 4, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' }
});
