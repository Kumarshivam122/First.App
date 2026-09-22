/**
 * Basic smoke test — verifies the app renders without crashing.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
// Import App but mock navigation to avoid jest config issues
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: () => null,
  }),
}));

import App from '../App';

test('App renders without crashing', () => {
  // Just check it doesn't throw
  expect(() => render(<App />)).not.toThrow();
});
