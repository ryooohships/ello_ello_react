# EAS Build Setup Guide for Ello Ello

This guide will help you set up and build your Ello Ello app using Expo Application Services (EAS).

## Prerequisites

1. **Expo Account**: Create a free account at [expo.dev](https://expo.dev)
2. **Apple Developer Account**: Required for iOS builds ($99/year)
3. **EAS CLI**: Install globally with `npm install -g @expo/eas-cli`
4. **Backend Server**: Your backend must be running and accessible

## Initial Setup

### 1. Login to EAS

```bash
eas login
```

### 2. Configure EAS Project

```bash
eas build:configure
```

This will link your project to your Expo account using the project ID already in app.json.

### 3. Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your actual configuration

### 4. Configure EAS Secrets

For sensitive data that shouldn't be in your code, use EAS secrets:

```bash
# Twilio credentials (get these from Twilio Console)
eas secret:create TWILIO_ACCOUNT_SID --scope project --type string
eas secret:create TWILIO_AUTH_TOKEN --scope project --type string
eas secret:create TWILIO_API_KEY_SID --scope project --type string
eas secret:create TWILIO_API_KEY_SECRET --scope project --type string

# Apple Push Notification key (from Apple Developer Portal)
eas secret:create APPLE_PUSH_KEY --scope project --type file --value ./AuthKey_XXXXXXXX.p8
```

## iOS Setup

### 1. Apple Developer Portal Configuration

1. **Create App ID**:
   - Go to [Apple Developer Portal](https://developer.apple.com)
   - Identifiers → Add → App IDs
   - Bundle ID: `com.ryoooh123.elloello`
   - Enable capabilities:
     - Push Notifications
     - Background Modes (Audio, Voice over IP, Background processing)

2. **Create Push Notification Key**:
   - Keys → Add → Apple Push Notification service (APNs)
   - Download the `.p8` file and save it securely
   - Note the Key ID and Team ID

3. **Configure Provisioning Profiles**:
   - EAS will handle this automatically during the build process

### 2. Push Notifications Setup

1. Upload your APNs key to Twilio:
   - Go to Twilio Console → Voice → Push Credentials
   - Create new credential with your `.p8` file
   - Note the Credential SID

2. Update your backend to use this credential SID when generating access tokens

### 3. Build for iOS

```bash
# Development build (for testing with dev client)
eas build --platform ios --profile development

# Preview build (for internal testing)
eas build --platform ios --profile preview

# Production build (for App Store)
eas build --platform ios --profile production
```

## Android Setup

### 1. Build for Android

```bash
# Development build
eas build --platform android --profile development

# Preview build (APK for testing)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

## Switching Between Mock and Real Twilio

### For Development (Mock Mode)
1. Set `EXPO_PUBLIC_USE_REAL_TWILIO=false` in `.env`
2. Use Expo Go or development build
3. Calls will be simulated

### For Production (Real Twilio)
1. Set `EXPO_PUBLIC_USE_REAL_TWILIO=true` in `.env`
2. Ensure backend is configured and running
3. Build with EAS: `eas build --platform ios --profile preview`
4. Calls will use real Twilio Voice SDK

## Testing Your Build

### iOS Testing
1. Download the build from Expo dashboard
2. Install using TestFlight (production) or ad-hoc distribution (preview)
3. Grant microphone and notification permissions when prompted
4. Test outgoing and incoming calls

### Android Testing
1. Download the APK (preview) or AAB (production)
2. Install on device
3. Grant all required permissions
4. Test calling functionality

## Troubleshooting

### Build Failures
- Check `eas build --platform ios --profile development --local` for detailed logs
- Ensure all secrets are properly configured
- Verify bundle identifier matches Apple Developer Portal

### Push Notifications Not Working
- Verify APNs certificate/key is uploaded to Twilio
- Check entitlements include PushKit
- Ensure backend is sending correct push payloads

### Calls Not Connecting
- Verify `USE_REAL_TWILIO` is set correctly
- Check backend is accessible from device
- Review Twilio Console for error logs
- Ensure access tokens are being generated correctly

### Audio Issues
- Check Info.plist includes all background modes
- Verify microphone permissions are granted
- Test with different audio routes (speaker, bluetooth)

## Production Checklist

Before submitting to App Store:

- [ ] Switch to production Twilio credentials
- [ ] Update backend URL to production
- [ ] Remove debug logging
- [ ] Test on multiple iOS versions
- [ ] Verify push notifications work in production
- [ ] Test incoming calls from background
- [ ] Review and update app metadata
- [ ] Generate production build with `eas build --platform ios --profile production`

## Submission

### iOS App Store
1. Build production version: `eas build --platform ios --profile production`
2. Submit using EAS: `eas submit --platform ios`
3. Or download IPA and upload via Transporter

### Google Play Store
1. Build production AAB: `eas build --platform android --profile production`
2. Submit using EAS: `eas submit --platform android`
3. Or download AAB and upload via Play Console

## Important Notes

1. **Never commit** `.env`, `.p8` files, or any credentials to git
2. **Always test** preview builds before production
3. **Monitor** Twilio Console for usage and errors
4. **Keep** your Apple Developer certificates updated
5. **Document** any custom configuration for your team

For more information:
- [EAS Build Documentation](https://docs.expo.dev/eas/build/)
- [Twilio Voice React Native SDK](https://www.twilio.com/docs/voice/sdks/react-native)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)