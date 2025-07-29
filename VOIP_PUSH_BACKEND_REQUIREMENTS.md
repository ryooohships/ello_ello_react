# VoIP Push Backend Requirements

## Critical Requirements for VoIP Push Notifications

Your backend MUST implement the following to support VoIP push notifications properly:

### 1. Token Endpoint Updates

The `/twilio/token` endpoint needs to handle device tokens:

```javascript
app.post('/twilio/token', async (req, res) => {
  const { identity, platform, deviceToken } = req.body;
  
  // Create access token
  const accessToken = new AccessToken(
    accountSid,
    apiKey,
    apiSecret,
    { identity }
  );

  // Create Voice grant
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: twimlAppSid,
    pushCredentialSid: process.env.TWILIO_PUSH_CREDENTIAL_SID // CRITICAL!
  });

  // Add grant to token
  accessToken.addGrant(voiceGrant);

  // CRITICAL: If device token provided, store it for the user
  if (deviceToken && platform === 'ios') {
    await storeUserDeviceToken(identity, deviceToken);
  }

  res.json({ token: accessToken.toJwt() });
});
```

### 2. Device Token Storage

Store VoIP device tokens for each user:

```javascript
// Store device token when user registers
async function storeUserDeviceToken(userId, deviceToken) {
  // Store in your database
  await db.users.update({
    where: { id: userId },
    data: { 
      voipDeviceToken: deviceToken,
      lastTokenUpdate: new Date()
    }
  });
}
```

### 3. VoIP Token Endpoint (Optional)

The app also sends tokens to `/users/:identity/voip-token`:

```javascript
app.post('/users/:identity/voip-token', async (req, res) => {
  const { identity } = req.params;
  const { deviceToken, platform } = req.body;
  
  if (platform === 'ios' && deviceToken) {
    await storeUserDeviceToken(identity, deviceToken);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid platform or missing token' });
  }
});
```

### 4. Important Notes

1. **Push Credential SID**: Must be included in the Voice grant
2. **Device Token**: iOS provides this through PushKit, not regular APNS
3. **Token Updates**: Device tokens can change, always use the latest one
4. **Platform Check**: Only iOS supports VoIP push

### 5. Testing VoIP Push

To test if VoIP push is working:

1. Ensure `TWILIO_PUSH_CREDENTIAL_SID` is set in backend env
2. Check that device tokens are being received and stored
3. Make a test call to the device
4. Device should receive VoIP push even when app is terminated

### 6. Common Issues

- **No push received**: Check if push credential SID is included in token
- **Push works once then stops**: Device token might have changed
- **CallKit not showing**: Ensure app has proper entitlements
- **App crashes on push**: Must report to CallKit immediately

## Backend Checklist

- [ ] `/twilio/token` includes push credential SID in Voice grant
- [ ] Device tokens are stored when provided
- [ ] Token endpoint accepts `deviceToken` parameter
- [ ] Backend logs show device token registration
- [ ] Push credential SID is configured in Twilio Console