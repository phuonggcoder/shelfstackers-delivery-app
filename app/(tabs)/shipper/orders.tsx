import { useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AddressWithDirections } from '@/components/AddressWithDirections';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { shipperApi } from '@/lib/shipperApi';

type Order = any;

export default function ShipperOrders() {
  const { t } = useTranslation();
  
  const TABS = [
    { key: 'AwaitingPickup', label: t('orderStatus.awaitingPickup') },
    { key: 'OutForDelivery', label: t('orderStatus.outForDelivery') },
    { key: 'Delivered', label: t('orderStatus.delivered') },
    { key: 'Returned', label: t('orderStatus.returned') }
  ];

  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<string>('AwaitingPickup');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const router = useRouter();
  const [verified, setVerified] = useState<boolean | null>(null);

  // Filter orders based on selected tab
  const filtered = useMemo(() => {
    if (tab === 'AwaitingPickup') {
      // Show all orders that can be claimed (unassigned or assigned to current shipper)
      return orders.filter(o => o.order_status === 'AwaitingPickup');
    }
    return orders.filter(o => o.order_status === tab);
  }, [orders, tab]);

  // Fetch orders from shipper API
  const fetchOrders = async (pageNum: number = 1, append: boolean = false) => {
    if (pageNum === 1) {
      setRefreshing(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const res = await shipperApi.getOrders({ 
        status: tab === 'AwaitingPickup' ? 'AwaitingPickup' : tab,
        page: pageNum,
        limit: 20
      });
      
      // Handle different response formats
      let list: any[] = [];
      if (!res) list = [];
      else if (Array.isArray(res)) list = res;
      else if (res.orders) list = res.orders;
      else if (res.data && Array.isArray(res.data)) list = res.data;
      else list = res.orders || res.data || [];



      if (append) {
        setOrders(prev => [...prev, ...list]);
      } else {
        setOrders(list);
      }
      
      // Check if there are more orders
      setHasMore(list.length === 20);
      setPage(pageNum);
    } catch (err: any) {
      console.warn('Failed to load shipper orders', err?.message || err);
      Alert.alert(t('common.error'), t('orders.loadError'));
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
      setLoading(false);
    }
  };

  // Handle order actions
  const handleAcceptOrder = async (order: Order) => {
    if (updatingIds.includes(order._id)) return;
    
    setUpdatingIds(prev => [...prev, order._id]);
    try {
      await shipperApi.acceptOrder(order._id);
      Alert.alert(t('common.success'), t('messages.orderAccepted'));
      fetchOrders(1, false);
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || t('orders.acceptError'));
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== order._id));
    }
  };

  const handleRejectOrder = async (order: Order) => {
    if (updatingIds.includes(order._id)) return;
    
    setUpdatingIds(prev => [...prev, order._id]);
    try {
      await shipperApi.rejectOrder(order._id);
      Alert.alert(t('common.success'), t('messages.orderRejected'));
      fetchOrders(1, false);
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || t('orders.rejectError'));
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== order._id));
    }
  };

  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    if (updatingIds.includes(order._id)) return;
    
    setUpdatingIds(prev => [...prev, order._id]);
    try {
      await shipperApi.updateStatus(order._id, { order_status: newStatus });
      Alert.alert(t('common.success'), t('messages.statusUpdated'));
      fetchOrders(1, false);
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || t('orders.updateStatusError'));
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== order._id));
    }
  };

  const handleOpenOrder = (order: Order) => {
    router.push(`/shipper/order/${order._id}`);
  };

  const onRefresh = () => {
    fetchOrders(1, false);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchOrders(page + 1, true);
    }
  };

  useEffect(() => {
    fetchOrders(1, false);
  }, [tab]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
          {t('orders.shipperOrders')}
        </ThemedText>
        <ThemedText style={styles.headerSub}>
          {t('orders.manageAndUpdateStatus')}
        </ThemedText>
      </View>

            {/* Tab Bar */}
      <View style={styles.tabBar}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        >
          {TABS.map((tabItem) => (
            <TouchableOpacity
              key={tabItem.key}
              style={[styles.tab, tab === tabItem.key && styles.tabActive]}
              onPress={() => setTab(tabItem.key)}
            >
              <ThemedText 
                style={[styles.tabText, tab === tabItem.key && styles.tabTextActive]}
              >
                {tabItem.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <OrderCard
            item={item}
            onOpen={handleOpenOrder}
            onAccept={handleAcceptOrder}
            onReject={handleRejectOrder}
                         onUpdateStatus={(order) => handleUpdateStatus(order, 'Delivered')}
            updatingIds={updatingIds}
            t={t}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {t('orders.noOrdersInTab', { tab: TABS.find(t => t.key === tab)?.label })}
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#4A90E2" />
              <Text style={styles.loadingMoreText}>{t('common.loading')}</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContainer}
      />
    </ThemedView>
  );
}

function OrderCard({ 
  item, 
  onOpen, 
  onAccept, 
  onReject, 
  onUpdateStatus, 
  updatingIds,
  t 
}: { 
  item: Order; 
  onOpen: (o: Order) => void; 
  onAccept: (o: Order) => void; 
  onReject: (o: Order) => void;
  onUpdateStatus: (o: Order) => void;
  updatingIds: string[];
  t: (key: string) => string;
}) {
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get order status display text
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Pending': return t('orderStatus.pending');
      case 'AwaitingPickup': return t('orderStatus.awaitingPickup');
      case 'OutForDelivery': return t('orderStatus.outForDelivery');
      case 'Delivered': return t('orderStatus.delivered');
      case 'Cancelled': return t('orderStatus.cancelled');
      case 'Returned': return t('orderStatus.returned');
      case 'Refunded': return t('orderStatus.refunded');
      default: return status;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return '#4CAF50';
      case 'OutForDelivery': return '#2196F3';
      case 'Cancelled': return '#F44336';
      case 'Pending': return '#FF9800';
      case 'AwaitingPickup': return '#9C27B0';
      case 'Returned': return '#FF5722';
      default: return '#777';
    }
  };

  // Check if order can be claimed (unassigned or assigned to current shipper)
  const canClaim = item.canClaim || !item.assigned_shipper_id || item.assigned_shipper_id === 'current_shipper_id';
  const isUpdating = updatingIds.includes(item._id);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onOpen(item)}>
      <View style={styles.rowBetween}>
        <ThemedText type="defaultSemiBold" style={styles.orderId}>
          #{item.order_id || item._id}
        </ThemedText>
        <ThemedText style={styles.total}>
          {(item.total_amount || item.total || 0).toLocaleString('vi-VN')}₫
        </ThemedText>
      </View>

      <View style={{ marginTop: 12 }}>
        {/* Product name */}
        <ThemedText style={{ fontSize: 16, fontWeight: '500' }}>
          {item.order_items && item.order_items.length > 0 
            ? (item.order_items[0].book_id?.title || item.order_items[0].title || t('orders.noProductName'))
            : t('orders.noProducts')
          }
        </ThemedText>
        
        {/* Customer info */}
        <ThemedText style={{ marginTop: 8, color: '#666', fontSize: 14 }}>
          {item.summary?.customerName || 
           item.shipping_address_snapshot?.receiver_name || 
           item.user_id?.full_name || 
           item.recipient || 
           item.customer_name ||
           t('orders.unknownCustomer')}
        </ThemedText>

        {/* Phone number */}
        <ThemedText style={{ marginTop: 4, color: '#666', fontSize: 14 }}>
          {item.summary?.customerPhone || 
           item.shipping_address_snapshot?.phone_number || 
           item.shipping_address_snapshot?.phone ||
           item.user_id?.phone_number || 
           item.phone || 
           item.customer_phone ||
           item.contact_phone ||
           t('orders.noPhone')}
        </ThemedText>

        {/* Address */}
        <View style={{ marginTop: 8 }}>
          <AddressWithDirections 
            address={item.summary?.customerAddress || 
                    item.shipping_address_snapshot?.fullAddress || 
                    item.shipping_address_snapshot?.address_detail ||
                    item.address || 
                    t('orders.noAddress')}
          />
        </View>

        {/* Status */}
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.order_status) }]} />
          <ThemedText style={{ color: getStatusColor(item.order_status), fontSize: 14, fontWeight: '500' }}>
            {getStatusDisplay(item.order_status)}
          </ThemedText>
        </View>

        {/* Date */}
        <ThemedText style={{ marginTop: 4, color: '#999', fontSize: 12 }}>
          {formatDate(item.created_at || item.order_date || new Date().toISOString())}
        </ThemedText>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        {canClaim && item.order_status === 'AwaitingPickup' && (
          <TouchableOpacity 
            style={[styles.accept, { opacity: isUpdating ? 0.6 : 1 }]}
            onPress={() => onAccept(item)}
            disabled={isUpdating}
          >
            <Text style={styles.buttonText}>{t('actions.acceptOrder')}</Text>
          </TouchableOpacity>
        )}

        {item.order_status === 'OutForDelivery' && (
          <>
            <TouchableOpacity 
              style={[styles.updateStatus, { backgroundColor: '#4CAF50', opacity: isUpdating ? 0.6 : 1 }]}
                             onPress={() => onUpdateStatus(item)}
              disabled={isUpdating}
            >
              <Text style={styles.buttonText}>{t('actions.markDelivered')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.updateStatus, { backgroundColor: '#FF5722', opacity: isUpdating ? 0.6 : 1 }]}
                             onPress={() => onUpdateStatus(item)}
              disabled={isUpdating}
            >
              <Text style={styles.buttonText}>{t('actions.markReturned')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  header: { 
    padding: 16, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
  borderColor: '#fff' 
  },
  headerTitle: { 
    fontWeight: '700', 
    fontSize: 18, 
    color: '#111' 
  },
  headerSub: { 
    color: '#666', 
    marginTop: 4, 
    fontSize: 14 
  },
  tabBar: { 
    backgroundColor: '#fff', 
    paddingVertical: 16, 
    paddingHorizontal: 16
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8
  },
  tab: { 
    paddingVertical: 12, 
    paddingHorizontal: 16,
    alignItems: 'center', 
    borderBottomWidth: 3, 
    borderBottomColor: 'transparent',
    marginHorizontal: 4
  },
  tabActive: { 
    borderBottomColor: '#4A90E2' 
  },
  tabText: { 
    color: '#777', 
    fontSize: 14, 
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18
  },
  tabTextActive: { 
    color: '#4A90E2', 
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18
  },
  card: { 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#e5e5e5', 
    marginBottom: 16, 
    backgroundColor: '#fff', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  rowBetween: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  orderId: { 
    color: '#9C27B0', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  total: { 
    color: '#4A90E2', 
    fontWeight: '700', 
    fontSize: 16 
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  actionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    alignItems: 'center',
    gap: 8, 
    marginTop: 12 
  },
  accept: { 
    backgroundColor: '#2196F3', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 8 
  },
  reject: { 
    backgroundColor: '#F44336', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 8 
  },
  updateStatus: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: { 
    padding: 24, 
    alignItems: 'center' 
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center'
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  }
});
