import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../resources/theme';
import DialpadTabView from './DialpadTabView';
import HistoryTabView from './HistoryTabView';
import ContactsTabView from './ContactsTabView';
import VoicemailTabView from './VoicemailTabView';
import SettingsTabView from './SettingsTabView';

const Tab = createBottomTabNavigator();

export default function MainTabView() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.darkBackground,
          borderTopColor: Colors.cardBackground,
        },
        tabBarActiveTintColor: Colors.brandPrimary,
        tabBarInactiveTintColor: Colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Dialpad"
        component={DialpadTabView}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="keypad" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryTabView}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsTabView}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Voicemail"
        component={VoicemailTabView}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="recording-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsTabView}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}