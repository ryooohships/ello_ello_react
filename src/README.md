# Ello Ello React Native App

This is the React Native/Expo version of the Ello Ello app, running in parallel with the Swift version.

## Folder Structure

This folder structure mirrors the Swift app organization:

- `services/` - Business logic and service layers
  - `audio/` - Audio management (dialtone, call audio)
  - `backend/` - API communication
  - `core/` - Core services (user, tokens, service container)
  - `managers/` - App state, call, contacts, permissions managers
  - `twilio/` - Twilio integration
  - `utils/` - Utility services
- `models/` - Data models
- `views/` - UI components and screens
  - `call/` - Call-related views
  - `components/` - Reusable UI components
  - `main/` - Main tab views
  - `modals/` - Modal dialogs
  - `onboarding/` - Onboarding flow
  - `permissions/` - Permission requests
  - `subscription/` - Subscription management
  - `verification/` - Phone verification
- `errors/` - Error types and handling
- `resources/` - Assets, themes, configuration
- `utils/` - Utility functions

## Running the App

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```