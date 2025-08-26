import { useAuth } from '@/lib/auth';
import { shipperApi } from '@/lib/shipperApi';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const auth = useAuth(); // Lấy toàn bộ auth object
  const { user, signOut } = auth; // Destructure từ auth
  const router = useRouter();
  const { t } = useTranslation();
  
  // Debug auth object để tìm token
  console.log('=== AUTH DEBUG ===');
  console.log('Auth object:', auth);
  console.log('Auth keys:', Object.keys(auth));
  console.log('User from destructure:', user);
  
  // Tìm token trong auth object
  const token = auth.token; // Sử dụng field token chính xác
  console.log('🔑 Found token:', !!token);
  console.log('🔑 Token value:', token);
  
  // State cho thống kê shipper
  const [deliveredOrders, setDeliveredOrders] = React.useState(0);
  const [averageRating, setAverageRating] = React.useState(0);
  const [loadingStats, setLoadingStats] = React.useState(false);


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
    setLoadingStats(true);
    try {
      console.log('🔄 Fetching shipper stats...');
      const response = await shipperApi.getShipperStats();
      console.log('📊 API Response:', response);
      
      if (response && response.stats) {
        const stats = response.stats;
        const completedOrders = stats.total_completed_orders || 0;
        const avgRating = stats.average_rating || 0;
        
        console.log('✅ Setting stats:', { completedOrders, avgRating });
        setDeliveredOrders(completedOrders);
        setAverageRating(parseFloat(avgRating.toString()));
      } else {
        console.log('⚠️ No stats in response, using defaults');
        setDeliveredOrders(0);
        setAverageRating(0);
      }
    } catch (error) {
      console.error('❌ Error fetching shipper stats:', error);
      // Luôn set giá trị mặc định khi có lỗi
      setDeliveredOrders(0);
      setAverageRating(0);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch thống kê khi component mount
  React.useEffect(() => {
    if (user && user.roles && user.roles.includes('shipper')) {
      shipperApi.setToken(token);
      fetchShipperStats();
    }
  }, [user, token, fetchShipperStats]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.statsTitle}>{t('profile.activityStats')}</Text>
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
              <Text style={styles.statLabel}>{t('profile.completedRequests')}</Text>
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
              <Text style={styles.statLabel}>{t('profile.averageRating')}</Text>
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
  statsHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 30,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  statLabel: {
    fontSize: 11,
    color: '#4A90E2',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 13,
    fontWeight: '500',
  },
});
