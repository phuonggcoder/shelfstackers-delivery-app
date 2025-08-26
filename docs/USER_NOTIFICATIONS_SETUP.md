# User Frontend - Notifee Implementation Guide

## 📱 Tổng quan

Hướng dẫn implement Notifee cho User Frontend app để nhận push notifications từ Firebase Type 1 (shelfstacker-project), tích hợp với hệ thống thông báo hiện có.

## ✅ Đã hoàn thành

### 1. Dependencies đã cài đặt
- ✅ `@notifee/react-native`
- ✅ `@react-native-firebase/app`
- ✅ `@react-native-firebase/messaging`

### 2. Files đã tạo
- ✅ `lib/firebaseUser.ts` - Firebase configuration cho User app
- ✅ `lib/notificationServiceUser.ts` - Notification service cho User app
- ✅ `lib/notificationProviderUser.tsx` - Notification provider cho User app
- ✅ `components/NotificationBadgeUser.tsx` - Badge component cho User app
- ✅ `components/NotificationItemUser.tsx` - Notification item cho User app
- ✅ `components/NotificationListUser.tsx` - Notification list cho User app
- ✅ `app/(tabs)/notifications-user.tsx` - Notifications screen cho User app

### 3. Android Configuration
- ✅ Updated `android/app/build.gradle` with Firebase dependencies
- ✅ Updated `android/app/src/main/AndroidManifest.xml` with permissions
- ✅ Added Google services plugin to `android/build.gradle`
- ✅ Added plugin management to `android/settings.gradle`

### 4. App Integration
- ✅ Created User-specific notification components
- ✅ Created User-specific notification service
- ✅ Created User-specific notification provider

## 🔧 Cấu hình cần thiết

### 1. Firebase Configuration
Cần cập nhật Firebase config trong `lib/firebaseUser.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "shelfstacker-project.firebaseapp.com",
  projectId: "shelfstacker-project",
  storageBucket: "shelfstacker-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. Backend URL
Cần cập nhật backend URL trong `lib/firebaseUser.ts`:

```typescript
const response = await fetch('YOUR_ACTUAL_BACKEND_URL/api/users/update-token', {
  // ...
});
```

### 3. Google Services File
Cần thêm `google-services.json` cho Firebase Type 1 vào `android/app/` directory.

## 🧪 Testing

### 1. Test Local Notification
```typescript
import { testLocalNotification } from '@/lib/notificationServiceUser';

// Test function
await testLocalNotification();
```

### 2. Test FCM Token
```typescript
import { getFCMToken } from '@/lib/firebaseUser';

// Get current FCM token
const token = await getFCMToken();
console.log('FCM Token:', token);
```

### 3. Debug Notifications
```typescript
import { debugNotifications } from '@/lib/notificationServiceUser';

// Check permissions
await debugNotifications.checkPermissions();

// Check channels
await debugNotifications.checkChannels();

// Check FCM token
await debugNotifications.checkFCMToken();
```

## 📱 Notification Types cho User App

### 1. Order Success
- **Type**: `order_success`
- **Channel**: `orders`
- **Importance**: HIGH
- **Sound**: Default
- **Vibration**: Yes
- **Lights**: Blue

### 2. Order Status Change
- **Type**: `order_status_change`
- **Channel**: `orders`
- **Importance**: HIGH
- **Sound**: Default
- **Vibration**: Yes
- **Lights**: Blue

### 3. Payment Success
- **Type**: `payment_success`
- **Channel**: `payments`
- **Importance**: HIGH
- **Sound**: Default
- **Vibration**: Yes

### 4. Payment Failed
- **Type**: `payment_failed`
- **Channel**: `payments`
- **Importance**: HIGH
- **Sound**: Default
- **Vibration**: Yes

### 5. Delivery Success
- **Type**: `delivery_success`
- **Channel**: `delivery`
- **Importance**: DEFAULT
- **Sound**: Default

### 6. Delivery Failed
- **Type**: `delivery_failed`
- **Channel**: `delivery`
- **Importance**: DEFAULT
- **Sound**: Default

### 7. Promotion
- **Type**: `promotion`
- **Channel**: `promotions`
- **Importance**: DEFAULT
- **Sound**: Default

### 8. Admin Notification
- **Type**: `admin_notification`
- **Channel**: `general`
- **Importance**: DEFAULT
- **Sound**: Default

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
  type: 'order_success',
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
import { trackNotificationEvent } from '@/lib/notificationServiceUser';

// Track events
trackNotificationEvent('notification_received', {
  type: 'order_success',
  order_id: data.order_id
});

trackNotificationEvent('notification_opened', {
  type: 'order_success',
  order_id: data.order_id
});
```

