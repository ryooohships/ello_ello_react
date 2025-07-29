import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../resources/theme';
import { useServices } from '../../services/ServiceProvider';
import { PhoneNumberFormatter } from '../../utils/PhoneNumberFormatter';
import { Call, CallState } from '../../services/managers/CallManager';

export default function DialpadTabView() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const { callManager, callLogService } = useServices();

  useEffect(() => {
    // Listen for call state changes
    const handleCallStateChange = (call: Call | null) => {
      setCurrentCall(call);
    };

    callManager.addStateListener(handleCallStateChange);

    return () => {
      callManager.removeStateListener(handleCallStateChange);
    };
  }, [callManager]);

  const handleDigitPress = (digit: string) => {
    if (currentCall) {
      // TODO: Send DTMF tone during call
      return;
    }
    
    const newNumber = phoneNumber + digit;
    setPhoneNumber(newNumber);
  };

  const handleDelete = () => {
    if (currentCall) return;
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = async () => {
    if (currentCall) {
      // End current call
      try {
        await callManager.endCall();
        // Add to call log
        await callLogService.addCallLog({
          phoneNumber: currentCall.phoneNumber,
          displayName: currentCall.displayName,
          timestamp: new Date(),
          duration: currentCall.duration || 0,
          isIncoming: currentCall.isIncoming,
          isMissed: false,
          isAnswered: true,
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to end call');
      }
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Invalid Number', 'Please enter a phone number');
      return;
    }

    if (!PhoneNumberFormatter.isValidPhoneNumber(phoneNumber)) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number');
      return;
    }

    try {
      const formattedNumber = PhoneNumberFormatter.formatForDialing(phoneNumber);
      await callManager.initiateCall(formattedNumber);
      setPhoneNumber(''); // Clear after successful call initiation
    } catch (error) {
      Alert.alert('Call Failed', 'Unable to initiate call. Please try again.');
    }
  };

  const dialpadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  const letterMap: { [key: string]: string } = {
    '2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL',
    '6': 'MNO', '7': 'PQRS', '8': 'TUV', '9': 'WXYZ',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.phoneNumber}>
          {currentCall 
            ? PhoneNumberFormatter.formatPhoneNumber(currentCall.phoneNumber)
            : (phoneNumber ? PhoneNumberFormatter.formatAsTyped(phoneNumber) : 'Enter number')
          }
        </Text>
        {currentCall && (
          <View style={styles.callStatusContainer}>
            <Text style={styles.callStatus}>
              {currentCall.state === CallState.DIALING && 'Calling...'}
              {currentCall.state === CallState.RINGING && 'Ringing...'}
              {currentCall.state === CallState.CONNECTED && 'Connected'}
              {currentCall.state === CallState.MUTED && 'Muted'}
            </Text>
            {currentCall.state === CallState.CONNECTED && (
              <Text style={styles.callDuration}>00:30</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.dialpadContainer}>
        {dialpadButtons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((digit) => (
              <TouchableOpacity
                key={digit}
                style={styles.dialpadButton}
                onPress={() => handleDigitPress(digit)}
              >
                <Text style={styles.digitText}>{digit}</Text>
                {letterMap[digit] && (
                  <Text style={styles.lettersText}>{letterMap[digit]}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <Ionicons name="backspace-outline" size={28} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.callButton, currentCall && styles.endCallButton]} 
          onPress={handleCall}
        >
          <Ionicons 
            name={currentCall ? "call-outline" : "call"} 
            size={32} 
            color={Colors.buttonText} 
            style={currentCall && { transform: [{ rotate: '135deg' }] }}
          />
        </TouchableOpacity>
        
        {currentCall && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => callManager.toggleMute()}
          >
            <Ionicons 
              name={currentCall.isMuted ? "mic-off" : "mic"} 
              size={28} 
              color={currentCall.isMuted ? Colors.callMuted : Colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
        
        <View style={styles.actionButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  displayContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: Typography.fontSize.xxl,
    color: Colors.textOnDark,
    fontWeight: Typography.fontWeight.medium,
  },
  dialpadContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  dialpadButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitText: {
    fontSize: Typography.fontSize.xxl,
    color: Colors.textOnDark,
    fontWeight: Typography.fontWeight.regular,
  },
  lettersText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  actionButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.callActive,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallButton: {
    backgroundColor: Colors.callEnd,
  },
  callStatusContainer: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  callStatus: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  callDuration: {
    fontSize: Typography.fontSize.sm,
    color: Colors.brandPrimary,
    marginTop: 4,
  },
});