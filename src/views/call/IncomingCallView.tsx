import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../resources/theme';
import { Call } from '../../services/managers/CallManager';
import { PhoneNumberFormatter } from '../../utils/PhoneNumberFormatter';
import CallActionButton from '../components/CallActionButton';

interface IncomingCallViewProps {
  call: Call;
  onAccept: () => void;
  onDecline: () => void;
}

const { width, height } = Dimensions.get('window');

export default function IncomingCallView({ call, onAccept, onDecline }: IncomingCallViewProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundOverlay} />
      
      <View style={styles.header}>
        <Text style={styles.incomingLabel}>Incoming call</Text>
      </View>

      <View style={styles.callerInfo}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={100} color={Colors.textSecondary} />
        </View>
        
        <Text style={styles.callerName}>
          {call.displayName || 'Unknown Caller'}
        </Text>
        
        <Text style={styles.callerNumber}>
          {PhoneNumberFormatter.formatPhoneNumber(call.phoneNumber)}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.primaryActions}>
          <CallActionButton
            iconName="call"
            onPress={onDecline}
            size="large"
            variant="danger"
            style={{ transform: [{ rotate: '135deg' }] }}
          />
          
          <CallActionButton
            iconName="call"
            onPress={onAccept}
            size="large"
            variant="primary"
          />
        </View>

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="chatbubble" size={24} color={Colors.textOnDark} />
            <Text style={styles.secondaryLabel}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="notifications-off" size={24} color={Colors.textOnDark} />
            <Text style={styles.secondaryLabel}>Remind Me</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pureBlack,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.appBackground,
    opacity: 0.95,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  incomingLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  callerInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 4,
    borderColor: Colors.brandPrimary,
  },
  callerName: {
    fontSize: Typography.fontSize.xxl + 8,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textOnDark,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  callerNumber: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    paddingBottom: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  primaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
  },
  secondaryButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  secondaryLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});