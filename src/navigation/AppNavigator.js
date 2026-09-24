/**
 * AppNavigator
 * Bottom tab navigator.
 * Uses emoji icons instead of react-native-vector-icons to avoid
 * the native linking crash on React Native 0.87 + New Architecture.
 */

import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';

import DashboardScreen from '../screens/DashboardScreen';
import LoadConfigScreen from '../screens/LoadConfigScreen';
import NetworkTelemetryScreen from '../screens/NetworkTelemetryScreen';
import LiveLoadTestingScreen from '../screens/LiveLoadTestingScreen';
import HardwareDevicesScreen from '../screens/HardwareDevicesScreen';
import MonitorScreen from '../screens/MonitorScreen';
import NodeMcuScreen from '../screens/NodeMcuScreen';
import LogbookScreen from '../screens/LogbookScreen';
import TripScreen from '../screens/TripScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, color }) => (
  <Text style={{ fontSize: 18, color }}>{emoji}</Text>
);

const ICONS = {
  LoadConfig: '⚙️',
  Network: '📶',
  LoadTest: '🧪',
  Hardware: '💻',
  Home: '🏠',
  Monitor: '📊',
  Gateway: '📡',
  Logbook: '📋',
  Trips: '🗺\uFE0F',
  Profile: '👤',
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
          fontSize: 17,
        },
        tabBarIcon: ({ color }) => (
          <TabIcon emoji={ICONS[route.name] || '•'} color={color} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
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
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Home"    component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Monitor" component={MonitorScreen}   options={{ title: 'Monitor' }} />
      <Tab.Screen name="Gateway" component={NodeMcuScreen}   options={{ title: 'Gateway' }} />
      <Tab.Screen name="Logbook" component={LogbookScreen}   options={{ title: 'Logbook' }} />
      <Tab.Screen name="Trips"   component={TripScreen}      options={{ title: 'Trips' }} />
      <Tab.Screen name="Profile" component={ProfileScreen}   options={{ title: 'Profile' }} />
      <Tab.Screen name="LoadConfig" component={LoadConfigScreen} options={{ title: 'Config' }} />
      <Tab.Screen name="Network" component={NetworkTelemetryScreen} options={{ title: 'Network' }} />
      <Tab.Screen name="LoadTest" component={LiveLoadTestingScreen} options={{ title: 'Testing' }} />
      <Tab.Screen name="Hardware" component={HardwareDevicesScreen} options={{ title: 'Hardware' }} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
