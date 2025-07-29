import { Voice } from '@twilio/voice-react-native-sdk';
import { Platform } from 'react-native';

/**
 * Configure CallKit display settings according to Apple guidelines
 * This ensures proper caller identification in the native UI
 */
export class CallKitConfiguration {
  static async configure(voice: Voice): Promise<void> {
    if (Platform.OS !== 'ios') {
      return;
    }

    try {
      // Configure CallKit using the official Twilio SDK method
      await voice.setCallKitConfiguration({
        // App icon for CallKit (must be in iOS bundle)
        callKitIconTemplateImageData: '', // Empty string uses default app icon
        
        // Whether to include call in recents (iOS 11+)
        callKitIncludesCallsInRecents: true,
        
        // Maximum number of call groups
        callKitMaximumCallGroups: 1,
        
        // Maximum calls per group  
        callKitMaximumCallsPerCallGroup: 1,
        
        // Ringtone sound (must be in iOS bundle)
        callKitRingtoneSound: '', // Empty string uses default ringtone
        
        // Supported handle types - phone numbers for VoIP calls
        callKitSupportedHandleTypes: [1], // 1 = PhoneNumber handle type
      });
      
      console.log('✅ CallKit configured for optimal display');
    } catch (error) {
      console.error('❌ Failed to configure CallKit:', error);
      // Non-critical - continue without custom configuration
    }
  }
}