import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    body: string;
    timestamp: string;
    type: string;
    read: boolean;
  };
  onPress: () => void;
}

export default function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { title, body, timestamp, type, read } = notification;

  const getTypeColor = () => {
    switch (type) {
      case 'order_success':
      case 'payment_success':
      case 'delivery_success':
        return '#4CAF50';
      case 'order_status_change':
        return '#2196F3';
      case 'payment_failed':
      case 'delivery_failed':
        return '#F44336';
      case 'promotion':
        return '#FF9800';
      case 'admin_notification':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  const getTypeText = () => {
    switch (type) {
      case 'order_success':
        return 'Đơn hàng thành công';
      case 'order_status_change':
        return 'Cập nhật đơn hàng';
      case 'payment_success':
        return 'Thanh toán thành công';
      case 'payment_failed':
        return 'Thanh toán thất bại';
      case 'delivery_success':
        return 'Giao hàng thành công';
      case 'delivery_failed':
        return 'Giao hàng thất bại';
      case 'promotion':
        return 'Khuyến mãi';
      case 'admin_notification':
        return 'Thông báo hệ thống';
      default:
        return 'Thông báo';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'order_success':
      case 'payment_success':
      case 'delivery_success':
        return '✓';
      case 'order_status_change':
        return '🔄';
      case 'payment_failed':
      case 'delivery_failed':
        return '✗';
      case 'promotion':
        return '🎁';
      case 'admin_notification':
        return '📢';
      default:
        return '📱';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, !read && styles.unread]} 
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <View style={[styles.iconContainer, { backgroundColor: getTypeColor() }]}>
            <Text style={styles.iconText}>{getIcon()}</Text>
          </View>
          <Text style={styles.typeText}>{getTypeText()}</Text>
        </View>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body} numberOfLines={2}>{body}</Text>
      
      {!read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unread: {
    backgroundColor: '#F8F9FA',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  typeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
});
