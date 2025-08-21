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

  // Ensure shipper is verified before allowing actions
  useEffect(() => {
    (async () => {
      try {
        const me = await shipperApi.getCurrentUser();
        const isShipper = Array.isArray(me?.roles) && me.roles.includes('shipper');
        const isVerified = !!me?.shipper_verified;
        if (!isShipper) return router.replace('/(tabs)');
        if (!isVerified) return router.replace('/application');
      } catch (e) {
        console.warn('Failed to validate shipper', e);
      }
    })();
  }, [router]);

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

        <View style={{ marginTop: 12, padding: 12, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee' }}>
          <ThemedText type="defaultSemiBold">Người nhận</ThemedText>
          <ThemedText style={{ marginTop: 6 }}>{order.address?.receiver_name || order.address?.recipient_name || order.recipient || ''}</ThemedText>
          <ThemedText style={{ marginTop: 6, color: '#666' }}>{order.address?.phone || order.phone || ''}</ThemedText>
          <ThemedText style={{ marginTop: 6, color: '#999', fontSize: 12 }}>{order.address?.fullAddress || order.address || ''}</ThemedText>
        </View>

        <View style={{ marginTop: 12 }} />

        <View style={{ padding: 12, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee' }}>
          <ThemedText type="defaultSemiBold">Danh sách sản phẩm</ThemedText>
          {(order.order_items || order.items || []).map((it: any, idx: number) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <ThemedText style={{ flex: 1 }}>{it.title || it.name || it.book?.title || it.book_id?.title}</ThemedText>
              <ThemedText style={{ width: 80, textAlign: 'right' }}>{(it.quantity || it.qty || 1)} x {(it.price || it.book?.price || 0).toLocaleString('vi-VN')}đ</ThemedText>
            </View>
          ))}
        </View>

        <View style={{ height: 12 }} />

        <View style={{ padding: 12, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee' }}>
          <ThemedText type="defaultSemiBold">Chi tiết thanh toán</ThemedText>
          <ThemedText style={{ marginTop: 8 }}>Tổng tiền: {(order.total_amount || order.total || 0).toLocaleString('vi-VN')}đ</ThemedText>
          <ThemedText>Phí ship: {(order.ship_amount || 0).toLocaleString('vi-VN')}đ</ThemedText>
          <ThemedText>Giảm giá: {(order.discount_amount || 0).toLocaleString('vi-VN')}đ</ThemedText>
          <ThemedText style={{ marginTop: 6, color: order.order_status === 'Delivered' ? '#2E7D32' : '#FF9800' }}>Trạng thái: {order.order_status}</ThemedText>
        </View>

        <View style={{ height: 12 }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <TouchableOpacity style={[styles.action, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E53935' }]} onPress={async () => {
            // Hủy/hủy đơn action - for shipper simply reject or mark cancelled
            try {
              await shipperApi.updateStatus(order._id || order.order_id, { order_status: 'Cancelled' });
              Alert.alert('Đã hủy đơn', 'Đơn hàng đã được hủy');
              router.back();
            } catch (err: any) {
              console.warn('Cancel failed', err?.message || err);
              Alert.alert('Lỗi', err?.message || 'Không thể hủy đơn');
            }
          }}>
            <ThemedText style={{ color: '#E53935' }}>Hủy đơn hàng</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={() => {
            if (order.order_status === 'OutForDelivery') {
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
        </View>

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
