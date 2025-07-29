import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../resources/theme';
import { useServices } from '../../services/ServiceProvider';
import { PhoneNumberFormatter } from '../../utils/PhoneNumberFormatter';
import { MuteToggleButton, SpeakerToggleButton, TranscriptionToggleButton } from '../components/ToggleButton';
import CatchphraseService from '../../services/utils/CatchphraseService';

export default function DialpadTabView() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTranscriptionActive, setIsTranscriptionActive] = useState(false);
  const [currentCatchphrase, setCurrentCatchphrase] = useState(CatchphraseService.getDefaultCatchphrase());
  const { callManager, contactsManager, audioManager } = useServices();
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pick a random catchphrase when the view appears or when number is cleared
  useEffect(() => {
    if (!phoneNumber) {
      setCurrentCatchphrase(CatchphraseService.getRandomCatchphrase());
    }
  }, [phoneNumber]);

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

  const handleStarLongPress = async () => {
    setPhoneNumber(prev => prev + '+');
    
    if (audioManager) {
      try {
        await audioManager.playDialtone('+');
      } catch (error) {
        console.warn('Failed to play dialtone:', error);
      }
    }
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleDeleteLongPress = () => {
    deleteTimerRef.current = setInterval(() => {
      setPhoneNumber(prev => {
        if (prev.length === 0) {
          if (deleteTimerRef.current) {
            clearInterval(deleteTimerRef.current);
            deleteTimerRef.current = null;
          }
          return prev;
        }
        return prev.slice(0, -1);
      });
    }, 100);
  };

  const handleDeletePressOut = () => {
    if (deleteTimerRef.current) {
      clearInterval(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Call Failed', `Unable to place call: ${errorMessage}`);
    }
  };

  const dialpadButtons = [
    [
      { digit: '1', letters: '' },
      { digit: '2', letters: 'ABC' },
      { digit: '3', letters: 'DEF' }
    ],
    [
      { digit: '4', letters: 'GHI' },
      { digit: '5', letters: 'JKL' },
      { digit: '6', letters: 'MNO' }
    ],
    [
      { digit: '7', letters: 'PQRS' },
      { digit: '8', letters: 'TUV' },
      { digit: '9', letters: 'WXYZ' }
    ],
    [
      { digit: '*', letters: '+', isSpecial: true },
      { digit: '0', letters: '' },
      { digit: '#', letters: '' }
    ],
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.displayContainer}>
        <TouchableOpacity 
          style={styles.phoneNumberContainer}
          onPress={() => {
            if (!phoneNumber) {
              setCurrentCatchphrase(CatchphraseService.getRandomCatchphrase());
            }
          }}
        >
          <Text style={[
            styles.phoneNumber,
            {
              fontSize: phoneNumber ? 24 : 20,
              color: phoneNumber ? Colors.textOnDark : Colors.textSecondary
            }
          ]}>
            {phoneNumber || currentCatchphrase}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dialpadContainer}>
        {dialpadButtons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((button) => {
              if (button.isSpecial && button.digit === '*') {
                return (
                  <Pressable
                    key={button.digit}
                    style={styles.dialpadButton}
                    onPress={() => handleDigitPress(button.digit)}
                    onLongPress={handleStarLongPress}
                  >
                    <View style={styles.specialButtonContent}>
                      <Text style={styles.digitText}>{button.digit}</Text>
                      <Text style={styles.specialLettersText}>{button.letters}</Text>
                    </View>
                  </Pressable>
                );
              }
              
              return (
                <TouchableOpacity
                  key={button.digit}
                  style={styles.dialpadButton}
                  onPress={() => handleDigitPress(button.digit)}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.digitText}>{button.digit}</Text>
                    {button.letters && (
                      <Text style={styles.lettersText}>{button.letters}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Control Buttons and Call Button Row */}
      <View style={styles.bottomSection}>
        {/* Control Buttons Row */}
        <View style={styles.controlButtonsRow}>
          <SpeakerToggleButton
            isSpeakerOn={isSpeakerOn}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          />
          
          <MuteToggleButton
            isMuted={isMuted}
            onPress={() => setIsMuted(!isMuted)}
          />
          
          <TranscriptionToggleButton
            isActive={isTranscriptionActive}
            onPress={() => setIsTranscriptionActive(!isTranscriptionActive)}
          />
        </View>

        {/* Call Button Row */}
        <View style={styles.callButtonRow}>
          <View style={styles.callButtonContainer}>
            {/* Call button in center */}
            <TouchableOpacity 
              style={[
                styles.callButton,
                { backgroundColor: phoneNumber ? Colors.callActive : Colors.callActive + '80' }
              ]} 
              onPress={handleCall}
              disabled={!phoneNumber}
            >
              <Ionicons name="call" size={30} color={Colors.buttonText} />
            </TouchableOpacity>

            {/* Delete button - horizontally aligned with call button, vertically aligned with transcription */}
            {phoneNumber && (
              <Pressable 
                style={styles.deleteButton} 
                onPress={handleDelete}
                onLongPress={handleDeleteLongPress}
                onPressOut={handleDeletePressOut}
              >
                <Ionicons name="backspace-outline" size={20} color={Colors.textOnDark} />
              </Pressable>
            )}
          </View>
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
  displayContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    minHeight: 80,
  },
  phoneNumberContainer: {
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minWidth: 350,
    maxWidth: '95%',
  },
  phoneNumber: {
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  dialpadContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  dialpadButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.darkBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    alignItems: 'center',
  },
  specialButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontSize: 28,
    color: Colors.textOnDark,
    fontWeight: Typography.fontWeight.medium,
  },
  lettersText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  specialLettersText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: -8,
  },
  bottomSection: {
    paddingBottom: 50,
  },
  controlButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonRow: {
    alignItems: 'center',
    height: 80,
  },
  callButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  callButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.callActive,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    right: 80,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});