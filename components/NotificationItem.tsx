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
      case 'awaiting_pickup':
        return '#FF6B6B';
      case 'delivery_success':
        return '#4ECDC4';
      case 'rating_received':
        return '#45B7D1';
      case 'admin_notification':
        return '#FFA726';
      default:
        return '#9E9E9E';
    }
  };

  const getTypeText = () => {
    switch (type) {
      case 'awaiting_pickup':
        return 'Đơn hàng mới';
      case 'delivery_success':
        return 'Giao hàng thành công';
      case 'rating_received':
        return 'Đánh giá mới';
      case 'admin_notification':
        return 'Thông báo hệ thống';
      default:
        return 'Thông báo';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, !read && styles.unread]} 
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <View style={[styles.typeIndicator, { backgroundColor: getTypeColor() }]} />
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
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
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
