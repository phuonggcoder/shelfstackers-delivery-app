import notifee, {
    AndroidColor,
    AndroidImportance,
    AndroidStyle,
    AuthorizationStatus,
    EventType
} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

// Request notification permissions
export async function requestUserPermission() {
  const authStatus = await notifee.requestPermission();
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return true;
  }
  
  return false;
}

// Create notification channels for Android
export async function createNotificationChannels() {
  // Channel for new orders
  await notifee.createChannel({
    id: 'new_orders',
    name: 'Đơn hàng mới',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    vibrationPattern: [300, 500],
    lights: [AndroidColor.RED, 300, 600],
  });

  // Channel for successful delivery
  await notifee.createChannel({
    id: 'delivery_success',
    name: 'Giao hàng thành công',
    importance: AndroidImportance.DEFAULT,
    sound: 'default',
  });

  // Channel for ratings
  await notifee.createChannel({
    id: 'ratings',
    name: 'Đánh giá từ khách hàng',
    importance: AndroidImportance.DEFAULT,
    sound: 'default',
  });

  // Channel for urgent notifications
  await notifee.createChannel({
    id: 'urgent',
    name: 'Thông báo khẩn cấp',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    lights: [AndroidColor.RED, 300, 600],
  });

  // Default channel
  await notifee.createChannel({
    id: 'default',
    name: 'Thông báo chung',
    importance: AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

// Display notification using Notifee
export async function displayNotification(remoteMessage: any) {
  const { notification, data } = remoteMessage;
  
  // Determine channel based on notification type
  let channelId = 'default';
  
  if (data?.type === 'awaiting_pickup') {
    channelId = 'new_orders';
  } else if (data?.type === 'delivery_success') {
    channelId = 'delivery_success';
  } else if (data?.type === 'rating_received') {
    channelId = 'ratings';
  } else if (data?.type === 'admin_notification') {
    channelId = 'urgent';
  }

  // Create notification
  await notifee.displayNotification({
    title: notification?.title || 'Thông báo mới',
    body: notification?.body || '',
    android: {
      channelId,
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
      },
      // Big text style for long notifications
      style: {
        type: AndroidStyle.BIGTEXT,
        text: notification?.body || '',
      },
      // Add actions if needed
      actions: [
        {
          title: 'Xem chi tiết',
          pressAction: {
            id: 'view_details',
          },
        },
        {
          title: 'Đóng',
          pressAction: {
            id: 'dismiss',
          },
        },
      ],
    },
    ios: {
      foregroundPresentationOptions: {
        badge: true,
        sound: true,
        banner: true,
        list: true,
      },
    },
    data: data || {},
  });
}

// Handle notification press
export function handleNotificationPress(notification: any) {
  const { data } = notification;
  
  if (!data) return;

  switch (data.type) {
    case 'awaiting_pickup':
      // Navigate to order details
      // navigation.navigate('OrderDetails', { 
      //   orderId: data.order_id 
      // });
      console.log('Navigate to order details:', data.order_id);
      break;
      
    case 'delivery_success':
      // Navigate to completed orders
      // navigation.navigate('CompletedOrders');
      console.log('Navigate to completed orders');
      break;
      
    case 'rating_received':
      // Navigate to ratings
      // navigation.navigate('Ratings');
      console.log('Navigate to ratings');
      break;
      
    case 'admin_notification':
      // Navigate to notifications
      // navigation.navigate('Notifications');
      console.log('Navigate to notifications');
      break;
      
    default:
      // Default navigation
      // navigation.navigate('Home');
      console.log('Navigate to home');
  }
}

// Setup Firebase message handlers
export function setupFirebaseHandlers() {
  // Foreground messages
  messaging().onMessage(async remoteMessage => {
    console.log('Foreground message:', remoteMessage);
    await displayNotification(remoteMessage);
  });

  // Background messages
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message:', remoteMessage);
    await displayNotification(remoteMessage);
  });
}

// Setup event handlers
export function setupEventHandlers() {
  // Foreground events
  notifee.onForegroundEvent(({ type, detail }) => {
    switch (type) {
      case EventType.DELIVERED:
        console.log('Notification delivered:', detail.notification);
        break;
      case EventType.PRESS:
        handleNotificationPress(detail.notification);
        break;
    }
  });

  // Background events
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    switch (type) {
      case EventType.PRESS:
        handleNotificationPress(detail.notification);
        break;
    }
  });
}

// Test local notification
export async function testLocalNotification() {
  await notifee.displayNotification({
    title: 'Test Notification',
    body: 'This is a test notification',
    android: {
      channelId: 'default',
    },
  });
}

// Debug functions
export const debugNotifications = {
  // Check permissions
  checkPermissions: async () => {
    const authStatus = await notifee.getNotificationSettings();
    console.log('Notification settings:', authStatus);
  },
  
  // Check channels
  checkChannels: async () => {
    const channels = await notifee.getNotificationChannels();
    console.log('Notification channels:', channels);
  },
  
  // Check FCM token
  checkFCMToken: async () => {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
  },
  
  // Clear all notifications
  clearAll: async () => {
    await notifee.cancelAllNotifications();
    console.log('All notifications cleared');
  }
};

// Track notification events
export const trackNotificationEvent = (event: string, data: any) => {
  // Send to analytics service
  console.log('Notification event:', event, data);
  // analytics.track(event, {
  //   ...data,
  //   timestamp: new Date().toISOString(),
  //   platform: Platform.OS,
  // });
};

// Error tracking
export const trackNotificationError = (error: any, context: string) => {
  console.error('Notification error:', error);
  
  // Send to error tracking service
  // crashlytics.recordError(error, {
  //   context,
  //   platform: Platform.OS,
  //   timestamp: new Date().toISOString(),
  // });
};
