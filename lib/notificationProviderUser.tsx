import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
    createNotificationChannels,
    debugNotifications,
    getFCMToken,
    requestUserPermission,
    saveTokenToBackend,
    setupEventHandlers,
    setupFirebaseHandlers,
    testLocalNotification
} from './notificationServiceUser';

interface NotificationContextType {
  notificationCount: number;
  testNotification: () => Promise<void>;
  debugNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      console.log('Setting up User notifications...');

      // 1. Request permissions
      const hasPermission = await requestUserPermission();
      if (!hasPermission) {
        console.log('Notification permission denied');
        return;
      }

      // 2. Create notification channels (Android)
      if (Platform.OS === 'android') {
        await createNotificationChannels();
        console.log('User notification channels created');
      }

      // 3. Setup event handlers
      setupEventHandlers();
      console.log('User event handlers setup complete');

      // 4. Get and save FCM token
      const token = await getFCMToken();
      if (token) {
        // TODO: Get user token from auth context
        await saveTokenToBackend(token);
        console.log('User FCM token saved to backend');
      }

      // 5. Setup Firebase message handlers
      setupFirebaseHandlers();
      console.log('User Firebase handlers setup complete');

      console.log('User notification setup completed successfully');

    } catch (error) {
      console.error('Error setting up User notifications:', error);
    }
  };

  const testNotification = async () => {
    try {
      await testLocalNotification();
      console.log('User test notification sent');
    } catch (error) {
      console.error('Error sending User test notification:', error);
    }
  };

  const debugNotification = async () => {
    try {
      await debugNotifications.checkPermissions();
      await debugNotifications.checkChannels();
      await debugNotifications.checkFCMToken();
    } catch (error) {
      console.error('Error debugging User notifications:', error);
    }
  };

  const value: NotificationContextType = {
    notificationCount,
    testNotification,
    debugNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
