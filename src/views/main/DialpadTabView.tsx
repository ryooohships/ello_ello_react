import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../resources/theme';
import { useServices } from '../../services/ServiceProvider';
import { PhoneNumberFormatter } from '../../utils/PhoneNumberFormatter';

export default function DialpadTabView() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { callManager, contactsManager, audioManager } = useServices();

  const handleDigitPress = async (digit: string) => {
    setPhoneNumber(prev => prev + digit);
    
    // Play dialtone sound and haptic feedback
    if (audioManager) {
      try {
        await audioManager.playDialtone(digit);
      } catch (error) {
        console.warn('Failed to play dialtone:', error);
      }
    }
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    try {
      // Format the phone number for dialing
      const formattedNumber = PhoneNumberFormatter.formatForDialing(phoneNumber);
      
      // Try to get contact name
      let displayName: string | undefined;
      try {
        const contact = await contactsManager.getContactByPhoneNumber(formattedNumber);
        displayName = contact?.displayName;
      } catch (error) {
        // Contact lookup failed, continue without name
      }

      // Initiate the call
      await callManager.initiateCall(formattedNumber, displayName);
      
      // Clear the dialpad
      setPhoneNumber('');
      
      Alert.alert('Call Started', `Calling ${displayName || PhoneNumberFormatter.formatPhoneNumber(formattedNumber)}`);
    } catch (error) {
      console.error('Failed to initiate call:', error);
      Alert.alert('Call Failed', 'Unable to place call. Please try again.');
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
          {phoneNumber ? PhoneNumberFormatter.formatPhoneNumber(phoneNumber) : 'Enter number'}
        </Text>
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
        
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Ionicons name="call" size={32} color={Colors.buttonText} />
        </TouchableOpacity>
        
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
});