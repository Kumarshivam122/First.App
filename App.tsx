/**
 * FarmTrace App
 * Root component — wraps navigation in context providers.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { NodeMcuProvider } from './src/context/NodeMcuContext';
import { TripProvider } from './src/context/TripContext';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NodeMcuProvider>
        <TripProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </TripProvider>
      </NodeMcuProvider>
    </SafeAreaProvider>
  );
}

export default App;