### 2. Error Tracking
```typescript
import { trackNotificationError } from '@/lib/notificationServiceUser';

// Track errors
trackNotificationError(error, 'notification_setup');
```

## 🚀 Production Checklist

- [ ] Firebase configuration đúng project `shelfstacker-project`
- [ ] Notification permissions được request
- [ ] Notification channels được tạo (Android)
- [ ] FCM token được lưu vào backend
- [ ] Event handlers được setup
- [ ] Deep linking hoạt động
- [ ] Background notifications hoạt động
- [ ] Error handling được implement
- [ ] Analytics tracking được setup
- [ ] Testing với real devices
- [ ] Tích hợp với hệ thống toast hiện có
- [ ] UI components được cập nhật

## 📚 Resources

- [Notifee Documentation](https://notifee.app/)
- [React Native Firebase](https://rnfirebase.io/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Android Notification Channels](https://developer.android.com/guide/topics/ui/notifiers/notifications#ManageChannels)
- [iOS Push Notifications](https://developer.apple.com/documentation/usernotifications)

---

**Lưu ý**: Đảm bảo sử dụng Firebase Type 1 (shelfstacker-project) cho tất cả notifications trong User app để tách biệt với Shipper app (Firebase Type 2).

## 🔄 So sánh với Shipper App

| Feature | User App | Shipper App |
|---------|----------|-------------|
| Firebase Type | Type 1 (shelfstacker-project) | Type 2 (shelfstacker-delivery) |
| Notification Types | order_success, payment_success, delivery_success, promotion | awaiting_pickup, delivery_success, rating_received |
| Channels | orders, payments, delivery, promotions, general | new_orders, delivery_success, ratings, urgent, default |
| Backend Endpoint | `/api/users/update-token` | `/api/shipper/update-token` |
| Test Endpoint | `/api/v1/admin/dynamic-notifications/send` | `/api/v1/shipper-notifications/test-*` |

## 📁 Files để Implement cho App khác

### 1. Core Files
- `lib/firebaseUser.ts` - Firebase configuration cho User app
- `lib/notificationServiceUser.ts` - Notification service cho User app
- `lib/notificationProviderUser.tsx` - Notification provider cho User app
- `components/NotificationBadgeUser.tsx` - Badge component cho User app
- `components/NotificationItemUser.tsx` - Notification item cho User app
- `components/NotificationListUser.tsx` - Notification list cho User app
- `app/(tabs)/notifications-user.tsx` - Notifications screen cho User app

### 2. Configuration Files
- `android/app/build.gradle` - Android dependencies
- `android/app/src/main/AndroidManifest.xml` - Android permissions
- `ios/YourApp/Info.plist` - iOS background modes

### 3. Thay đổi cho Firebase Type 1
```typescript
// firebaseUser.ts - Thay đổi config
const firebaseConfig = {
  // Firebase Type 1 config (user-project)
  apiKey: "your-api-key",
  authDomain: "user-project.firebaseapp.com",
  projectId: "user-project",
  storageBucket: "user-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

Với những file này, bạn có thể implement Notifee cho User app với Firebase Type 1! 🚀
