# Shared Assets

This directory contains assets shared between the Swift and React Native versions of the app.

## Structure

- `images/` - Shared image assets
- `audio/` - Shared audio files (ringtones, etc.)

## Usage

### Swift App
Reference these files from the Swift app using relative paths or copy them during build.

### React Native App
Import these assets in your React Native components:

```typescript
// Audio files
const dialTone = require('../../shared-assets/audio/outgoing_vintage_1.mp3');

// Images (when added)
const logo = require('../../shared-assets/images/logo.png');
```

## Important Notes

- Keep file names consistent between both apps
- Use appropriate formats (PNG for images, MP3/M4A for audio)
- Consider file sizes for mobile performance
- Update both apps when modifying shared assets