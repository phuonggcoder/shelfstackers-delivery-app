import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { MOCK_ORDERS } from '@/lib/mockData';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      {/* bottom tab bar - fixed */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomTab} onPress={() => router.push('/shipper/orders')}>
            <IconSymbol name="inventory" size={22} color={Colors.light.tabIconInfo} />
            <Text style={[styles.bottomTabText, { color: Colors.light.tabIconInfo }]}>Đơn hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomTab} onPress={() => router.push('/info')}>
            <IconSymbol name="person" size={22} color={'#999'} />
            <Text style={styles.bottomTabText}>Cá nhân</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f3f5' },
  listContent: { padding: 12, paddingBottom: Platform.OS === 'android' ? 160 : 140 },
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
  bottomBarContainer: { position: 'absolute', left: 0, right: 0, bottom: 0, height: Platform.OS === 'android' ? 84 : 94, alignItems: 'center', justifyContent: 'flex-end', pointerEvents: 'box-none' },
  bottomBar: { width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, borderTopWidth: 1, borderColor: '#eee', paddingVertical: 8, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 16, zIndex: 9999, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
  bottomTab: { alignItems: 'center', justifyContent: 'center' },
  bottomTabText: { marginTop: 4, fontSize: 12 },
});
