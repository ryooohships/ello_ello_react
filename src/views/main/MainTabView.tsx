import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../resources/theme';
import DialpadTabView from './DialpadTabView';
import HistoryTabView from './HistoryTabView';
import ContactsTabView from './ContactsTabView';
import VoicemailTabView from './VoicemailTabView';
import SettingsTabView from './SettingsTabView';
import CustomTabBar from '../components/CustomTabBar';

export default function MainTabView() {
  const [selectedTab, setSelectedTab] = useState(2); // Start with Dialpad (center)
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleTabPress = (tabIndex: number) => {
    if (tabIndex === selectedTab) return;
    
    // Smooth fade transition like iOS
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setSelectedTab(tabIndex);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    });
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <ContactsTabView />;
      case 1:
        return <HistoryTabView />;
      case 2:
        return <DialpadTabView />;
      case 3:
        return <VoicemailTabView />;
      case 4:
        return <SettingsTabView />;
      default:
        return <DialpadTabView />;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {renderTabContent()}
      </Animated.View>
      <CustomTabBar 
        selectedTab={selectedTab} 
        onTabPress={handleTabPress} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  contentContainer: {
    flex: 1,
  },
});