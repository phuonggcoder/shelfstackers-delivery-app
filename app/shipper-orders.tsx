import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
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
        try { await saveCachedOrders(list); } catch {}
        lastErr = null;
        break;
      } catch (err: any) {
        lastErr = err;
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
      Alert.alert('Lỗi tải đơn hàng', msg || 'Không thể tải đơn hàng sau nhiều lần thử.');
    }

    setRefreshing(false);
  }, [saveCachedOrders]);

  useEffect(() => {
    (async () => {
      await loadCachedOrders();
      try { await refreshUser(); } catch {}
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

  const formatTimestamp = useCallback((item: any) => {
    const ts = item.created_at || item.createdAt || item.updated_at || item.updatedAt || item.timestamp;
    if (!ts) return '';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${time} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }, []);

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
    if (updatingIds.includes(id)) return;
    markUpdating(id);
    const orig = { ...order };
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
      <TouchableOpacity
        disabled={loading}
        style={styles.card}
        onPress={() => router.push(`/(tabs)/shipper/order/${item._id || item.order_id}`)}
        onLongPress={() => promptUpdateStatus(item)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={styles.leftStrip} />
          <View style={{ flex: 1, paddingLeft: 12, minHeight: 120, position: 'relative' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <ThemedText type="defaultSemiBold" style={styles.orderId}>#{item.order_id || item._id}</ThemedText>
              <ThemedText style={styles.total}>{(item.total_amount || item.total || 0).toLocaleString('vi-VN')}₫</ThemedText>
            </View>

            <ThemedText style={styles.title}>{item.order_items && item.order_items.length > 0 ? `${item.order_items[0].title || item.order_items[0].name || ''}` : ''}</ThemedText>
            <ThemedText style={styles.customer}>{item.shipping_address_snapshot?.receiver_name || item.recipient || ''} | {item.shipping_address_snapshot?.phone_number || item.phone || ''}</ThemedText>
            <ThemedText style={styles.address}>{item.shipping_address_snapshot?.address_detail || item.address || ''}</ThemedText>
            <ThemedText style={styles.timestamp}>{formatTimestamp(item)}</ThemedText>

            <View style={{ position: 'absolute', right: 8, bottom: 8 }}>
              {loading ? (
                <ActivityIndicator size="small" color={Colors.light.tabIconSelected} />
              ) : (
                <ThemedText style={styles.status}>{item.order_status}</ThemedText>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ShelfStacker Phan Huy Ích</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.headerSub}>403 Phan Huy Ích, Phường 14, Quận Gò Vấp, Hồ Chí Minh</Text>
          <TouchableOpacity onPress={async () => { await refreshUser(); fetchOrders(); }} style={{ padding: 6 }}>
            <Text style={{ color: Colors.light.tabIconSelected, fontWeight: '600' }}>Làm mới</Text>
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
        contentContainerStyle={{ padding: 12, paddingBottom: 140 }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            {refreshing ? (
              <View style={{ alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.light.tabIconSelected} />
                <Text style={{ marginTop: 8 }}>Đang tải đơn hàng…</Text>
              </View>
            ) : (
              <>
                <Text>Không có đơn hàng</Text>
                <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setDebugVisible(v => !v)}>
                  <Text style={{ color: Colors.light.tabIconSelected }}>{debugVisible ? 'Ẩn debug' : 'Hiện debug'}</Text>
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
  header: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#fff' },
        headerTitle: { fontWeight: '700', fontSize: 16, color: '#111' },
        headerSub: { color: '#666', marginTop: 4, fontSize: 12 },
        tabBar: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 8, justifyContent: 'space-between' },
        tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
        tabActive: { borderBottomColor: Colors.light.tabIconSelected, borderBottomWidth: 3 },
        tabText: { color: '#777' },
        tabTextActive: { color: Colors.light.tabIconSelected, fontWeight: '700' },
        card: { padding: 16, borderRadius: 12, borderWidth: 0, marginBottom: 16, backgroundColor: '#fff', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
        leftStrip: { width: 6, height: '100%', borderRadius: 4, backgroundColor: Colors.light.tabIconSelected, marginRight: 12 },
        rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        orderId: { color: '#9C27B0', fontWeight: '800', fontSize: 18 },
        total: { color: Colors.light.tabIconSelected, fontWeight: '800', fontSize: 16 },
        title: { marginTop: 6, color: '#333', fontWeight: '600', fontSize: 14 },
        customer: { marginTop: 6, color: '#666' },
        address: { marginTop: 6, color: '#999', fontSize: 12 },
        timestamp: { marginTop: 6, color: '#999', fontSize: 11 },
        actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
        status: { color: Colors.light.tabIconSelected, fontWeight: '600', fontSize: 14 },
        empty: { padding: 24, alignItems: 'center' },
      });
