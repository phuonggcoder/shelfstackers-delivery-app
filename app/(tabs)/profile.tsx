import { useAuth } from '@/lib/auth';
import { API_ENDPOINTS, APP_CONFIG } from '@/lib/config';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  
  // State cho thống kê shipper
  const [deliveredOrders, setDeliveredOrders] = React.useState(0);
  const [averageRating, setAverageRating] = React.useState(0);
  const [loadingStats, setLoadingStats] = React.useState(true);

  // Dữ liệu mẫu người dùng
  const sampleUser = {
    username: 'sampleuser',
    email: 'sample@example.com',
    full_name: 'Nguyễn Văn A',
    phone_number: '0912345678',
    gender: 'male',
    roles: ['user'],
    avatar: 'https://i.imgur.com/8Km9tLL.png',
  };

  // Dùng user từ context nếu có, nếu không dùng sampleUser
  const displayUser = user || sampleUser;

  // Hàm fetch thống kê từ API
  const fetchShipperStats = React.useCallback(async () => {
    try {
      setLoadingStats(true);
      
      // Gọi API từ shipperRouter.js để lấy thống kê đơn hàng đã hoàn thành
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.GET_COMPLETED_ORDERS}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response Status:', response.status);
        console.log('Full API Response:', data);
        
        if (data.stats) {
          console.log('Stats data:', data.stats);
          
          // Cập nhật số đơn hàng đã hoàn thành
          const completedCount = data.stats.total_completed_orders || 0;
          console.log('Setting completed orders to:', completedCount);
          setDeliveredOrders(completedCount);
          
          // Cập nhật rating trung bình
          const avgRating = data.stats.average_rating || 0;
          console.log('Setting average rating to:', avgRating);
          setAverageRating(parseFloat(avgRating));
          
          console.log('Total rated orders:', data.stats.total_rated_orders);
          console.log('Rating percentage:', data.stats.rating_percentage);
        } else {
          console.log('API response missing stats data');
          setDeliveredOrders(0);
          setAverageRating(0);
        }
      } else {
        console.log('API request failed with status:', response.status);
        setDeliveredOrders(0);
        setAverageRating(0);
      }
    } catch (error) {
      console.error('Error in fetchShipperStats:', error);
      // Fallback về số liệu mặc định
      setDeliveredOrders(0);
      setAverageRating(0);
    } finally {
      setLoadingStats(false);
    }
  }, [user?.token]);

  // Fetch thống kê shipper khi component mount
  React.useEffect(() => {
    if (user && user.roles && user.roles.includes('shipper')) {
      fetchShipperStats();
    } else {
      setLoadingStats(false);
    }
  }, [user, fetchShipperStats]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loadingStats}
            onRefresh={fetchShipperStats}
            colors={['#4A90E2']}
            tintColor="#4A90E2"
          />
        }
      >
        {/* Tiêu đề trên cùng */}
        <Text style={styles.topTitle}>{t('profile.title')}</Text>
        {/* Avatar lớn và căn giữa */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: displayUser.avatar || sampleUser.avatar }} style={styles.avatarLarge} />
          <Text style={styles.profileFullName}>{displayUser.full_name}</Text>
        </View>

        {/* Thống kê - Số đơn hàng và đánh giá */}
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Thống kê hoạt động</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={fetchShipperStats}
            disabled={loadingStats}
          >
            <Text style={styles.refreshButtonText}>
              {loadingStats ? '🔄' : '🔄'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📦</Text>
            </View>
            <View style={styles.statContent}>
              {loadingStats ? (
                <Text style={styles.statNumber}>...</Text>
              ) : (
                <Text style={styles.statNumber}>{deliveredOrders}</Text>
              )}
              <Text style={styles.statLabel}>Đơn hàng đã hoàn thành</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>⭐</Text>
            </View>
            <View style={styles.statContent}>
              {loadingStats ? (
                <Text style={styles.statNumber}>...</Text>
              ) : (
                <Text style={styles.statNumber}>{averageRating.toFixed(1)}</Text>
              )}
              <Text style={styles.statLabel}>Đánh giá trung bình</Text>
            </View>
          </View>
        </View>

        {/* Tùy chọn */}
        <Text style={styles.sectionTitle}>{t('profile.options')}</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() =>
              router.push({
                pathname: '/editprofile',
                params: {
                  full_name: displayUser.full_name,
                  phone_number: displayUser.phone_number,
                  avatar: displayUser.avatar,
                  gender: displayUser.gender,
                },
              })
            }
          >
            <FontAwesome name="user" size={20} color="#4A90E2" style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>{t('profile.updateAccount')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => router.push('/profile-detail')}
          >
            <MaterialIcons name="info" size={20} color="#4A90E2" style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>{t('profile.personalInfo')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => router.push('/changepassword')}
          >
            <Ionicons name="key" size={20} color="#4A90E2" style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>{t('profile.changePassword')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => router.push('/language')}
          >
            <FontAwesome name="language" size={20} color="#4A90E2" style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>{t('profile.changeLanguage')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={async () => {
            await signOut();
            router.replace('/login');
          }}>
            <MaterialIcons name="logout" size={20} color="#4A90E2" style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 0,
    color: '#222',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
  },
  refreshButtonText: {
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4A90E2',
    marginBottom: 12,
  },
  profileFullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  topTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  optionsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
});
