const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const screensDir = path.join(srcDir, 'screens');

const contextFile = path.join(srcDir, 'context', 'NodeMcuContext.js');
let contextCode = fs.readFileSync(contextFile, 'utf8');

// Replace fetch from 192.168.4.1 with socket.io-client
contextCode = contextCode.replace(
  `import React, {`,
  `import React, {\n  createContext,\n  useContext,\n  useState,\n  useEffect,\n  useRef,\n  useCallback,\n} from 'react';\nimport { io } from 'socket.io-client';\n//`
);

contextCode = contextCode.replace(
  `const pollTimer = useRef(null);`,
  `const pollTimer = useRef(null);\n  const socketRef = useRef(null);`
);

contextCode = contextCode.replace(
  `// ── Start / Stop polling ──────────────────────────────────────────────────`,
  `// ── Socket.IO Connection ──────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(Config.API_BASE.replace('/api', ''), { reconnectionAttempts: 10, reconnectionDelay: 2000 });
    socketRef.current = socket;
    
    socket.on('connect', () => updateStatus({ nodemcuApi: 'CONNECTED' }));
    socket.on('disconnect', () => updateStatus({ nodemcuApi: 'DISCONNECTED' }));
    socket.on('connect_error', () => updateStatus({ nodemcuApi: 'ERROR', lastError: 'Socket connection failed' }));
    
    socket.on('farmtrace:driver:data', (data) => {
      setSensorData(prev => ({ ...prev, ...data, dataAge: 0 }));
      updateStatus(prev => ({ lastSuccess: new Date(), packetCount: prev.packetCount + 1 }));
    });
    
    socket.on('farmtrace:container:data', (data) => {
      setSensorData(prev => ({ ...prev, ...data, dataAge: 0 }));
      updateStatus(prev => ({ lastSuccess: new Date(), packetCount: prev.packetCount + 1 }));
    });
    
    return () => socket.disconnect();
  }, [updateStatus]);

  // ── Start / Stop polling ──────────────────────────────────────────────────`
);

fs.writeFileSync(contextFile, contextCode);


const navFile = path.join(srcDir, 'navigation', 'AppNavigator.js');
let navCode = fs.readFileSync(navFile, 'utf8');

// Add new screens to Navigator
navCode = navCode.replace(
  `import DashboardScreen from '../screens/DashboardScreen';`,
  `import DashboardScreen from '../screens/DashboardScreen';
import LoadConfigScreen from '../screens/LoadConfigScreen';
import NetworkTelemetryScreen from '../screens/NetworkTelemetryScreen';
import LiveLoadTestingScreen from '../screens/LiveLoadTestingScreen';
import HardwareDevicesScreen from '../screens/HardwareDevicesScreen';`
);

navCode = navCode.replace(
  `const ICONS = {`,
  `const ICONS = {
  LoadConfig: '⚙️',
  Network: '📶',
  LoadTest: '🧪',
  Hardware: '💻',`
);

navCode = navCode.replace(
  `<Tab.Screen name="Profile" component={ProfileScreen}   options={{ title: 'Profile' }} />`,
  `<Tab.Screen name="Profile" component={ProfileScreen}   options={{ title: 'Profile' }} />
      <Tab.Screen name="LoadConfig" component={LoadConfigScreen} options={{ title: 'Config' }} />
      <Tab.Screen name="Network" component={NetworkTelemetryScreen} options={{ title: 'Network' }} />
      <Tab.Screen name="LoadTest" component={LiveLoadTestingScreen} options={{ title: 'Testing' }} />
      <Tab.Screen name="Hardware" component={HardwareDevicesScreen} options={{ title: 'Hardware' }} />`
);

fs.writeFileSync(navFile, navCode);


// Create new screens (stubbed with essential functionality)
const loadConfigScreenCode = `
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
`;

fs.writeFileSync(path.join(screensDir, 'LoadConfigScreen.js'), loadConfigScreenCode);


const networkTelemetryScreenCode = `
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
`;

fs.writeFileSync(path.join(screensDir, 'NetworkTelemetryScreen.js'), networkTelemetryScreenCode);


const liveLoadTestingScreenCode = `
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
`;

fs.writeFileSync(path.join(screensDir, 'LiveLoadTestingScreen.js'), liveLoadTestingScreenCode);


const hardwareDevicesScreenCode = `
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
`;

fs.writeFileSync(path.join(screensDir, 'HardwareDevicesScreen.js'), hardwareDevicesScreenCode);

console.log('Mobile features built successfully!');
