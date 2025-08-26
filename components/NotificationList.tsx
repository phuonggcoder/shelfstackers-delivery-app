import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import NotificationItem from './NotificationItem';

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
    // For now, using mock data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Đơn hàng mới #12345',
        body: 'Bạn có đơn hàng mới cần xử lý tại 123 Đường ABC, Quận 1, TP.HCM',
        timestamp: '2 phút trước',
        type: 'awaiting_pickup',
        read: false,
      },
      {
        id: '2',
        title: 'Giao hàng thành công #12344',
        body: 'Đơn hàng #12344 đã được giao thành công. Khách hàng đã xác nhận nhận hàng.',
        timestamp: '1 giờ trước',
        type: 'delivery_success',
        read: true,
      },
      {
        id: '3',
        title: 'Đánh giá mới từ khách hàng',
        body: 'Bạn nhận được đánh giá 5 sao từ khách hàng cho đơn hàng #12343',
        timestamp: '3 giờ trước',
        type: 'rating_received',
        read: false,
      },
      {
        id: '4',
        title: 'Thông báo hệ thống',
        body: 'Hệ thống sẽ bảo trì từ 02:00 - 04:00 ngày mai. Vui lòng lưu ý.',
        timestamp: '1 ngày trước',
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
