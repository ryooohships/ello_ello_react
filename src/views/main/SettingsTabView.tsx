import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../resources/theme';
import { useServices } from '../../services/ServiceProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  key?: string;
  value?: boolean;
  onPress?: () => void;
  destructive?: boolean;
}

export default function SettingsTabView() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    notifications: true,
    vibration: true,
    speakerDefault: false,
    transcription: true,
    darkMode: true,
  });
  
  const { callLogService, callManager } = useServices();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('app_settings');
      if (stored) {
        setSettings({ ...settings, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const clearCallHistory = async () => {
    Alert.alert(
      'Clear Call History',
      'Are you sure you want to clear all call history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              await callLogService.clearAllHistory();
              Alert.alert('Success', 'Call history cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear call history');
            }
          }
        },
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy-policy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://example.com/terms-of-service');
  };

  const contactSupport = () => {
    Linking.openURL('mailto:support@elloello.com?subject=Support Request');
  };

  const simulateIncomingCall = async () => {
    try {
      await callManager.simulateIncomingCall('+1555123456', 'Test Caller');
    } catch (error) {
      Alert.alert('Error', 'Failed to simulate incoming call');
    }
  };

  const testPushNotification = async () => {
    const { pushNotificationService } = useServices();
    try {
      await pushNotificationService.simulateMissedCallNotification('+1555987654', 'Test Missed Call');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Call Settings',
      items: [
        {
          title: 'Default to Speaker',
          subtitle: 'Automatically enable speaker for calls',
          icon: 'volume-high-outline',
          type: 'toggle',
          key: 'speakerDefault',
          value: settings.speakerDefault,
        },
        {
          title: 'Call Transcription',
          subtitle: 'Enable real-time call transcription',
          icon: 'document-text-outline',
          type: 'toggle',
          key: 'transcription',
          value: settings.transcription,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          title: 'Push Notifications',
          subtitle: 'Receive notifications for calls and messages',
          icon: 'notifications-outline',
          type: 'toggle',
          key: 'notifications',
          value: settings.notifications,
        },
        {
          title: 'Vibration',
          subtitle: 'Vibrate for incoming calls',
          icon: 'phone-portrait-outline',
          type: 'toggle',
          key: 'vibration',
          value: settings.vibration,
        },
      ],
    },
    {
      title: 'Privacy & Data',
      items: [
        {
          title: 'Clear Call History',
          subtitle: 'Remove all call history data',
          icon: 'trash-outline',
          type: 'action',
          onPress: clearCallHistory,
          destructive: true,
        },
        {
          title: 'Call Forwarding',
          subtitle: 'Manage call forwarding settings',
          icon: 'call-outline',
          type: 'navigation',
          onPress: () => {
            // Navigate to call forwarding settings
            Alert.alert('Call Forwarding', 'Call forwarding settings would open here');
          },
        },
        {
          title: 'Privacy Policy',
          icon: 'shield-outline',
          type: 'navigation',
          onPress: openPrivacyPolicy,
        },
        {
          title: 'Terms of Service',
          icon: 'document-outline',
          type: 'navigation',
          onPress: openTermsOfService,
        },
      ],
    },
    {
      title: 'Development',
      items: [
        {
          title: 'Simulate Incoming Call',
          subtitle: 'Test incoming call functionality',
          icon: 'call-outline',
          type: 'action',
          onPress: simulateIncomingCall,
        },
        {
          title: 'Test Push Notification',
          subtitle: 'Send test missed call notification',
          icon: 'notifications-outline',
          type: 'action',
          onPress: testPushNotification,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Contact Support',
          subtitle: 'Get help with the app',
          icon: 'help-circle-outline',
          type: 'navigation',
          onPress: contactSupport,
        },
        {
          title: 'App Version',
          subtitle: '1.0.0 (Build 1)',
          icon: 'information-circle-outline',
          type: 'navigation',
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => {
    const handlePress = () => {
      if (item.type === 'toggle' && item.key) {
        saveSetting(item.key, !item.value);
      } else if (item.onPress) {
        item.onPress();
      }
    };

    return (
      <TouchableOpacity
        key={item.title}
        style={styles.settingsItem}
        onPress={handlePress}
        disabled={item.type === 'navigation' && !item.onPress}
      >
        <View style={styles.settingsItemLeft}>
          <View style={[styles.iconContainer, item.destructive && styles.destructiveIcon]}>
            <Ionicons 
              name={item.icon as any} 
              size={20} 
              color={item.destructive ? Colors.error : Colors.brandPrimary} 
            />
          </View>
          <View style={styles.settingsTextContainer}>
            <Text style={[styles.settingsTitle, item.destructive && styles.destructiveText]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingsSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        <View style={styles.settingsItemRight}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value || false}
              onValueChange={(value) => item.key && saveSetting(item.key, value)}
              trackColor={{ false: Colors.cardBackground, true: Colors.brandSecondary }}
              thumbColor={item.value ? Colors.brandPrimary : Colors.textSecondary}
            />
          ) : item.type === 'navigation' && item.onPress ? (
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (section: SettingsSection) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map((item, index) => (
          <View key={item.title}>
            {renderSettingsItem(item)}
            {index < section.items.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {settingsSections.map(renderSection)}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBackground,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textOnDark,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.brandPrimary,
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.medium,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.small,
    backgroundColor: `${Colors.brandPrimary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  destructiveIcon: {
    backgroundColor: `${Colors.error}20`,
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textOnDark,
  },
  destructiveText: {
    color: Colors.error,
  },
  settingsSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.appBackground,
    marginLeft: Spacing.md + 32 + Spacing.md,
  },
  bottomSpacing: {
    height: Spacing.xxl,
  },
});