/**
 * Twilio Configuration
 * 
 * To use real Twilio Voice SDK:
 * 1. Create an Expo development build (not Expo Go)
 * 2. Set USE_REAL_TWILIO to true
 * 3. Ensure your backend is running and returning valid tokens
 * 4. Configure your Twilio account with proper TwiML apps
 */

export const TWILIO_CONFIG = {
  // Set to true when using development build with real Twilio SDK
  USE_REAL_TWILIO: process.env.EXPO_PUBLIC_USE_REAL_TWILIO === 'true',
  
  // Backend URL for token generation
  BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL || 'https://elloello-backend.onrender.com',
  
  // Default user identity for development
  DEFAULT_IDENTITY: process.env.EXPO_PUBLIC_DEFAULT_IDENTITY || '+1234567890',
  
  // Mock call simulation delays (in milliseconds)
  MOCK_DELAYS: {
    RINGING: 1000,
    CONNECTED: 3000,
  }
};