import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../resources/theme';
import { useServices } from '../../services/ServiceProvider';
import { CallForwardingSettings } from '../../services/backend/VoicemailService';

export default function CallForwardingSettingsView() {
  const [settings, setSettings] = useState<CallForwardingSettings>({
    enabled: false,
    forwardToNumber: '',
    forwardOnBusy: false,
    forwardOnNoAnswer: false,
    forwardOnUnreachable: false,
    noAnswerTimeout: 30,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { voicemailService } = useServices();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userIdentity = '+1234567890'; // Mock user identity
      const currentSettings = await voicemailService.getCallForwardingSettings(userIdentity);
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load call forwarding settings:', error);
      Alert.alert('Error', 'Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const userIdentity = '+1234567890'; // Mock user identity
      await voicemailService.updateCallForwardingSettings(userIdentity, settings);
      Alert.alert('Success', 'Call forwarding settings updated successfully');
    } catch (error) {
      console.error('Failed to save call forwarding settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <T extends keyof CallForwardingSettings>(
    key: T,
    value: CallForwardingSettings[T]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const validatePhoneNumber = (number: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(number.replace(/\D/g, ''));
  };

  const handleSave = () => {
    if (settings.enabled && settings.forwardToNumber && !validatePhoneNumber(settings.forwardToNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number for call forwarding.');
      return;
    }
    saveSettings();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brandPrimary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Call Forwarding</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.textOnDark} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Enable Call Forwarding</Text>
                <Text style={styles.settingSubtitle}>
                  Forward calls when you're unavailable
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => updateSetting('enabled', value)}
                trackColor={{ false: Colors.cardBackground, true: Colors.brandSecondary }}
                thumbColor={settings.enabled ? Colors.brandPrimary : Colors.textSecondary}
              />
            </View>

            {settings.enabled && (
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Forward To Number</Text>
                  <Text style={styles.settingSubtitle}>
                    Phone number to forward calls to
                  </Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={settings.forwardToNumber}
                  onChangeText={(value) => updateSetting('forwardToNumber', value)}
                  placeholder="+1234567890"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
            )}
          </View>
        </View>

        {settings.enabled && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Forward When</Text>
              <View style={styles.sectionContent}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>Line is Busy</Text>
                    <Text style={styles.settingSubtitle}>
                      Forward calls when you're already on a call
                    </Text>
                  </View>
                  <Switch
                    value={settings.forwardOnBusy}
                    onValueChange={(value) => updateSetting('forwardOnBusy', value)}
                    trackColor={{ false: Colors.cardBackground, true: Colors.brandSecondary }}
                    thumbColor={settings.forwardOnBusy ? Colors.brandPrimary : Colors.textSecondary}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>No Answer</Text>
                    <Text style={styles.settingSubtitle}>
                      Forward calls when you don't answer
                    </Text>
                  </View>
                  <Switch
                    value={settings.forwardOnNoAnswer}
                    onValueChange={(value) => updateSetting('forwardOnNoAnswer', value)}
                    trackColor={{ false: Colors.cardBackground, true: Colors.brandSecondary }}
                    thumbColor={settings.forwardOnNoAnswer ? Colors.brandPrimary : Colors.textSecondary}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>Unreachable</Text>
                    <Text style={styles.settingSubtitle}>
                      Forward calls when your phone is unreachable
                    </Text>
                  </View>
                  <Switch
                    value={settings.forwardOnUnreachable}
                    onValueChange={(value) => updateSetting('forwardOnUnreachable', value)}
                    trackColor={{ false: Colors.cardBackground, true: Colors.brandSecondary }}
                    thumbColor={settings.forwardOnUnreachable ? Colors.brandPrimary : Colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            {settings.forwardOnNoAnswer && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Timeout Settings</Text>
                <View style={styles.sectionContent}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>No Answer Timeout</Text>
                      <Text style={styles.settingSubtitle}>
                        Seconds to wait before forwarding (15-60)
                      </Text>
                    </View>
                    <TextInput
                      style={styles.timeoutInput}
                      value={settings.noAnswerTimeout.toString()}
                      onChangeText={(value) => {
                        const numValue = parseInt(value) || 30;
                        const clampedValue = Math.min(Math.max(numValue, 15), 60);
                        updateSetting('noAnswerTimeout', clampedValue);
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.brandPrimary} />
            <Text style={styles.infoText}>
              Call forwarding charges may apply depending on your carrier and destination.
              Changes may take a few minutes to take effect.
            </Text>
          </View>
        </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  saveButton: {
    backgroundColor: Colors.brandPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.small,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.textOnDark,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
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
    paddingVertical: Spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.appBackground,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textOnDark,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  phoneInput: {
    backgroundColor: Colors.appBackground,
    borderRadius: BorderRadius.small,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: Typography.fontSize.md,
    color: Colors.textOnDark,
    minWidth: 120,
    textAlign: 'center',
  },
  timeoutInput: {
    backgroundColor: Colors.appBackground,
    borderRadius: BorderRadius.small,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: Typography.fontSize.md,
    color: Colors.textOnDark,
    width: 50,
    textAlign: 'center',
  },
  infoSection: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${Colors.brandPrimary}10`,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderLeftWidth: 3,
    borderLeftColor: Colors.brandPrimary,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: Spacing.xxl,
  },
});