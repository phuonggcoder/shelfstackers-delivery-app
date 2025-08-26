import NotificationList from '@/components/NotificationList';
import { useNotifications } from '@/lib/notificationProvider';
import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const { testNotification, debugNotification } = useNotifications();

  const handleNotificationPress = (notification: any) => {
    console.log('Notification pressed:', notification);
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'awaiting_pickup':
        Alert.alert('Đơn hàng mới', `Chuyển đến đơn hàng #${notification.id}`);
        break;
      case 'delivery_success':
        Alert.alert('Giao hàng thành công', 'Chuyển đến danh sách đơn hàng đã hoàn thành');
        break;
      case 'rating_received':
        Alert.alert('Đánh giá mới', 'Chuyển đến trang đánh giá');
        break;
      case 'admin_notification':
        Alert.alert('Thông báo hệ thống', notification.body);
        break;
      default:
        Alert.alert('Thông báo', notification.body);
    }
  };

  const handleTestNotification = async () => {
    try {
      await testNotification();
      Alert.alert('Thành công', 'Đã gửi thông báo test');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi thông báo test');
    }
  };

  const handleDebugNotification = async () => {
    try {
      await debugNotification();
      Alert.alert('Debug', 'Đã chạy debug notifications. Kiểm tra console log.');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chạy debug notifications');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <NotificationList onNotificationPress={handleNotificationPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
