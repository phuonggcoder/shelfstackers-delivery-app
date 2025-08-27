import { AddressWithDirections } from '@/components/AddressWithDirections';
import { OrderMapView } from '@/components/OrderMapView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useDirections } from '@/hooks/useDirections';
import { shipperApi } from '@/lib/shipperApi';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function OrderDetail() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const id = String(params.id || params.orderId || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const { openDirections, openDirectionsToCoordinates } = useDirections();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await shipperApi.getOrder(id);
        const ord = res?.order || res?.data || res;
        setOrder(ord || null);
      } catch (e) {
        console.warn('Failed to load order', e);
        Alert.alert(t('common.error'), t('orders.loadOrderError'));
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>{t('orders.loadingOrderInfo')}</ThemedText>
      </ThemedView>
    );
  }

  if (!order) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText style={styles.errorText}>{t('orders.orderNotFound')}</ThemedText>
      </ThemedView>
    );
  }

  // Get order status display
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
      case 'Delivered': return '#2196F3';
      case 'OutForDelivery': return '#2196F3';
      case 'Cancelled': return '#F44336';
      case 'Pending': return '#FF9800';
      case 'AwaitingPickup': return '#2196F3';
      case 'Returned': return '#FF5722';
      default: return '#2196F3';
    }
  };

  // Get payment status display
  const getPaymentStatusDisplay = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'Completed': return t('payment.completed');
      case 'Pending': return t('payment.pending');
              case 'Processing': return t('payment.processing');
        case 'Failed': return t('payment.failed');
      default: return t('payment.pending');
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'Completed': return '#4CAF50';
      case 'Pending': return '#FF9800';
      case 'Processing': return '#2196F3';
      case 'Failed': return '#F44336';
      default: return '#FF9800';
    }
  };

  // Get payment method display
  const getPaymentMethodDisplay = (method: string) => {
    console.log('Payment method raw value:', method); // Debug log
    console.log('Payment method type:', typeof method); // Debug log
    
    if (!method) {
      console.log('Payment method is empty/null/undefined');
      return 'Tiền mặt';
    }
    
    const upperMethod = String(method).toUpperCase().trim();
    console.log('Payment method after processing:', upperMethod); // Debug log
    
    switch (upperMethod) {
      case 'COD': 
      case 'CASH': 
      case 'TIENMAT': 
      case 'TIỀN MẶT':
        return 'Tiền mặt';
      case 'ZALOPAY': 
      case 'ZALO PAY':
        return 'ZaloPay';
      case 'PAYOS': 
      case 'PAY OS':
        return 'PayOS';
      case 'BANK_TRANSFER':
      case 'CHUYENKHOAN':
      case 'CHUYỂN KHOẢN':
        return 'Chuyển khoản';
      case 'MOMO':
        return 'MoMo';
      case 'VNPAY':
        return 'VNPay';
      default: 
        console.log('Payment method not matched, using default. Raw value was:', method);
        return `Khác (${method})`;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // Handle return order
  const handleReturnOrder = () => {
    Alert.alert(
      t('orders.confirmReturn'),
      t('orders.confirmReturnMessage'),
      [
        { text: t('common.no'), style: 'cancel' },
        { text: t('common.yes'), onPress: () => returnOrder() }
      ]
    );
  };

  // Handle complete order
  const handleCompleteOrder = () => {
    Alert.alert(
      t('orders.confirmComplete'),
      t('orders.confirmCompleteMessage'),
      [
        { text: t('common.no'), style: 'cancel' },
        { text: t('common.yes'), onPress: () => completeOrder() }
      ]
    );
  };

  // Return order function
  const returnOrder = async () => {
    setUpdating(true);
    try {
      await shipperApi.updateStatus(id, { order_status: 'Returned' });
      Alert.alert(t('common.success'), t('messages.orderMarkedReturned'));
      router.back();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('orders.cannotMarkReturned'));
    } finally {
      setUpdating(false);
    }
  };

  // Complete order function
  const completeOrder = async () => {
    setUpdating(true);
    try {
      await shipperApi.updateStatus(id, { order_status: 'Delivered' });
      Alert.alert(t('common.success'), t('messages.orderCompleted'));
      router.back();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('orders.cannotComplete'));
    } finally {
      setUpdating(false);
    }
  };

  // Copy order ID to clipboard
  const copyOrderId = () => {
    // In a real app, you'd use Clipboard API
    Alert.alert(t('common.notification'), t('orders.orderIdCopied'));
  };

  // Get valid phone number from order
  const getValidPhoneNumber = () => {
    // Helper function to check if phone number is valid
    const getValidPhone = (phone: any) => {
      if (!phone || phone === '' || phone === 'undefined' || phone === 'null') return null;
      // Remove any non-digit characters except + for international numbers
      const cleanPhone = String(phone).replace(/[^\d+]/g, '');
      return cleanPhone.length >= 10 ? cleanPhone : null;
    };
    
    // Try to get phone from various sources in order of priority
    return getValidPhone(order.summary?.customerPhone) ||
           getValidPhone(order.shipping_address_snapshot?.phone_number) ||
           getValidPhone(order.shipping_address_snapshot?.phone) ||
           getValidPhone(order.user_id?.phone_number) ||
           getValidPhone(order.phone) ||
           getValidPhone(order.customer_phone) ||
           getValidPhone(order.contact_phone);
  };

  // Call recipient
  const callRecipient = async () => {
    const phoneNumber = getValidPhoneNumber();
    
    if (!phoneNumber) {
      Alert.alert(t('common.error'), t('orders.noValidPhone'));
      return;
    }

    try {
      // Check if phone app can be opened
      const canOpen = await Linking.canOpenURL(`tel:${phoneNumber}`);
      
      if (canOpen) {
        await Linking.openURL(`tel:${phoneNumber}`);
      } else {
        Alert.alert(t('common.error'), t('orders.cannotOpenPhoneApp'));
      }
    } catch (error) {
              Alert.alert(t('common.error'), t('orders.cannotMakeCall'));
    }
  };

  // Message recipient
  const messageRecipient = async () => {
    const phoneNumber = getValidPhoneNumber();
    
    if (!phoneNumber) {
      Alert.alert(t('common.error'), t('orders.noValidPhone'));
      return;
    }

    try {
      // Check if SMS app can be opened
      const canOpen = await Linking.canOpenURL(`sms:${phoneNumber}`);
      
      if (canOpen) {
        await Linking.openURL(`sms:${phoneNumber}`);
      } else {
        Alert.alert(t('common.error'), t('orders.cannotOpenSMSApp'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('orders.cannotOpenSMSApp'));
    }
  };

  // Open directions to delivery address
  const openDirectionsToAddress = async () => {
    const coordinates = order.shipping_address_snapshot?.coordinates || order.address_id?.coordinates;
    const address = order.summary?.address || 
                   order.shipping_address_snapshot?.fullAddress || 
                   order.shipping_address_snapshot?.address_detail || 
                   order.address_id?.fullAddress || 
                   order.address;

    if (coordinates) {
      await openDirectionsToCoordinates(coordinates.latitude, coordinates.longitude);
    } else if (address) {
      await openDirections(address);
    } else {
      Alert.alert(t('common.error'), t('orders.noShippingAddress'));
    }
  };

  // Calculate total amount
  const totalAmount = (order.total_amount || 0) + (order.ship_amount || 0) - (order.discount_amount || 0);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>←</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t('orders.orderDetail')}</ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recipient Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>{t('orders.recipient')}</ThemedText>
                         <View style={styles.recipientActions}>
               <TouchableOpacity 
                 style={[styles.actionButton, order.order_status === 'AwaitingPickup' && styles.actionButtonDisabled]} 
                 onPress={openDirectionsToAddress}
                 disabled={order.order_status === 'AwaitingPickup'}
               >
                 <Ionicons 
                   name="navigate" 
                   size={20} 
                   color={order.order_status === 'AwaitingPickup' ? "#999" : "#2196F3"} 
                 />
               </TouchableOpacity>
               <TouchableOpacity 
                 style={[styles.actionButton, (!getValidPhoneNumber() || order.order_status === 'AwaitingPickup') && styles.actionButtonDisabled]} 
                 onPress={callRecipient}
                 disabled={!getValidPhoneNumber() || order.order_status === 'AwaitingPickup'}
               >
                 <Ionicons 
                   name="call" 
                   size={20} 
                   color={(!getValidPhoneNumber() || order.order_status === 'AwaitingPickup') ? "#999" : "#2196F3"} 
                 />
               </TouchableOpacity>
               <TouchableOpacity 
                 style={[styles.actionButton, (!getValidPhoneNumber() || order.order_status === 'AwaitingPickup') && styles.actionButtonDisabled]} 
                 onPress={messageRecipient}
                 disabled={!getValidPhoneNumber() || order.order_status === 'AwaitingPickup'}
               >
                 <Ionicons 
                   name="mail" 
                   size={20} 
                   color={(!getValidPhoneNumber() || order.order_status === 'AwaitingPickup') ? "#999" : "#2196F3"} 
                 />
               </TouchableOpacity>
             </View>
          </View>
          
          <View style={styles.recipientInfo}>
            <View style={styles.recipientDetails}>
              <ThemedText style={styles.recipientName}>
                {order.user_id?.full_name || 
                 order.shipping_address_snapshot?.receiver_name || 
                 order.recipient || 
                 t('orders.noName')}
              </ThemedText>
              <ThemedText style={styles.recipientPhone}>
                {getValidPhoneNumber() || t('orders.noPhone')}
              </ThemedText>
              <AddressWithDirections
                address={order.summary?.address || 
                         order.shipping_address_snapshot?.fullAddress || 
                         order.shipping_address_snapshot?.address_detail || 
                         order.address_id?.fullAddress || 
                         order.address}
                coordinates={order.shipping_address_snapshot?.coordinates || 
                           order.address_id?.coordinates}
                // Thêm props mới để hỗ trợ đầy đủ dữ liệu từ API
                orderCoordinates={order.shipping_address_snapshot?.coordinates ? {
                  coordinates: order.shipping_address_snapshot.coordinates.coordinates,
                  latitude: order.shipping_address_snapshot.latitude,
                  longitude: order.shipping_address_snapshot.longitude
                } : undefined}
                osmData={order.shipping_address_snapshot?.osm ? {
                  lat: order.shipping_address_snapshot.osm.lat,
                  lng: order.shipping_address_snapshot.osm.lng,
                  displayName: order.shipping_address_snapshot.osm.displayName
                } : undefined}
                showDirectionsButton={false}
                showCoordinatesInfo={true}
                style={styles.recipientAddress}
              />
            </View>
          </View>
        </View>

        {/* Thêm section thông tin địa điểm với bản đồ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <ThemedText style={styles.iconText}>🗺️</ThemedText>
            </View>
            <ThemedText style={styles.sectionTitle}>Thông tin địa điểm giao hàng</ThemedText>
          </View>
          
          <OrderMapView order={order} />
        </View>

        {/* Product List Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <ThemedText style={styles.iconText}>📋</ThemedText>
            </View>
            <ThemedText style={styles.sectionTitle}>{t('orders.productList')}</ThemedText>
          </View>
          
          {order.order_items && order.order_items.map((item: any, index: number) => (
            <View key={`product-${index}`} style={styles.productItem}>
              <ThemedText style={styles.productName}>
                {item.book_id?.title || item.title || t('orders.noProductName')}
              </ThemedText>
              <View style={styles.quantityContainer}>
                <ThemedText style={styles.productQuantity}>x{item.quantity || 1}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>{t('orders.paymentDetails')}</ThemedText>
          </View>
          
          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>{t('orders.orderId')}</ThemedText>
              <View style={styles.orderIdRow}>
                <ThemedText style={styles.orderIdText}>
                  {order.order_id || order._id}
                </ThemedText>
                <TouchableOpacity style={styles.copyButton} onPress={copyOrderId}>
                  <ThemedText style={styles.copyButtonText}>📋</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>{t('orders.status')}</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.order_status) }]}>
                <ThemedText style={styles.statusText}>
                  {getStatusDisplay(order.order_status)}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>
                {t('orders.subtotal', { count: order.order_items?.length || 0 })}
              </ThemedText>
              <ThemedText style={styles.paymentValue}>
                {(order.total_amount || 0).toLocaleString('vi-VN')}₫
              </ThemedText>
            </View>
            
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>{t('orders.shippingFee')}</ThemedText>
              <ThemedText style={styles.paymentValue}>
                {(order.ship_amount || 0).toLocaleString('vi-VN')}₫
              </ThemedText>
            </View>
            
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>{t('orders.discount')}</ThemedText>
              <ThemedText style={styles.paymentValue}>
                -{(order.discount_amount || 0).toLocaleString('vi-VN')}₫
              </ThemedText>
            </View>
            
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>{t('orders.paymentStatus')}</ThemedText>
              <ThemedText style={[styles.paymentStatus, { color: getPaymentStatusColor(order.payment_id?.payment_status) }]}>
                {getPaymentStatusDisplay(order.payment_id?.payment_status)}
              </ThemedText>
            </View>
            
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>{t('orders.paymentMethod')}</ThemedText>
              <ThemedText style={styles.paymentValue}>
                {getPaymentMethodDisplay(order.payment_id?.payment_method)}
              </ThemedText>
            </View>

            
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>{t('orders.totalAmount')}</ThemedText>
              <ThemedText style={styles.totalAmount}>
                {totalAmount.toLocaleString('vi-VN')}₫
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons - Chỉ hiện khi đơn hàng đã được nhận */}
      {order.order_status === 'OutForDelivery' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.returnButton} 
            onPress={handleReturnOrder}
            disabled={updating}
          >
            <ThemedText style={styles.returnButtonText}>{t('actions.markReturned')}</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.completeButton} 
            onPress={handleCompleteOrder}
            disabled={updating}
          >
            <View style={styles.completeButtonContent}>
              <ThemedText style={styles.completeButtonTextTop}>{t('actions.markDelivered')}</ThemedText>
              <ThemedText style={styles.completeButtonTextBottom}>{t('orders.order')}</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      )}

             {/* Thông báo khi đơn hàng chưa được nhận */}
       {order.order_status === 'AwaitingPickup' && (
         <View style={styles.infoMessage}>
           <ThemedText style={styles.infoMessageText}>
             {t('orders.orderNotAcceptedYet')}
           </ThemedText>
           <View style={styles.infoMessageNote}>
             <ThemedText style={styles.infoMessageNoteText}>
               ⚠️ {t('orders.functionsUnlockedAfterAccept')}
             </ThemedText>
           </View>
         </View>
       )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    flex: 1,
    textAlign: 'center',
  },
  locationButton: {
    padding: 8,
  },
  locationButtonText: {
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#f00',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  orderInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  orderId: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
    flex: 1,
  },
  recipientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  recipientPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recipientAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  recipientCountry: {
    fontSize: 14,
    color: '#666',
  },
  recipientActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  actionButtonDisabled: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    opacity: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  actionButtonText: {
    fontSize: 16,
  },
  actionButtonTextDisabled: {
    fontSize: 16,
    opacity: 0.5,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  quantityContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  productQuantity: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  sizeBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  sizeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },

  paymentDetails: {
    marginTop: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2196F3',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 4,
  },
  copyButtonText: {
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  returnButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  returnButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  completeButtonContent: {
    alignItems: 'center',
  },
  completeButtonTextTop: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  completeButtonTextBottom: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  infoMessage: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
     infoMessageText: {
     color: '#1976D2',
     fontSize: 14,
     textAlign: 'center',
     lineHeight: 20,
   },
   infoMessageNote: {
     marginTop: 8,
     paddingTop: 8,
     borderTopWidth: 1,
     borderTopColor: '#bbdefb',
   },
   infoMessageNoteText: {
     color: '#FF9800',
     fontSize: 12,
     textAlign: 'center',
     lineHeight: 16,
     fontStyle: 'italic',
   },

});
