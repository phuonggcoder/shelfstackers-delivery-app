import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/lib/auth';
import { shipperApi } from '@/lib/shipperApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TABS = [
  { key: 'All', label: 'Đơn hàng' },
  { key: 'OutForDelivery', label: 'Đang giao' },
  { key: 'Delivered', label: 'Hoàn thành' },
  { key: 'Cancelled', label: 'Đã huỷ' }
];

export default function ShipperOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { refreshUser, user, token } = useAuth();
  const [debugVisible, setDebugVisible] = useState(false);
  const [rawDebug, setRawDebug] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [usingCache, setUsingCache] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);
  const CACHE_KEY = 'shipper_orders_cache_v1';

  const markUpdating = useCallback((id: string) => {
    setUpdatingIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const unmarkUpdating = useCallback((id: string) => {
    setUpdatingIds(prev => prev.filter(x => x !== id));
  }, []);

  const loadCachedOrders = useCallback(async () => {
    try {
      const j = await AsyncStorage.getItem(CACHE_KEY);
      if (!j) return;
      const list = JSON.parse(j);
      if (Array.isArray(list)) {
        setOrders(list);
        setUsingCache(true);
      }
    } catch (e) {
      console.warn('Failed to load cached orders', e);
    }
  }, []);

  const saveCachedOrders = useCallback(async (list: any[]) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save cached orders', e);
    }
  }, []);

  const fetchOrders = useCallback(async (maxAttempts = 3) => {
    setRefreshing(true);
    setRawError(null);
    let lastErr: any = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[shipper-orders] fetchOrders attempt ${attempt}`);
  const res = await shipperApi.getOrders();
        setRawDebug(JSON.stringify(res, null, 2));
        setRawError(null);
        let list: any[] = [];
        if (!res) list = [];
        else if (Array.isArray(res)) list = res;
        else if (res.orders) list = res.orders;
        else if (res.data && Array.isArray(res.data)) list = res.data;
        else list = res.orders || res.data || [];
        setOrders(list);
  // persist cache
  try { await saveCachedOrders(list); } catch {}
        lastErr = null;
        break;
      } catch (err: any) {
        console.warn('[shipper-orders] fetchOrders failed attempt', attempt, err?.message || err);
        lastErr = err;
        // exponential backoff before retrying
        if (attempt < maxAttempts) {
          const delay = 500 * Math.pow(2, attempt - 1);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      }
    }

    if (lastErr) {
      const msg = lastErr?.message || String(lastErr);
      setRawError(msg);
      console.error('[shipper-orders] all fetch attempts failed:', msg);
      Alert.alert('Lỗi tải đơn hàng', msg || 'Không thể tải đơn hàng sau nhiều lần thử.');
    }

    setRefreshing(false);
  }, [saveCachedOrders]);

  useEffect(() => {
    // Try refreshing user profile (in case admin approved via email) before loading orders
    (async () => {
      // 1) load cache so UI is responsive
      await loadCachedOrders();
      // 2) then try refresh and fetch fresh data
      try {
        await refreshUser();
      } catch {
        // ignore
      }
      // fetch fresh orders (this will overwrite cache if successful)
      fetchOrders();
    })();
  }, [refreshUser, fetchOrders, loadCachedOrders]);

  const filtered = useMemo(() => {
    if (tab === 'All') return orders;
    return orders.filter(o => {
      if (tab === 'OutForDelivery') return o.order_status === 'OutForDelivery' || o.order_status === 'AwaitingPickup';
      return o.order_status === tab;
    });
  }, [orders, tab]);

  const promptUpdateStatus = (order: any) => {
    const options = [
      { text: 'Đơn hàng (Pending)', value: 'Pending' },
      { text: 'Đang giao', value: 'OutForDelivery' },
      { text: 'Hoàn thành', value: 'Delivered' },
      { text: 'Đã huỷ', value: 'Cancelled' },
      { text: 'Huỷ', style: 'cancel' }
    ];

    Alert.alert('Cập nhật trạng thái', `Chọn trạng thái cho ${order.order_id || order._id}`, options.map(o => ({
      text: o.text,
      style: o.style as any,
      onPress: async () => {
        if (!o.value) return;
        // require confirmation when marking Delivered
        if (o.value === 'Delivered') {
          Alert.alert('Xác nhận', 'Bạn có chắc muốn đánh dấu đơn này là Hoàn thành?', [
            { text: 'Huỷ', style: 'cancel' },
            { text: 'Có', onPress: async () => await updateStatus(order, o.value) }
          ]);
          return;
        }
        await updateStatus(order, o.value);
      }
    })));
  };

  const updateStatus = async (order: any, newStatus: string) => {
    const id = order._id || order.order_id;
    if (!id) {
      Alert.alert('Lỗi', 'Không xác định được ID đơn hàng');
      return;
    }
    if (updatingIds.includes(id)) {
      // already updating
      return;
    }
    markUpdating(id);
    const orig = { ...order };
    // optimistic
    setOrders(prev => prev.map(p => (p._id === order._id ? { ...p, order_status: newStatus } : p)));
    try {
      await shipperApi.updateStatus(id, { order_status: newStatus });
      Alert.alert('Thành công', `Đã cập nhật trạng thái: ${newStatus}`);
    } catch (err: any) {
      console.warn('Update status failed', err?.message || err);
      setOrders(prev => prev.map(p => (p._id === order._id ? orig : p)));
      Alert.alert('Lỗi', err?.message || 'Không thể cập nhật trạng thái');
    } finally {
      unmarkUpdating(id);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const id = item._id || item.order_id;
    const loading = id ? updatingIds.includes(id) : false;
    return (
    <TouchableOpacity disabled={loading} style={styles.card} onPress={() => router.push(`/(tabs)/shipper/order/${item._id || item.order_id}`)} onLongPress={() => promptUpdateStatus(item)}>
      <View style={styles.rowBetween}>
        <ThemedText type="defaultSemiBold" style={styles.orderId}>#{item.order_id || item._id}</ThemedText>
        <ThemedText style={styles.total}>{(item.total_amount || item.total || 0).toLocaleString('vi-VN')}đ</ThemedText>
      </View>

      <View style={{ marginTop: 8 }}>
        <ThemedText>{item.order_items && item.order_items.length > 0 ? `${item.order_items[0].title || item.order_items[0].name || ''}` : ''}</ThemedText>
        <ThemedText style={{ marginTop: 6, color: '#666' }}>{item.shipping_address_snapshot?.receiver_name || item.recipient || ''} | {item.shipping_address_snapshot?.phone_number || item.phone || ''}</ThemedText>
        <ThemedText style={{ marginTop: 6, color: '#999', fontSize: 12 }}>{item.shipping_address_snapshot?.address_detail || item.address || ''}</ThemedText>
      </View>

      <View style={styles.actionsRow}>
        {loading ? (
          <ActivityIndicator size="small" color="#4CAF50" />
        ) : (
          <ThemedText style={{ color: item.order_status === 'Delivered' ? '#4caf50' : '#777' }}>{item.order_status}</ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ShelfStacker - Đơn hàng Shipper</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.headerSub}>Nhấn giữ đơn để cập nhật trạng thái. Chạm để xem chi tiết.</Text>
            <TouchableOpacity onPress={async () => { await refreshUser(); fetchOrders(); }} style={{ padding: 6 }}>
              <Text style={{ color: '#4CAF50', fontWeight: '600' }}>Làm mới</Text>
            </TouchableOpacity>
          </View>
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
        keyExtractor={(i) => (i._id || i.order_id || Math.random()).toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            {refreshing ? (
              <View style={{ alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={{ marginTop: 8 }}>Đang tải đơn hàng…</Text>
              </View>
            ) : (
              <>
                <Text>Không có đơn hàng</Text>
                <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setDebugVisible(v => !v)}>
                  <Text style={{ color: '#4CAF50' }}>{debugVisible ? 'Ẩn debug' : 'Hiện debug'}</Text>
                </TouchableOpacity>
                {rawError ? (
                  <TouchableOpacity onPress={() => fetchOrders()} style={{ marginTop: 8 }}>
                    <Text style={{ color: '#1976D2' }}>Thử lại</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}

            {debugVisible ? (
              <View style={{ marginTop: 12, backgroundColor: '#f7f7f7', padding: 8, borderRadius: 6 }}>
                <Text style={{ fontWeight: '700', marginBottom: 6 }}>Debug thông tin</Text>
                <Text>Token: {token ? `${String(token).slice(0, 8)}...` : 'no token'}</Text>
                <Text style={{ marginTop: 6 }}>User: {user ? JSON.stringify(user) : 'no user'}</Text>
                <Text style={{ marginTop: 6, fontWeight: '700' }}>Raw response:</Text>
                <Text style={{ fontFamily: 'monospace', fontSize: 11 }}>{rawDebug || '—'}</Text>
                {rawError ? (
                  <Text style={{ marginTop: 6, color: '#c62828' }}>Error: {rawError}</Text>
                ) : null}
                {usingCache ? <Text style={{ marginTop: 6, color: '#999' }}>Hiển thị dữ liệu cache</Text> : null}
              </View>
            ) : null}
          </View>
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
  empty: { padding: 24, alignItems: 'center' },
});
