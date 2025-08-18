Shipper map setup

This project includes a `/(tabs)/shipper/map.tsx` screen that attempts to show Google Maps directions using `react-native-maps` and `react-native-maps-directions`.

To enable directions on device/emulator:

1. Install native map packages and rebuild the native app (required for Android/iOS):

   npm install react-native-maps react-native-maps-directions

   Then run:

   npx expo prebuild --platform android
   npx expo run:android

2. Set your Google Maps API key as an environment variable exposed to the app. In development with Expo, set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` in your environment or in `app.json` / `app.config.js`.

3. If you cannot rebuild, the map screen will show a helpful message and won't crash the app (it uses dynamic require). For development convenience you can also open directions using the external maps app by replacing the MapView with a link to Google Maps URL.

Notes:
- The current Map screen uses a placeholder for the origin (0,0). To use device location, install and configure `expo-location` and request permission at runtime.
- On Expo Go the native `react-native-maps` module may not be available; use a custom dev client or a full native build for the real map experience.

