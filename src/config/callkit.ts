/**
 * CallKit Configuration
 * According to Apple guidelines, VoIP apps MUST use CallKit
 * The Twilio Voice SDK handles CallKit automatically, but we can configure it
 */

export const CALLKIT_CONFIG = {
  // Display name for the app in the native call UI
  appName: 'Ello Ello',
  
  // Icon to show in the native call UI (optional)
  // Must be a bundled image in iOS
  imageName: 'AppIcon',
  
  // Ringtone to play for incoming calls (optional)
  // Must be a bundled sound file in iOS
  ringtoneSound: 'default',
  
  // Whether to include video button in call UI
  supportsVideo: false,
  
  // Maximum number of call groups
  maximumCallGroups: 1,
  
  // Maximum calls per group
  maximumCallsPerCallGroup: 1,
  
  // Whether the provider supports holding calls
  supportsHolding: false,
  
  // Whether the provider supports grouping calls
  supportsGrouping: false,
  
  // Whether the provider supports ungrouping calls
  supportsUngrouping: false,
  
  // Whether the provider supports DTMF (dial pad during calls)
  supportsDTMF: true,
};

/**
 * Call identification configuration
 * This helps iOS show contact names instead of just numbers
 */
export const CALL_IDENTIFICATION = {
  // Whether to use the iOS contacts for caller ID
  includesCallsInRecents: true,
  
  // Format for displaying phone numbers
  // This should match your region's format
  defaultCountryCode: '+1',
};