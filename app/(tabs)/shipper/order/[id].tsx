import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getMockOrder } from '@/lib/mockData';

export default function OrderDetail() {
  const params = useLocalSearchParams();
  const id = String(params.id || params.orderId || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const res = getMockOrder(id);
      setOrder(res || null);
    } catch (e) {
      console.warn('Failed to load order', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  if (!order) return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText>Đang tải…</ThemedText>
    </ThemedView>
  );

  const dest = order.destination || order.address || order.location || {};
  const lat = dest.lat || dest.latitude || (dest.coords && dest.coords.lat) || null;
  const lng = dest.lng || dest.longitude || (dest.coords && dest.coords.lng) || null;

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ThemedText type="title">{order.order_id || order._id || 'Đơn hàng'}</ThemedText>
        <ThemedText>Người nhận: {order.address?.recipient_name || order.recipient || ''}</ThemedText>
        <ThemedText>Điện thoại: {order.address?.phone || order.phone || ''}</ThemedText>
        <ThemedText>Trạng thái: {order.order_status || order.status || ''}</ThemedText>

        <View style={{ height: 12 }} />

        <TouchableOpacity style={styles.action} onPress={() => {
          if (order.order_status === 'OutForDelivery') {
            // no-op in UI-only mode; show completed toast or navigate back
            router.back();
          } else if (lat && lng) {
            router.push(`/(tabs)/shipper/map?lat=${lat}&lng=${lng}&address=${encodeURIComponent(order.address || '')}`);
          } else {
            Alert.alert('Không có toạ độ', 'Đơn hàng không có toạ độ đích để chỉ đường.');
          }
        }}>
          <ThemedText style={{ color: 'white' }}>{order.order_status === 'OutForDelivery' ? 'Hoàn thành' : 'Mở chỉ đường'}</ThemedText>
        </TouchableOpacity>

        {order.order_status === 'AwaitingPickup' && order.shipper_ack === 'Pending' ? (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TouchableOpacity style={styles.accept} onPress={async () => { /* UI-only: pretend accepted */ router.back(); }}>
              <ThemedText style={{ color: 'white' }}>Chấp nhận</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reject} onPress={async () => { /* UI-only: pretend rejected */ router.back(); }}>
              <ThemedText style={{ color: 'white' }}>Từ chối</ThemedText>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  action: { backgroundColor: '#2E7D32', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  accept: { backgroundColor: '#2E7D32', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  reject: { backgroundColor: '#C62828', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
});
