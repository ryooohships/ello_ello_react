# Twilio Voice Integration Setup

This app supports both **mock Twilio** (for Expo Go development) and **real Twilio Voice SDK** (for production/development builds).

## Current Status: Mock Mode (Expo Go Compatible)

The app is currently configured to use mock Twilio functionality for Expo Go compatibility. This allows you to:
- Test the UI and call flow
- Simulate outgoing calls with realistic state transitions
- Test incoming call notifications
- Develop without needing a development build

## Switching to Real Twilio Voice SDK

To use the real Twilio Voice SDK for actual voice calls:

### 1. Prerequisites

You'll need:
- A Twilio account with Voice API enabled
- A backend server that can generate Twilio access tokens
- An Expo development build (Twilio Voice SDK requires native code)

### 2. Backend Setup

Your backend needs an endpoint at `POST /twilio/token` that:
```json
{
  "identity": "+1234567890"
}
```

Returns:
```json
{
  "token": "twilio_access_token_here"
}
```

### 3. Create Development Build

```bash
# Install EAS CLI if you haven't
npm install -g @expo/eas-cli

# Configure development build
eas build:configure

# Create development build for iOS
eas build --platform ios --profile development

# Create development build for Android  
eas build --platform android --profile development
```

### 4. Update Configuration

In `src/config/twilio.ts`:
```typescript
export const TWILIO_CONFIG = {
  USE_REAL_TWILIO: true,  // Change this to true
  BACKEND_URL: 'https://your-backend.com',  // Your backend URL
  DEFAULT_IDENTITY: '+1234567890',  // Your test identity
  // ... rest stays the same
};
```

### 5. Update TwilioService

In `src/services/twilio/TwilioService.ts`, uncomment the real SDK import:
```typescript
import { Voice, Call as TwilioCall, CallInvite } from '@twilio/voice-react-native-sdk';
```

And update the initialize method to use real SDK when configured.

### 6. iOS Permissions (Info.plist)

Add microphone permission:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to make voice calls</string>
```

### 7. Android Permissions (android/app/src/main/AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

## Testing

### Mock Mode (Current)
- Run with `npx expo start`
- Use Expo Go app
- Calls will simulate but not connect

### Real Twilio Mode
- Install development build on device
- Ensure backend is running and accessible
- Make real voice calls through Twilio

## Troubleshooting

### "Unable to place call" Error
- Check that backend is running and reachable
- Verify Twilio credentials in backend
- Check network connectivity
- Look at console logs for specific errors

### Real SDK Won't Load
- Ensure you're using a development build, not Expo Go
- Check that @twilio/voice-react-native-sdk is properly installed
- Verify native code compilation succeeded

### Token Errors
- Check backend logs for token generation
- Verify Twilio account credentials
- Ensure TwiML app is properly configured

## Architecture Notes

The app is designed to gracefully fallback between real and mock implementations:

1. **TwilioService** attempts real SDK first, falls back to mock
2. **CallManager** works with both real and mock calls seamlessly  
3. **UI components** are agnostic to the underlying implementation

This allows for development with Expo Go while maintaining production readiness.