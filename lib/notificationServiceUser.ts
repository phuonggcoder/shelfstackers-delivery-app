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
  // Channel for orders
  await notifee.createChannel({
    id: 'orders',
    name: 'Đơn hàng',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    vibrationPattern: [300, 500],
    lights: [AndroidColor.BLUE, 300, 600],
  });

  // Channel for payments
  await notifee.createChannel({
    id: 'payments',
    name: 'Thanh toán',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  // Channel for delivery
  await notifee.createChannel({
    id: 'delivery',
    name: 'Giao hàng',
    importance: AndroidImportance.DEFAULT,
    sound: 'default',
  });

  // Channel for promotions
  await notifee.createChannel({
    id: 'promotions',
    name: 'Khuyến mãi',
    importance: AndroidImportance.DEFAULT,
    sound: 'default',
  });

  // Channel for general notifications
  await notifee.createChannel({
    id: 'general',
    name: 'Thông báo chung',
    importance: AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

// Display notification using Notifee
export async function displayNotification(remoteMessage: any) {
  const { notification, data } = remoteMessage;
  
  // Determine channel based on notification type
  let channelId = 'general';
  
  if (data?.type === 'order_success' || data?.type === 'order_status_change') {
    channelId = 'orders';
  } else if (data?.type === 'payment_success' || data?.type === 'payment_failed') {
    channelId = 'payments';
  } else if (data?.type === 'delivery_success' || data?.type === 'delivery_failed') {
    channelId = 'delivery';
  } else if (data?.type === 'promotion') {
    channelId = 'promotions';
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
    case 'order_success':
      // Navigate to order details
      // navigation.navigate('OrderDetails', { 
      //   orderId: data.order_id 
      // });
      console.log('Navigate to order details:', data.order_id);
      break;
      
    case 'order_status_change':
      // Navigate to order tracking
      // navigation.navigate('OrderTracking', { 
      //   orderId: data.order_id 
      // });
      console.log('Navigate to order tracking:', data.order_id);
      break;
      
    case 'payment_success':
      // Navigate to payment success
      // navigation.navigate('PaymentSuccess', { 
      //   orderId: data.order_id 
      // });
      console.log('Navigate to payment success:', data.order_id);
      break;
      
    case 'delivery_success':
      // Navigate to delivery success
      // navigation.navigate('DeliverySuccess', { 
      //   orderId: data.order_id 
      // });
      console.log('Navigate to delivery success:', data.order_id);
      break;
      
    case 'promotion':
      // Navigate to promotions
      // navigation.navigate('Promotions');
      console.log('Navigate to promotions');
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
    body: 'This is a test notification for User app',
    android: {
      channelId: 'general',
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
