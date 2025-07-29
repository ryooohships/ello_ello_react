#!/bin/bash

# This script sets up EAS environment variables for the Ello Ello app
# Run this after logging in with: eas login

echo "Setting up EAS environment variables for Ello Ello..."

# Twilio secrets - REPLACE WITH YOUR ACTUAL VALUES
# eas env:create TWILIO_AUTH_TOKEN --scope project --value "YOUR_ACTUAL_TWILIO_AUTH_TOKEN"
# eas env:create TWILIO_API_KEY_SECRET --scope project --value "YOUR_ACTUAL_TWILIO_API_KEY_SECRET"

# MongoDB URI - REPLACE WITH YOUR ACTUAL VALUES
# eas env:create MONGODB_URI --scope project --value "YOUR_ACTUAL_MONGODB_URI"

echo "⚠️  SECURITY WARNING: This script has been sanitized."
echo "⚠️  You must replace the placeholder values with your actual credentials."
echo "⚠️  Never commit real credentials to version control."

echo "EAS environment variables setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure you have your Apple Push Key (.p8 file) from Apple Developer Portal"
echo "2. Get your Apple Team ID from Apple Developer Portal"
echo "3. Update EXPO_PUBLIC_APPLE_TEAM_ID in .env with your actual Apple Team ID" 
echo "4. Build your app: eas build --platform ios --profile preview"