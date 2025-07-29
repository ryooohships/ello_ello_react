import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import MainTabView from './src/views/main/MainTabView';
import { ServiceProvider } from './src/services/ServiceProvider';
import CallOverlay from './src/views/components/CallOverlay';
import CallStatusBanner from './src/views/components/CallStatusBanner';
import ErrorBoundary from './src/views/components/ErrorBoundary';
import { Colors } from './src/resources/theme';

export default function App() {
  return (
    <ErrorBoundary>
      <ServiceProvider>
        <NavigationContainer>
          <MainTabView />
          <CallStatusBanner />
          <CallOverlay />
          <StatusBar style="light" backgroundColor={Colors.appBackground} />
        </NavigationContainer>
      </ServiceProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});