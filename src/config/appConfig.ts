export const appConfig = {
  // Use environment variable to determine if we should use real Twilio
  useMockTwilio: process.env.EXPO_PUBLIC_USE_REAL_TWILIO !== 'true',
};
