# Notifications Setup Guide

## 📱 Tổng quan

Hướng dẫn setup Notifee cho Shipper Frontend app để nhận notifications từ Firebase Type 2 (shelfstacker-delivery).

## ✅ Đã hoàn thành

### 1. Dependencies đã cài đặt
- ✅ `@notifee/react-native`
- ✅ `@react-native-firebase/app`
- ✅ `@react-native-firebase/messaging`

### 2. Files đã tạo
- ✅ `lib/firebase.ts` - Firebase configuration
- ✅ `lib/notificationService.ts` - Notification service
- ✅ `lib/notificationProvider.tsx` - Notification provider
- ✅ `components/NotificationBadge.tsx` - Badge component
- ✅ `components/NotificationItem.tsx` - Notification item
- ✅ `components/NotificationList.tsx` - Notification list
- ✅ `app/(tabs)/notifications.tsx` - Notifications screen

### 3. Android Configuration
- ✅ Updated `android/app/build.gradle` with Firebase dependencies
- ✅ Updated `android/app/src/main/AndroidManifest.xml` with permissions
- ✅ Added Google services plugin to `android/build.gradle`
- ✅ Added plugin management to `android/settings.gradle`

### 4. App Integration
- ✅ Added NotificationProvider to `app/_layout.tsx`
- ✅ Added notifications tab to bottom navigation
- ✅ Created notifications screen

## 🔧 Cấu hình cần thiết

### 1. Firebase Configuration
Cần cập nhật Firebase config trong `lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "shelfstacker-delivery.firebaseapp.com",
  projectId: "shelfstacker-delivery",
  storageBucket: "shelfstacker-delivery.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. Backend URL
Cần cập nhật backend URL trong `lib/firebase.ts`:

```typescript
const response = await fetch('YOUR_ACTUAL_BACKEND_URL/api/shipper/update-token', {
  // ...
});
```

### 3. Google Services File
Cần thêm `google-services.json` vào `android/app/` directory.

## 🧪 Testing

### 1. Test Local Notification
```typescript
import { testLocalNotification } from '@/lib/notificationService';

// Test function
await testLocalNotification();
```

### 2. Test FCM Token
```typescript
import { getFCMToken } from '@/lib/firebase';

// Get current FCM token
const token = await getFCMToken();
console.log('FCM Token:', token);
```

### 3. Debug Notifications
```typescript
import { debugNotifications } from '@/lib/notificationService';

// Check permissions
await debugNotifications.checkPermissions();

// Check channels
await debugNotifications.checkChannels();

// Check FCM token
await debugNotifications.checkFCMToken();
```

## 📱 Notification Types

### 1. Awaiting Pickup
- **Type**: `awaiting_pickup`
- **Channel**: `new_orders`
- **Importance**: HIGH
- **Sound**: Default
- **Vibration**: Yes
- **Lights**: Red

### 2. Delivery Success
- **Type**: `delivery_success`
- **Channel**: `delivery_success`
- **Importance**: DEFAULT
- **Sound**: Default

### 3. Rating Received
- **Type**: `rating_received`
- **Channel**: `ratings`
- **Importance**: DEFAULT
- **Sound**: Default

### 4. Admin Notification
- **Type**: `admin_notification`
- **Channel**: `urgent`
- **Importance**: HIGH
- **Sound**: Default
- **Vibration**: Yes
- **Lights**: Red

## 🔄 Background Message Handler

Background messages được xử lý tự động thông qua:

```typescript
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message:', remoteMessage);
  await displayNotification(remoteMessage);
});
```

## 🎯 Deep Linking

Notifications hỗ trợ deep linking thông qua data payload:

```typescript
// Example notification data
{
  type: 'awaiting_pickup',
  order_id: '12345',
  // ... other data
}
```

## 🐛 Troubleshooting

### 1. Notification không hiển thị
- Kiểm tra permissions
- Kiểm tra notification channels (Android)
- Kiểm tra FCM token
- Kiểm tra Firebase configuration

### 2. Background notification không hoạt động
- Kiểm tra background modes (iOS)
- Kiểm tra service configuration (Android)
- Kiểm tra battery optimization

### 3. Deep linking không hoạt động
- Kiểm tra navigation setup
- Kiểm tra data trong notification
- Kiểm tra press handler

## 📊 Analytics & Monitoring

### 1. Notification Events
```typescript
import { trackNotificationEvent } from '@/lib/notificationService';

// Track events
trackNotificationEvent('notification_received', {
  type: 'awaiting_pickup',
  order_id: data.order_id
});

trackNotificationEvent('notification_opened', {
  type: 'awaiting_pickup',
  order_id: data.order_id
});
```

### 2. Error Tracking
```typescript
import { trackNotificationError } from '@/lib/notificationService';

// Track errors
trackNotificationError(error, 'notification_setup');
```

## 🚀 Production Checklist

- [ ] Firebase configuration đúng project `shelfstacker-delivery`
- [ ] Notification permissions được request
- [ ] Notification channels được tạo (Android)
- [ ] FCM token được lưu vào backend
- [ ] Event handlers được setup
- [ ] Deep linking hoạt động
- [ ] Background notifications hoạt động
- [ ] Error handling được implement
- [ ] Analytics tracking được setup
- [ ] Testing với real devices

## 📚 Resources

- [Notifee Documentation](https://notifee.app/)
- [React Native Firebase](https://rnfirebase.io/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Android Notification Channels](https://developer.android.com/guide/topics/ui/notifiers/notifications#ManageChannels)
- [iOS Push Notifications](https://developer.apple.com/documentation/usernotifications)

---

**Lưu ý**: Đảm bảo sử dụng Firebase Type 2 (shelfstacker-delivery) cho tất cả notifications trong Shipper app để tách biệt với User app (Firebase Type 1).
