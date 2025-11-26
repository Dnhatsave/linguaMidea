import React from 'react';
import { StyleSheet } from 'react-native';
import { registerRootComponent } from 'expo';
import HomeScreen from './src/screens/HomeScreen';

function App() {
  // Firebase temporarily disabled - can be re-enabled later if needed
  return <HomeScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1233',
  },
});

// Register the root component with Expo (required for Expo to work)
registerRootComponent(App);
