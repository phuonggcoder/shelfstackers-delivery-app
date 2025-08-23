import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AddressWithDirections } from '@/components/AddressWithDirections';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { shipperApi } from '@/lib/shipperApi';

type Order = any;

const TABS = [
  { key: 'AwaitingPickup', label: 'Chờ lấy hàng' },
  { key: 'OutForDelivery', label: 'Đang giao' },
  { key: 'Delivered', label: 'Hoàn thành' },
  { key: 'Returned', label: 'Trả hàng' }
];

function OrderCard({ item, onOpen, onAccept, onReject, onUpdateStatus }: { 
  item: Order; 
  onOpen: (o: Order) => void; 
  onAccept: (o: Order) => void; 
  onReject: (o: Order) => void;
  onUpdateStatus: (o: Order) => void;
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
      case 'Pending': return 'Chờ xử lý';
      case 'AwaitingPickup': return 'Chờ lấy hàng';
      case 'OutForDelivery': return 'Đang giao';
      case 'Delivered': return 'Hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      case 'Returned': return 'Trả hàng';
      case 'Refunded': return 'Đã hoàn tiền';
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
        {/* Product name - from order_items.book_id.title (new format) */}
        <ThemedText style={{ fontSize: 16, fontWeight: '500' }}>
          {item.order_items && item.order_items.length > 0 
            ? (item.order_items[0].book_id?.title || item.order_items[0].title || 'Không có tên sản phẩm')
            : 'Không có sản phẩm'
          }
        </ThemedText>
        
        {/* Customer info - from summary object (new format) with fallback */}
        <ThemedText style={{ marginTop: 8, color: '#666', fontSize: 14 }}>
          {item.summary?.customerName || 
           item.shipping_address_snapshot?.receiver_name || 
           item.user_id?.full_name || 
           item.recipient || 
           item.customer_name ||
           'Không có tên'} | {(() => {
             // Helper function to check if phone number is valid
             const getValidPhone = (phone: any) => {
               if (!phone || phone === '' || phone === 'undefined' || phone === 'null') return null;
               return phone;
             };
             
             // Try to get phone from various sources
             const phone = getValidPhone(item.summary?.customerPhone) ||
                          getValidPhone(item.shipping_address_snapshot?.phone_number) ||
                          getValidPhone(item.shipping_address_snapshot?.phone) ||
                          getValidPhone(item.user_id?.phone_number) ||
                          getValidPhone(item.phone) ||
                          getValidPhone(item.customer_phone) ||
                          getValidPhone(item.contact_phone);
             
             return phone || 'Không có số điện thoại';
           })()}
        </ThemedText>
        
        {/* Address - from summary object (new format) with fallback */}
        <AddressWithDirections
          address={item.summary?.address || 
                   item.shipping_address_snapshot?.fullAddress || 
                   item.shipping_address_snapshot?.address_detail || 
                   item.address_id?.fullAddress || 
                   item.address}
          coordinates={item.shipping_address_snapshot?.coordinates || 
                     item.address_id?.coordinates}
          showDirectionsButton={false}
          style={{ marginTop: 6 }}
        />
        
        {/* Date - from order_date or createdAt */}
        <ThemedText style={{ marginTop: 6, color: '#999', fontSize: 12 }}>
          {formatDate(item.order_date || item.createdAt)}
        </ThemedText>
      </View>

      <View style={styles.actionsRow}>
        {/* Show action buttons for orders that can be accepted */}
        {item.order_status === 'AwaitingPickup' && canClaim ? (
          <TouchableOpacity style={styles.accept} onPress={() => onAccept(item)}>
            <ThemedText style={{ color: 'white', fontWeight: '600' }}>Nhận đơn hàng</ThemedText>
          </TouchableOpacity>
        ) : (
          <>
            {/* Status display */}
            <ThemedText style={{ 
              color: getStatusColor(item.order_status), 
              fontWeight: '600',
              fontSize: 14
            }}>
              {getStatusDisplay(item.order_status)}
            </ThemedText>
            
            {/* Update status button for orders in delivery */}
            {(item.order_status === 'OutForDelivery' || item.order_status === 'AwaitingPickup') && (
              <TouchableOpacity 
                style={[styles.updateStatus, { backgroundColor: getStatusColor(item.order_status) }]} 
                onPress={() => onUpdateStatus(item)}
              >
                <ThemedText style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>
                  Cập nhật
                </ThemedText>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ShipperOrders() {
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

      // Debug: log response data structure
      console.log('[Shipper Orders] API Response:', {
        hasResponse: !!res,
        responseType: typeof res,
        hasOrders: !!(res && res.orders),
        ordersCount: res?.orders?.length || 0,
        firstOrder: list[0] ? {
          id: list[0]._id,
          order_id: list[0].order_id,
          hasSummary: !!list[0].summary,
          summary: list[0].summary,
          hasShippingAddress: !!list[0].shipping_address_snapshot,
          shippingAddress: list[0].shipping_address_snapshot,
          hasUser: !!list[0].user_id,
          user: list[0].user_id,
          hasRecipient: !!list[0].recipient,
          recipient: list[0].recipient,
          hasPhone: !!list[0].phone,
          phone: list[0].phone,
          // Log all possible phone fields
          allPhoneFields: {
            summary_customerPhone: list[0].summary?.customerPhone,
            shipping_phone_number: list[0].shipping_address_snapshot?.phone_number,
            shipping_phone: list[0].shipping_address_snapshot?.phone,
            user_phone: list[0].user_id?.phone_number,
            direct_phone: list[0].phone,
            customer_phone: list[0].customer_phone,
            contact_phone: list[0].contact_phone
          }
        } : null
      });

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
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
      setLoading(false);
    }
  };

  // Check user verification and fetch orders on mount
  useEffect(() => {
    (async () => {
      try {
        const me = await shipperApi.getCurrentUser();
        const isShipper = Array.isArray(me?.roles) && me.roles.includes('shipper');
        const isVerified = !!me?.shipper_verified;
        setVerified(isShipper && isVerified);
        
        if (!isShipper) {
          router.replace('/(tabs)');
          return;
        }
        if (!isVerified) {
          router.replace('/application');
          return;
        }
        
        // Load orders after verification
        fetchOrders(1);
      } catch (e) {
        console.warn('Failed to fetch current user', e);
        setLoading(false);
      }
    })();
  }, [router]);

  // Refetch orders when tab changes
  useEffect(() => {
    if (verified) {
      setPage(1);
      fetchOrders(1);
    }
  }, [tab, verified]);

  const onRefresh = () => {
    fetchOrders(1);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchOrders(page + 1, true);
    }
  };

  // Handle accept order
  const handleAccept = async (o: Order) => {
    const orderId = o._id || o.order_id;
    if (!orderId) return;

    setUpdatingIds(prev => [...prev, orderId]);
    
    try {
      // Optimistic update
      setOrders(prev => prev.map(p => 
        p._id === o._id ? { ...p, order_status: 'OutForDelivery' } : p
      ));
      
      await shipperApi.acceptOrder(orderId);
      Alert.alert('Thành công', 'Đã nhận đơn hàng thành công');
      // Refresh orders to get updated data
      fetchOrders(1);
    } catch (err: any) {
      console.warn('Accept order failed', err?.message || err);
      // Revert optimistic update
      setOrders(prev => prev.map(p => 
        p._id === o._id ? { ...p, order_status: o.order_status } : p
      ));
      Alert.alert('Lỗi', err?.message || 'Không thể nhận đơn hàng');
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== orderId));
    }
  };

  // Handle reject order
  const handleReject = async (o: Order) => {
    const orderId = o._id || o.order_id;
    if (!orderId) return;

    setUpdatingIds(prev => [...prev, orderId]);
    
    try {
      // Optimistic update
      setOrders(prev => prev.map(p => 
        p._id === o._id ? { ...p, order_status: 'Cancelled' } : p
      ));
      
      await shipperApi.rejectOrder(orderId);
      Alert.alert('Thành công', 'Đã từ chối đơn hàng');
      // Refresh orders to get updated data
      fetchOrders(1);
    } catch (err: any) {
      console.warn('Reject order failed', err?.message || err);
      // Revert optimistic update
      setOrders(prev => prev.map(p => 
        p._id === o._id ? { ...p, order_status: o.order_status } : p
      ));
      Alert.alert('Lỗi', err?.message || 'Không thể từ chối đơn hàng');
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== orderId));
    }
  };

  // Handle status update with note input
  const handleUpdateStatus = (order: Order) => {
    const options = [
      { text: 'Đang giao', value: 'OutForDelivery' },
      { text: 'Hoàn thành', value: 'Delivered' },
      { text: 'Trả hàng', value: 'Returned' },
      { text: 'Huỷ', style: 'cancel' }
    ];

    Alert.alert(
      'Cập nhật trạng thái', 
      `Chọn trạng thái cho đơn hàng #${order.order_id || order._id}`,
      options.map(o => ({
        text: o.text,
        style: o.style as any,
        onPress: async () => {
          if (!o.value) return;
          
          // For delivered status, ask for confirmation and note
          if (o.value === 'Delivered') {
            Alert.prompt(
              'Ghi chú giao hàng',
              'Nhập ghi chú (tùy chọn):',
              [
                { text: 'Huỷ', style: 'cancel' },
                { 
                  text: 'Hoàn thành', 
                  onPress: async (note) => {
                    await updateOrderStatus(order, o.value, note);
                  }
                }
              ],
              'plain-text',
              'Giao hàng thành công'
            );
            return;
          }
          
          // For other statuses, ask for note
          Alert.prompt(
            'Ghi chú',
            'Nhập ghi chú (tùy chọn):',
            [
              { text: 'Huỷ', style: 'cancel' },
              { 
                text: 'Cập nhật', 
                onPress: async (note) => {
                  await updateOrderStatus(order, o.value, note);
                }
              }
            ],
            'plain-text'
          );
        }
      }))
    );
  };

  // Update order status
  const updateOrderStatus = async (order: Order, newStatus: string, note?: string) => {
    const orderId = order._id || order.order_id;
    if (!orderId) return;

    setUpdatingIds(prev => [...prev, orderId]);
    
    try {
      // Optimistic update
      setOrders(prev => prev.map(p => 
        p._id === order._id ? { ...p, order_status: newStatus } : p
      ));
      
      await shipperApi.updateStatus(orderId, { 
        order_status: newStatus,
        note: note || ''
      });
      
      const statusText = newStatus === 'Delivered' ? 'Hoàn thành' : 
                        newStatus === 'OutForDelivery' ? 'Đang giao' :
                        newStatus === 'Returned' ? 'Trả hàng' : newStatus;
      
      Alert.alert('Thành công', `Đã cập nhật trạng thái: ${statusText}`);
      // Refresh orders to get updated data
      fetchOrders(1);
    } catch (err: any) {
      console.warn('Update status failed', err?.message || err);
      // Revert optimistic update
      setOrders(prev => prev.map(p => 
        p._id === order._id ? { ...p, order_status: order.order_status } : p
      ));
      Alert.alert('Lỗi', err?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== orderId));
    }
  };

  // Show loading state
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn hàng Shipper</Text>
        <Text style={styles.headerSub}>Quản lý và cập nhật trạng thái đơn hàng</Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity 
            key={t.key} 
            style={[styles.tab, tab === t.key && styles.tabActive]} 
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => (i._id || i.order_id || Math.random()).toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        renderItem={({ item }) => (
          <OrderCard
            item={item}
            onOpen={(o) => router.push(`./order/${o._id || o.order_id}`)}
            onAccept={handleAccept}
            onReject={handleReject}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            {refreshing ? (
              <View style={{ alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={{ marginTop: 8 }}>Đang tải đơn hàng…</Text>
              </View>
            ) : (
              <Text style={{ color: '#666', fontSize: 16 }}>
                Không có đơn hàng nào trong tab "{TABS.find(t => t.key === tab)?.label}"
              </Text>
            )}
          </View>
        )}
        ListFooterComponent={() => 
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#4A90E2" />
              <Text style={{ marginTop: 8, color: '#666' }}>Đang tải thêm...</Text>
            </View>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  header: { 
    padding: 16, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderColor: '#eee' 
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
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    justifyContent: 'space-between' 
  },
  tab: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderBottomWidth: 3, 
    borderBottomColor: 'transparent' 
  },
  tabActive: { 
    borderBottomColor: '#4A90E2' 
  },
  tabText: { 
    color: '#777', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  tabTextActive: { 
    color: '#4A90E2', 
    fontWeight: '700' 
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

  updateStatus: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  empty: { 
    padding: 24, 
    alignItems: 'center' 
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center'
  }
});
