import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MOCK_ORDERS } from '@/lib/mockData';

export default function TabsIndex() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>(MOCK_ORDERS);

  function formatVnd(value: number | undefined) {
    if (!value && value !== 0) return '';
    try {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
    } catch {
      return `${value}đ`;
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(i) => (i._id || Math.random()).toString()}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => setOrders(MOCK_ORDERS)} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/(tabs)/shipper/order/${item._id || ''}`)}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.title}>{item.recipient || item.customerName || 'Người nhận'}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>{item.address || (item.destination && `${item.destination.lat}, ${item.destination.lng}`) || ''}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.price}>{formatVnd(item.total)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f3f5' },
  listContent: { padding: 12, paddingBottom: Platform.OS === 'android' ? 110 : 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ececec',
    // subtle shadow
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 1 },
    }),
  },
  cardLeft: { flex: 1 },
  cardRight: { justifyContent: 'center', alignItems: 'flex-end', minWidth: 80 },
  title: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  subtitle: { color: '#666', fontSize: 13 },
  price: { color: '#2E7D32', fontWeight: '700', fontSize: 14 },
});
