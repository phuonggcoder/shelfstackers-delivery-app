import React, { useState } from 'react';
import { FlatList, RefreshControl, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MOCK_ORDERS } from '@/lib/mockData';

type Order = any;

function OrderCard({ item, onOpen, onAccept, onReject }: { item: Order; onOpen: (o: Order) => void; onAccept: (o: Order) => void; onReject: (o: Order) => void; }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onOpen(item)}>
      <View>
        <ThemedText type="defaultSemiBold">{item.order_id || item._id}</ThemedText>
        <ThemedText>{item.address?.recipient_name || item.customer_name || item.recipient}</ThemedText>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {item.shipper_ack === 'Pending' && item.order_status === 'AwaitingPickup' ? (
          <>
            <TouchableOpacity style={styles.accept} onPress={() => onAccept(item)}>
              <ThemedText style={{ color: 'white' }}>Chấp nhận</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reject} onPress={() => onReject(item)}>
              <ThemedText style={{ color: 'white' }}>Từ chối</ThemedText>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function ShipperOrders() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const router = useRouter();

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        data={orders}
        keyExtractor={(i) => (i._id || Math.random()).toString()}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => setOrders(MOCK_ORDERS)} />}
        renderItem={({ item }) => (
          <OrderCard
            item={item}
            onOpen={(o) => router.push(`./order/${o._id || ''}`)}
            onAccept={async (o) => { /* no-op in UI-only mode */ }}
            onReject={async (o) => { /* no-op in UI-only mode */ }}
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
  card: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e5e5', marginBottom: 12 },
  accept: { backgroundColor: '#2E7D32', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  reject: { backgroundColor: '#C62828', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  empty: { padding: 24, alignItems: 'center' },
});
