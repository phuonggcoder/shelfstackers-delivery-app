import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { shipperApi } from '@/lib/shipperApi';

type Order = any;

const TABS = [
  { key: 'All', label: 'Đơn hàng' },
  { key: 'OutForDelivery', label: 'Đang Giao' },
  { key: 'Delivered', label: 'Hoàn thành' },
  { key: 'Cancelled', label: 'Đã huỷ' }
];

function OrderCard({ item, onOpen, onAccept, onReject }: { item: Order; onOpen: (o: Order) => void; onAccept: (o: Order) => void; onReject: (o: Order) => void; }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onOpen(item)}>
      <View style={styles.rowBetween}>
        <ThemedText type="defaultSemiBold" style={styles.orderId}>#{item.order_id || item._id}</ThemedText>
        <ThemedText style={styles.total}>{(item.total || 0).toLocaleString('vi-VN')}đ</ThemedText>
      </View>

      <View style={{ marginTop: 8 }}>
        <ThemedText>{item.items && item.items.length > 0 ? `${item.items[0].name}` : ''}</ThemedText>
        <ThemedText style={{ marginTop: 6, color: '#666' }}>{item.recipient || item.address || ''} || {item.phone || ''}</ThemedText>
        <ThemedText style={{ marginTop: 6, color: '#999', fontSize: 12 }}>{item.address || ''}</ThemedText>
      </View>

      <View style={styles.actionsRow}>
        {item.shipper_ack === 'Pending' && item.order_status === 'AwaitingPickup' ? (
          <>
            <TouchableOpacity style={styles.accept} onPress={() => onAccept(item)}>
              <ThemedText style={{ color: 'white' }}>Chấp nhận</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reject} onPress={() => onReject(item)}>
              <ThemedText style={{ color: 'white' }}>Từ chối</ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <ThemedText style={{ color: '#4caf50' }}>{item.order_status}</ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ShipperOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    if (tab === 'All') return orders;
    return orders.filter(o => {
      if (tab === 'OutForDelivery') return o.order_status === 'OutForDelivery' || o.order_status === 'AwaitingPickup' || o.order_status === 'OutForDelivery';
      return o.order_status === tab;
    });
  }, [orders, tab]);

  const fetchOrders = async () => {
    setRefreshing(true);
    try {
      const res = await shipperApi.getOrders();
      // response may be { orders, total } or an array
      let list: any[] = [];
      if (!res) list = [];
      else if (Array.isArray(res)) list = res;
      else if (res.orders) list = res.orders;
      else if (res.data && Array.isArray(res.data)) list = res.data;
      else list = res.orders || res.data || [];

      setOrders(list);
    } catch (err: any) {
      console.warn('Failed to load shipper orders', err?.message || err);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchOrders();
  };

  const handleAccept = async (o: Order) => {
    // optimistic UI update
    setOrders(prev => prev.map(p => (p._id === o._id ? { ...p, shipper_ack: 'Accepted', order_status: 'OutForDelivery' } : p)));
    try {
      await shipperApi.acceptOrder(o._id || o.order_id);
    } catch (err: any) {
      console.warn('Accept order failed', err?.message || err);
      // revert
      setOrders(prev => prev.map(p => (p._id === o._id ? { ...p, shipper_ack: 'Pending', order_status: o.order_status } : p)));
      alert(err?.message || 'Không thể chấp nhận đơn');
    }
  };

  const handleReject = async (o: Order) => {
    setOrders(prev => prev.map(p => (p._id === o._id ? { ...p, shipper_ack: 'Rejected' } : p)));
    try {
      await shipperApi.rejectOrder(o._id || o.order_id);
    } catch (err: any) {
      console.warn('Reject order failed', err?.message || err);
      // revert
      setOrders(prev => prev.map(p => (p._id === o._id ? { ...p, shipper_ack: 'Pending' } : p)));
      alert(err?.message || 'Không thể từ chối đơn');
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ShelfStacker Phan Huy Ích</Text>
        <Text style={styles.headerSub}>403 Phan Huy Ích, Phường 14, Quận Gò Vấp, Hồ Chí Minh</Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[styles.tab, tab === t.key && styles.tabActive]} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => (i._id || Math.random()).toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <OrderCard
            item={item}
            onOpen={(o) => router.push(`./order/${o._id || ''}`)}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={() => (
          <View style={styles.empty}><Text>Không có đơn hàng</Text></View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontWeight: '700', fontSize: 16, color: '#111' },
  headerSub: { color: '#666', marginTop: 4, fontSize: 12 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 8, justifyContent: 'space-between' },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#4CAF50' },
  tabText: { color: '#777' },
  tabTextActive: { color: '#4CAF50', fontWeight: '700' },
  card: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e5e5', marginBottom: 12, backgroundColor: '#fff' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { color: '#9C27B0' },
  total: { color: '#2E7D32', fontWeight: '700' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
  accept: { backgroundColor: '#2E7D32', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  reject: { backgroundColor: '#C62828', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  empty: { padding: 24, alignItems: 'center' },
});
