# LínguaMedia Frontend

React Native mobile application for voice-to-voice translation.

## Prerequisites

- Node.js (v20+)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Backend API running (see `../backend/README.md`)

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure API endpoint**:
Edit `services/api.ts` and update `API_BASE_URL` to your backend URL:
```typescript
const API_BASE_URL = 'http://YOUR_BACKEND_IP:8000';
```

For local development:
- iOS Simulator: `http://localhost:8000`
- Android Emulator: `http://10.0.2.2:8000`
- Physical device: `http://YOUR_COMPUTER_IP:8000`

## Running the App

```bash
# Start Expo development server
npx expo start

# Then press:
# - 'i' for iOS Simulator
# - 'a' for Android Emulator
# - Scan QR code with Expo Go app on physical device
```

## Features

- ✅ Voice-to-text translation (via backend API)
- ✅ Text-to-speech output (Expo Speech)
- ✅ Manual text input option
- ✅ Translation history (AsyncStorage)
- ✅ Identical UI to web version
- ✅ Support for English and Changana

## Components

- **Main Screen**: Translation interface
- **Text Input Modal**: Manual text entry
- **History Modal**: View past translations
- **Language Selector**: Choose target language

## Services

- **api.ts**: Backend communication
- **speech.ts**: Text-to-speech functionality
- **storage.ts**: Local history persistence

## Tech Stack

- React Native + Expo
- TypeScript
- expo-speech (TTS)
- AsyncStorage (persistence)
- axios (HTTP client)
- react-native-modal
- expo-linear-gradient

## Notes

- Voice recognition requires additional setup (not included in basic Expo)
- For production, implement proper error handling and offline support
- Update `API_BASE_URL` for production deployment

## Troubleshooting

**Can't connect to backend:**
- Ensure backend is running
- Check IP address configuration
- Verify firewall settings
- Use correct URL for your platform (localhost/10.0.2.2/device IP)

**TTS not working:**
- Check device volume
- Ensure device is not in silent mode
- Verify expo-speech installation
