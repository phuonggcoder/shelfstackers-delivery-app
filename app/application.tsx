import BottomTabs from '@/components/BottomTabs';
import { useAuth } from '@/lib/auth';
import { shipperApi } from '@/lib/shipperApi';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function Application() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'orders' | 'profile'>('orders');

  useEffect(() => {
    let mounted = true;
    // Poll every 6 seconds (short enough for demo); stop when verified
    const check = async () => {
      try {
        // refreshUser will update context, but to avoid re-creating this effect when
        // context.user changes we fetch the latest user directly from the API here.
        await refreshUser();
        if (!mounted) return;
        const latest = await shipperApi.getCurrentUser();
        if (!mounted) return;
        if (latest && latest.shipper_verified === true) {
          clearInterval(id);
          router.replace('/shipper/orders');
        }
      } catch {
        // ignore
      }
    };

    const id = setInterval(check, 6000);
    // also run immediately
    check();
    return () => { mounted = false; clearInterval(id); };
  }, [refreshUser, router]);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="time-outline" size={60} color="#4A90E2" />
          </View>
        </View>

        <Text style={styles.title}>Đang chờ xét duyệt</Text>
        
        <Text style={styles.message}>
          Vui lòng đợi xét duyệt hồ sơ của bạn
        </Text>

        <Text style={styles.description}>
          Hồ sơ đăng ký của bạn đã được gửi đến admin để xem xét. 
          Bạn sẽ nhận được thông báo ngay khi được chấp thuận.
        </Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>Hồ sơ đã được gửi thành công</Text>
          </View>
          
          <View style={styles.infoItem}>
              <Ionicons name="time" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>Đang chờ admin xét duyệt</Text>
          </View>
          
          <View style={styles.infoItem}>
              <Ionicons name="notifications" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>Bạn sẽ nhận thông báo khi có kết quả</Text>
          </View>
        </View>
      </View>

      {/* Bottom Navigation Tabs */}

      <BottomTabs 
        activeTab="profile"
        onTabPress={(tab) => {
          if (tab === 'profile') {
            router.replace('/profile');
          } else if (tab === 'orders') {
            router.replace('/application');
          }

        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 80,
    paddingBottom: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 12,
    flex: 1,
  },

});
