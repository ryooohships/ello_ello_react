# Building the React Native App with EAS

## Important: Monorepo Structure

This project contains both iOS native and React Native apps. The React Native app is in the `rn-app` subdirectory.

## Building with EAS

**ALWAYS run EAS commands from inside the `rn-app` directory:**

```bash
# Navigate to the React Native app directory first
cd rn-app

# Then run EAS build
npx eas build --platform ios --profile development

# Or to check build status
npx eas build:list --limit 5
```

## Common Issues

### "package.json does not exist" Error
This happens when EAS is run from the wrong directory. Make sure you're in the `rn-app` directory.

### Wrong eas.json Being Used
If there's an `eas.json` in the project root, delete it. Only use the one in `rn-app/eas.json`.

## Project Structure
```
ello_ello_app/
├── ios-app/        # Native iOS app (Swift)
├── rn-app/         # React Native app
│   ├── package.json
│   ├── eas.json
│   └── src/
└── shared-assets/  # Shared resources
```

## Running the Development Build

After the build completes:

1. Download the .ipa file from the EAS build page
2. Install on your device using the QR code or direct link
3. Start the dev server:
   ```bash
   cd rn-app
   npm start
   ```
4. Connect to the dev server from your device

## Twilio VoIP Push Credentials

The EAS build generated a new VoIP push key: `AuthKey_5F59F4FR6U.p8`

This needs to be configured in Twilio:
1. Go to Twilio Console → Voice → Push Credentials
2. Create/update the iOS VoIP credential with this new key
3. Update the backend's `TWILIO_PUSH_CREDENTIAL_SID` environment variable