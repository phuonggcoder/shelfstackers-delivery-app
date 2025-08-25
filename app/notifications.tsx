import { useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [notifications, setNotifications] = React.useState<any[]>([
    { id: 'n1', title: 'Đơn hàng mới', message: 'Bạn có đơn hàng mới cần xử lý', time: '2 phút trước', read: false },
    { id: 'n2', title: 'Cập nhật trạng thái', message: 'Đơn hàng #12345 đã được giao thành công', time: '1 giờ trước', read: true },
    { id: 'n3', title: 'Thông báo hệ thống', message: 'Ứng dụng đã được cập nhật lên phiên bản mới', time: '2 giờ trước', read: true },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, item.read && styles.notificationRead]} 
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, item.read && styles.titleRead]}>{item.title}</Text>
        <Text style={[styles.notificationMessage, item.read && styles.messageRead]}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backChevron}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('navigation.notifications')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Notifications list */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        renderItem={renderNotification}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('notifications.noNotifications')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    height: 56, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backChevron: { fontSize: 20, color: '#222' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  notificationsList: { padding: 16 },
  notificationItem: { 
    backgroundColor: '#fff', 
    padding: 16, 
    marginBottom: 12, 
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  notificationRead: { opacity: 0.7 },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 4 },
  titleRead: { color: '#666' },
  notificationMessage: { fontSize: 14, color: '#666', marginBottom: 8, lineHeight: 20 },
  messageRead: { color: '#999' },
  notificationTime: { fontSize: 12, color: '#999' },
  unreadDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#4A90E2',
    marginLeft: 12
  },
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 60 
  },
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center' }
});
