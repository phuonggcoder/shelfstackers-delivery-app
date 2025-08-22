import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { shipperApi } from '@/lib/shipperApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function OrderDetail() {
  const params = useLocalSearchParams();
  const id = String(params.id || params.orderId || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

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
        Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
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
        <ThemedText style={styles.loadingText}>Đang tải thông tin đơn hàng...</ThemedText>
      </ThemedView>
    );
  }

  if (!order) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText style={styles.errorText}>Không tìm thấy đơn hàng</ThemedText>
      </ThemedView>
    );
  }

  // Get order status display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Pending': return 'Chờ xử lý';
      case 'AwaitingPickup': return 'Chờ lấy hàng';
      case 'OutForDelivery': return 'Đang giao hàng';
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
      case 'Completed': return 'Đã thanh toán';
      case 'Pending': return 'Chưa thanh toán';
      case 'Processing': return 'Đang xử lý';
      case 'Failed': return 'Thanh toán thất bại';
      default: return 'Chưa thanh toán';
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
    switch (method) {
      case 'COD': return 'Tiền mặt';
      case 'ZaloPay': return 'ZaloPay';
      case 'PayOS': return 'PayOS';
      default: return 'Tiền mặt';
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

  // Handle cancel order
  const handleCancelOrder = () => {
    Alert.alert(
      'Xác nhận hủy đơn hàng',
      'Bạn có chắc muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Có', onPress: () => cancelOrder() }
      ]
    );
  };

  // Handle complete order
  const handleCompleteOrder = () => {
    Alert.alert(
      'Xác nhận hoàn thành',
      'Bạn có chắc muốn đánh dấu đơn hàng này là hoàn thành?',
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Có', onPress: () => completeOrder() }
      ]
    );
  };

  // Cancel order function
  const cancelOrder = async () => {
    setUpdating(true);
    try {
      await shipperApi.updateStatus(id, { order_status: 'Cancelled' });
      Alert.alert('Thành công', 'Đã hủy đơn hàng');
      router.back();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể hủy đơn hàng');
    } finally {
      setUpdating(false);
    }
  };

  // Complete order function
  const completeOrder = async () => {
    setUpdating(true);
    try {
      await shipperApi.updateStatus(id, { order_status: 'Delivered' });
      Alert.alert('Thành công', 'Đã hoàn thành đơn hàng');
      router.back();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể hoàn thành đơn hàng');
    } finally {
      setUpdating(false);
    }
  };

  // Copy order ID to clipboard
  const copyOrderId = () => {
    // In a real app, you'd use Clipboard API
    Alert.alert('Thông báo', 'Đã sao chép mã đơn hàng');
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
      Alert.alert('Lỗi', 'Không tìm thấy số điện thoại hợp lệ');
      return;
    }

    try {
      // Check if phone app can be opened
      const canOpen = await Linking.canOpenURL(`tel:${phoneNumber}`);
      
      if (canOpen) {
        await Linking.openURL(`tel:${phoneNumber}`);
      } else {
        Alert.alert('Lỗi', 'Không thể mở ứng dụng điện thoại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi');
    }
  };

  // Message recipient
  const messageRecipient = async () => {
    const phoneNumber = getValidPhoneNumber();
    
    if (!phoneNumber) {
      Alert.alert('Lỗi', 'Không tìm thấy số điện thoại hợp lệ');
      return;
    }

    try {
      // Check if SMS app can be opened
      const canOpen = await Linking.canOpenURL(`sms:${phoneNumber}`);
      
      if (canOpen) {
        await Linking.openURL(`sms:${phoneNumber}`);
      } else {
        Alert.alert('Lỗi', 'Không thể mở ứng dụng tin nhắn');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể mở ứng dụng tin nhắn');
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
        <ThemedText style={styles.headerTitle}>Chi tiết đơn hàng</ThemedText>
        <TouchableOpacity style={styles.locationButton}>
          <ThemedText style={styles.locationButtonText}>📍</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recipient Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <ThemedText style={styles.iconText}>📍</ThemedText>
            </View>
            <ThemedText style={styles.sectionTitle}>Người nhận</ThemedText>
            <View style={styles.recipientActions}>
              <TouchableOpacity 
                style={[styles.actionButton, !getValidPhoneNumber() && styles.actionButtonDisabled]} 
                onPress={callRecipient}
                disabled={!getValidPhoneNumber()}
              >
                <ThemedText style={[styles.actionButtonText, !getValidPhoneNumber() && styles.actionButtonTextDisabled]}>
                  📞
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, !getValidPhoneNumber() && styles.actionButtonDisabled]} 
                onPress={messageRecipient}
                disabled={!getValidPhoneNumber()}
              >
                <ThemedText style={[styles.actionButtonText, !getValidPhoneNumber() && styles.actionButtonTextDisabled]}>
                  ✉️
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.recipientInfo}>
            <View style={styles.recipientDetails}>
              <ThemedText style={styles.recipientName}>
                {order.user_id?.full_name || 
                 order.shipping_address_snapshot?.receiver_name || 
                 order.recipient || 
                 'Không có tên'}
              </ThemedText>
              <ThemedText style={styles.recipientPhone}>
                {getValidPhoneNumber() || 'Không có số điện thoại'}
              </ThemedText>
              <ThemedText style={styles.recipientAddress}>
                {order.summary?.address || 
                 order.shipping_address_snapshot?.fullAddress || 
                 order.shipping_address_snapshot?.address_detail || 
                 order.address_id?.fullAddress || 
                 order.address || 
                 'Không có địa chỉ'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Product List Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <ThemedText style={styles.iconText}>📋</ThemedText>
            </View>
            <ThemedText style={styles.sectionTitle}>Danh sách sản phẩm</ThemedText>
          </View>
          
          {order.order_items && order.order_items.map((item: any, index: number) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productImage}>
                <ThemedText style={styles.productImageText}>🍵</ThemedText>
              </View>
              
              <View style={styles.productInfo}>
                <View style={styles.productDetails}>
                  <ThemedText style={styles.productQuantity}>x{item.quantity || 1}</ThemedText>
                  <ThemedText style={styles.productName}>
                    {item.book_id?.title || item.title || 'Không có tên sản phẩm'}
                  </ThemedText>
                </View>
                
                <ThemedText style={styles.productPrice}>
                  {(item.price || 0).toLocaleString('vi-VN')}₫
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Chi tiết thanh toán</ThemedText>
          </View>
          
          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Mã đơn hàng</ThemedText>
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
              <ThemedText style={styles.paymentLabel}>Trạng thái đơn hàng</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.order_status) }]}>
                <ThemedText style={styles.statusText}>
                  {getStatusDisplay(order.order_status)}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>
                Tạm tính ({order.order_items?.length || 0} sản phẩm)
              </ThemedText>
              <ThemedText style={styles.paymentValue}>
                {(order.total_amount || 0).toLocaleString('vi-VN')}₫
              </ThemedText>
            </View>
            
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Phí giao hàng</ThemedText>
              <ThemedText style={styles.paymentValue}>
                {(order.ship_amount || 0).toLocaleString('vi-VN')}₫
              </ThemedText>
            </View>
            
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Giảm giá</ThemedText>
              <ThemedText style={styles.paymentValue}>
                -{(order.discount_amount || 0).toLocaleString('vi-VN')}₫
              </ThemedText>
            </View>
            
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Trạng thái thanh toán</ThemedText>
              <ThemedText style={[styles.paymentStatus, { color: getPaymentStatusColor(order.payment_id?.payment_status) }]}>
                {getPaymentStatusDisplay(order.payment_id?.payment_status)}
              </ThemedText>
            </View>
            
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Phương thức thanh toán</ThemedText>
              <ThemedText style={styles.paymentValue}>
                {getPaymentMethodDisplay(order.payment_method)}
              </ThemedText>
            </View>
            
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Tổng tiền</ThemedText>
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
            style={styles.cancelButton} 
            onPress={handleCancelOrder}
            disabled={updating}
          >
            <ThemedText style={styles.cancelButtonText}>Hủy đơn hàng</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.completeButton} 
            onPress={handleCompleteOrder}
            disabled={updating}
          >
            <View style={styles.completeButtonContent}>
              <ThemedText style={styles.completeButtonTextTop}>Hoàn thành</ThemedText>
              <ThemedText style={styles.completeButtonTextBottom}>đơn hàng</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Thông báo khi đơn hàng chưa được nhận */}
      {order.order_status === 'AwaitingPickup' && (
        <View style={styles.infoMessage}>
          <ThemedText style={styles.infoMessageText}>
            Đơn hàng này chưa được nhận. Vui lòng quay lại trang danh sách để nhận đơn hàng.
          </ThemedText>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productImageText: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
  },
  productQuantity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
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
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
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
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
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
});
