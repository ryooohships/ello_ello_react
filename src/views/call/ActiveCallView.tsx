import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MuteToggleButton, SpeakerToggleButton, TranscriptionToggleButton } from '../components/ToggleButton';
import { Colors, Spacing, BorderRadius, Typography } from '../../resources/theme';
import { Call, CallState } from '../../services/managers/CallManager';
import { PhoneNumberFormatter } from '../../utils/PhoneNumberFormatter';

interface ActiveCallViewProps {
  call: Call;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
}

const { width } = Dimensions.get('window');

export default function ActiveCallView({
  call,
  onEndCall,
  onToggleMute,
  onToggleSpeaker
}: ActiveCallViewProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isTranscriptionActive, setIsTranscriptionActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (call.state === CallState.CONNECTED && call.startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - call.startTime!.getTime()) / 1000);
        setCallDuration(duration);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [call.state, call.startTime]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = (): string => {
    switch (call.state) {
      case CallState.DIALING:
        return 'Calling...';
      case CallState.RINGING:
        return 'Ringing...';
      case CallState.CONNECTED:
        return formatDuration(callDuration);
      case CallState.MUTED:
        return `${formatDuration(callDuration)} • Muted`;
      case CallState.ON_HOLD:
        return 'On Hold';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.contactName}>
          {call.displayName || 'Unknown'}
        </Text>
        <Text style={styles.phoneNumber}>
          {PhoneNumberFormatter.formatPhoneNumber(call.phoneNumber)}
        </Text>
        <Text style={styles.callStatus}>
          {getStatusText()}
        </Text>
      </View>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={80} color={Colors.textSecondary} />
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <MuteToggleButton
            isMuted={call.isMuted}
            onPress={onToggleMute}
            activeColor={Colors.warning}
          />
          <SpeakerToggleButton
            isSpeakerOn={call.isSpeakerOn}
            onPress={onToggleSpeaker}
          />
          <TranscriptionToggleButton
            isActive={isTranscriptionActive}
            onPress={() => setIsTranscriptionActive(!isTranscriptionActive)}
          />
        </View>

        <View style={styles.endCallRow}>
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={onEndCall}
          >
            <Ionicons
              name="call"
              size={36}
              color={Colors.buttonText}
              style={{ transform: [{ rotate: '135deg' }] }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  contactName: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textOnDark,
    textAlign: 'center',
  },
  phoneNumber: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  callStatus: {
    fontSize: Typography.fontSize.md,
    color: Colors.brandPrimary,
    marginTop: Spacing.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  avatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  endCallRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  
  endCallButton: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.callEnd,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryControlsRow: {
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
  },
});