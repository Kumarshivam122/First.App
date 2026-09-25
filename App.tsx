/**
 * FarmTrace App
 * Root component — wraps navigation in MQTT context provider.
 * Connects directly to broker.emqx.io via WebSocket.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { MqttProvider } from './src/context/MqttContext';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <MqttProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </MqttProvider>
    </SafeAreaProvider>
  );
}

export default App;
