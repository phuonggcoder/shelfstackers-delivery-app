import NotificationList from '@/components/NotificationListUser';
import { useNotifications } from '@/lib/notificationProviderUser';
import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsUserScreen() {
  const { testNotification, debugNotification } = useNotifications();

  const handleNotificationPress = (notification: any) => {
    console.log('User notification pressed:', notification);
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'order_success':
        Alert.alert('Đơn hàng thành công', `Chuyển đến chi tiết đơn hàng #${notification.id}`);
        break;
      case 'order_status_change':
        Alert.alert('Cập nhật đơn hàng', `Chuyển đến theo dõi đơn hàng #${notification.id}`);
        break;
      case 'payment_success':
        Alert.alert('Thanh toán thành công', `Chuyển đến trang thanh toán thành công`);
        break;
      case 'delivery_success':
        Alert.alert('Giao hàng thành công', `Chuyển đến trang giao hàng thành công`);
        break;
      case 'promotion':
        Alert.alert('Khuyến mãi', 'Chuyển đến trang khuyến mãi');
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
      Alert.alert('Thành công', 'Đã gửi thông báo test cho User app');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi thông báo test');
    }
  };

  const handleDebugNotification = async () => {
    try {
      await debugNotification();
      Alert.alert('Debug', 'Đã chạy debug notifications cho User app. Kiểm tra console log.');
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
