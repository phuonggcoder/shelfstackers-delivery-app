import { initializeApp } from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

// Firebase Type 2 config (shelfstacker-delivery)
const firebaseConfig = {
  apiKey: "AIzaSyBxVxVxVxVxVxVxVxVxVxVxVxVxVxVxVx",
  authDomain: "shelfstacker-delivery.firebaseapp.com",
  projectId: "shelfstacker-delivery",
  storageBucket: "shelfstacker-delivery.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:android:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get FCM token
export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Save token to backend
export async function saveTokenToBackend(token: string, userToken?: string) {
  try {
    const response = await fetch('https://server-shelf-stacker-w1ds.onrender.com/api/shipper/update-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': userToken ? `Bearer ${userToken}` : ''
      },
      body: JSON.stringify({
        device_token: token,
        platform: Platform.OS
      })
    });
    
    if (response.ok) {
      console.log('Token saved to backend successfully');
      return true;
    } else {
      console.error('Failed to save token to backend');
      return false;
    }
  } catch (error) {
    console.error('Error saving token to backend:', error);
    return false;
  }
}

// Test FCM token
export async function testFCMToken() {
  const token = await messaging().getToken();
  console.log('Current FCM Token:', token);
  
  // Send test notification from backend
  try {
    await fetch('YOUR_BACKEND_URL/api/v1/shipper-notifications/test-awaiting-pickup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${'adminToken'}`
      },
      body: JSON.stringify({
        shipper_id: 'test_shipper_id'
      })
    });
    console.log('Test notification sent');
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
}

export default app;
