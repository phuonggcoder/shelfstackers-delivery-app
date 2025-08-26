import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import NotificationItem from './NotificationItemUser';

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: string;
  read: boolean;
}

interface NotificationListProps {
  onNotificationPress?: (notification: Notification) => void;
}

export default function NotificationList({ onNotificationPress }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    // TODO: Implement loading logic from API or local storage
    // For now, using mock data for User app
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Đơn hàng #12345 đã được đặt thành công',
        body: 'Đơn hàng của bạn đã được xác nhận và đang được xử lý. Tổng tiền: 150,000 VND',
        timestamp: '2 phút trước',
        type: 'order_success',
        read: false,
      },
      {
        id: '2',
        title: 'Đơn hàng #12344 đang được giao',
        body: 'Đơn hàng của bạn đã được shipper nhận và đang trên đường giao hàng',
        timestamp: '1 giờ trước',
        type: 'order_status_change',
        read: true,
      },
      {
        id: '3',
        title: 'Thanh toán thành công',
        body: 'Thanh toán cho đơn hàng #12343 đã được xử lý thành công',
        timestamp: '3 giờ trước',
        type: 'payment_success',
        read: false,
      },
      {
        id: '4',
        title: 'Giao hàng thành công',
        body: 'Đơn hàng #12342 đã được giao thành công. Cảm ơn bạn đã mua sắm!',
        timestamp: '1 ngày trước',
        type: 'delivery_success',
        read: true,
      },
      {
        id: '5',
        title: 'Khuyến mãi mới',
        body: 'Giảm 20% cho tất cả sản phẩm điện tử. Áp dụng từ hôm nay đến hết tuần!',
        timestamp: '2 ngày trước',
        type: 'promotion',
        read: true,
      },
      {
        id: '6',
        title: 'Thông báo hệ thống',
        body: 'Hệ thống sẽ bảo trì từ 02:00 - 04:00 ngày mai. Vui lòng lưu ý.',
        timestamp: '3 ngày trước',
        type: 'admin_notification',
        read: true,
      },
    ];

    setNotifications(mockNotifications);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    // Call parent handler
    if (onNotificationPress) {
      onNotificationPress(notification);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationItem 
      notification={item}
      onPress={() => handleNotificationPress(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Không có thông báo nào</Text>
    </View>
  );

  return (
    <FlatList
      data={notifications}
      renderItem={renderNotification}
      keyExtractor={(item) => item.id}
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007AFF']}
          tintColor="#007AFF"
        />
      }
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
