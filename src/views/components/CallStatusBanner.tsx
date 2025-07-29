import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../resources/theme';
import { useServices } from '../../services/ServiceProvider';
import { Call, CallState } from '../../services/managers/CallManager';
import { PhoneNumberFormatter } from '../../utils/PhoneNumberFormatter';

export default function CallStatusBanner() {
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [slideAnim] = useState(new Animated.Value(-80));
  const { callManager } = useServices();

  useEffect(() => {
    const handleCallStateChange = (call: Call | null) => {
      setCurrentCall(call);
      
      if (call && call.state !== CallState.ENDED && call.state !== CallState.FAILED) {
        // Slide down banner
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // Slide up banner
        Animated.timing(slideAnim, {
          toValue: -80,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    callManager.addStateListener(handleCallStateChange);

    // Get initial call state
    const initialCall = callManager.getCurrentCall();
    if (initialCall) {
      handleCallStateChange(initialCall);
    }

    return () => {
      callManager.removeStateListener(handleCallStateChange);
    };
  }, [callManager, slideAnim]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentCall?.state === CallState.CONNECTED && currentCall.startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - currentCall.startTime!.getTime()) / 1000);
        setCallDuration(duration);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentCall?.state, currentCall?.startTime]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = (): string => {
    if (!currentCall) return '';
    
    switch (currentCall.state) {
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

  const getStatusColor = (): string => {
    if (!currentCall) return Colors.success;
    
    switch (currentCall.state) {
      case CallState.DIALING:
        return Colors.warning;
      case CallState.RINGING:
        return Colors.brandPrimary;
      case CallState.CONNECTED:
        return Colors.success;
      case CallState.MUTED:
        return Colors.warning;
      case CallState.ON_HOLD:
        return Colors.textSecondary;
      default:
        return Colors.success;
    }
  };

  const handleBannerPress = () => {
    // This would open the full call UI
    // For now, we'll just show it's interactive
  };

  const handleEndCall = async () => {
    try {
      await callManager.endCall();
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  if (!currentCall || 
      currentCall.state === CallState.ENDED || 
      currentCall.state === CallState.FAILED ||
      currentCall.state === CallState.IDLE) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ translateY: slideAnim }],
          backgroundColor: getStatusColor(),
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.banner} 
        onPress={handleBannerPress}
        activeOpacity={0.8}
      >
        <View style={styles.callInfo}>
          <Ionicons name="call" size={16} color={Colors.textOnDark} />
          <Text style={styles.contactName}>
            {currentCall.displayName || PhoneNumberFormatter.formatPhoneNumber(currentCall.phoneNumber)}
          </Text>
          <Text style={styles.statusText}>
            {getStatusText()}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.endButton}
          onPress={handleEndCall}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name="call" 
            size={20} 
            color={Colors.textOnDark}
            style={{ transform: [{ rotate: '135deg' }] }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000, // For Android
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textOnDark,
    marginLeft: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textOnDark,
    marginLeft: Spacing.sm,
    opacity: 0.9,
  },
  endButton: {
    padding: Spacing.xs,
  },
});