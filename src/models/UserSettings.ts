export interface UserSettings {
  // User Identity
  phoneNumber?: string;
  displayName?: string;
  isVerified: boolean;
  
  // Subscription
  subscriptionActive: boolean;
  subscriptionType?: 'basic' | 'premium';
  subscriptionExpiresAt?: Date;
  
  // Call Settings
  enableTranscription: boolean;
  enableRecording: boolean;
  enableDialtone: boolean;
  
  // Audio Settings
  speakerDefault: boolean;
  muteDefault: boolean;
  ringtoneVolume: number; // 0-1
  
  // Privacy Settings
  allowContactAccess: boolean;
  allowNotifications: boolean;
  allowLocationAccess: boolean;
  
  // App Settings
  theme: 'light' | 'dark' | 'system';
  language: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  isVerified: false,
  subscriptionActive: false,
  enableTranscription: true,
  enableRecording: false,
  enableDialtone: true,
  speakerDefault: false,
  muteDefault: false,
  ringtoneVolume: 0.8,
  allowContactAccess: false,
  allowNotifications: true,
  allowLocationAccess: false,
  theme: 'dark',
  language: 'en',
  createdAt: new Date(),
  updatedAt: new Date(),
};