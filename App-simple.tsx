import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ello Ello App</Text>
      <Text style={styles.subtitle}>React Native Version</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181a20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7b61ff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
  },
});