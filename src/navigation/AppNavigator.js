/**
 * AppNavigator
 * Clean 4-tab navigation. Uses emoji icons to avoid native linking issues.
 */
import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';

import DashboardScreen from '../screens/DashboardScreen';
import TelemetryScreen from '../screens/TelemetryScreen';
import DevicesScreen from '../screens/DevicesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, color }) => (
  <Text style={{ fontSize: 20, color }}>{emoji}</Text>
);

const ICONS = {
  Dashboard: '🏠',
  Telemetry: '📊',
  Devices: '📡',
  Settings: '⚙️',
};

const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color }) => (
        <TabIcon emoji={ICONS[route.name] || '•'} color={color} />
      ),
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '600',
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Telemetry" component={TelemetryScreen} />
    <Tab.Screen name="Devices" component={DevicesScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export default AppNavigator;
