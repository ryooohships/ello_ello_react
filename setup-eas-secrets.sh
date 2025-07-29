#!/bin/bash

# This script sets up EAS environment variables for the Ello Ello app
# Run this after logging in with: eas login

echo "Setting up EAS environment variables for Ello Ello..."

# Twilio secrets
eas env:create TWILIO_AUTH_TOKEN --scope project --value "0fe7e9f201101fa6acf2168866d41e0d"
eas env:create TWILIO_API_KEY_SECRET --scope project --value "poGhR4PO8kflPwLAwd43IlJmpYtOCgac"

# MongoDB URI (if needed by the app)
eas env:create MONGODB_URI --scope project --value "mongodb+srv://ryoooh:Hsgn8SEoYnpzYl8T@elloello-mongodb.v4keyul.mongodb.net/?retryWrites=true&w=majority&appName=elloello-mongodb"

echo "EAS environment variables setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure you have your Apple Push Key (.p8 file) from Apple Developer Portal"
echo "2. Get your Apple Team ID from Apple Developer Portal"
echo "3. Update EXPO_PUBLIC_APPLE_TEAM_ID in .env with your actual Apple Team ID" 
echo "4. Build your app: eas build --platform ios --profile preview"