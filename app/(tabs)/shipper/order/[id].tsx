import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { shipperApi } from '@/lib/shipperApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function OrderDetail() {
  const params = useLocalSearchParams();
  const id = String(params.id || params.orderId || '');
  const [order, setOrder] = useState<any>(null);
  const router = useRouter();
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await shipperApi.getOrder(id);
        const ord = res?.order || res?.data || res;
        setOrder(ord || null);
      } catch (e) {
        console.warn('Failed to load order', e);
      }
    })();
  }, [id]);

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
            // mark delivered
            (async () => {
              try {
                await shipperApi.updateStatus(order._id || order.order_id, { order_status: 'Delivered' });
                Alert.alert('Thành công', 'Đã đánh dấu là hoàn thành');
                router.back();
              } catch (err: any) {
                console.warn('Update status failed', err?.message || err);
                Alert.alert('Lỗi', err?.message || 'Không thể cập nhật trạng thái');
              }
            })();
          } else if (lat && lng) {
            router.push(`/(tabs)/shipper/map?lat=${lat}&lng=${lng}&address=${encodeURIComponent(order.address || '')}`);
          } else {
            Alert.alert('Không có tọa độ', 'Đơn hàng không có tọa độ đích để chỉ đường.');
          }
        }}>
          <ThemedText style={{ color: 'white' }}>{order.order_status === 'OutForDelivery' ? 'Hoàn thành' : 'Mở chỉ đường'}</ThemedText>
        </TouchableOpacity>

        {order.order_status === 'AwaitingPickup' && order.shipper_ack === 'Pending' ? (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TouchableOpacity style={styles.accept} onPress={async () => {
              try {
                await shipperApi.acceptOrder(order._id || order.order_id);
                Alert.alert('Đã chấp nhận', 'Bạn đã chấp nhận đơn hàng');
                router.back();
              } catch (err: any) {
                console.warn('Accept failed', err?.message || err);
                Alert.alert('Lỗi', err?.message || 'Không thể chấp nhận đơn');
              }
            }}>
              <ThemedText style={{ color: 'white' }}>Chấp nhận</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reject} onPress={async () => {
              try {
                await shipperApi.rejectOrder(order._id || order.order_id);
                Alert.alert('Đã từ chối', 'Bạn đã từ chối đơn hàng');
                router.back();
              } catch (err: any) {
                console.warn('Reject failed', err?.message || err);
                Alert.alert('Lỗi', err?.message || 'Không thể từ chối đơn');
              }
            }}>
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
