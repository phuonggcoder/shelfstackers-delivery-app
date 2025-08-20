import { useAuth } from '@/lib/auth';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function Splash() {
  const router = useRouter();
  const { token, user, loading } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => {
      if (!loading) {
        if (token && user) {
          // Kiểm tra nếu là shipper chưa được xét duyệt
          if (user.roles && user.roles.includes('shipper')) {
            // Mặc định shipper chưa được xét duyệt nếu không có trường này
            const isShipperVerified = user.shipper_verified === true;
            
            if (!isShipperVerified) {
              console.log('Splash: Shipper chưa được xét duyệt, chuyển đến trang chờ');
              router.replace('/application');
            } else {
              console.log('Splash: Shipper đã được xét duyệt, vào trang đơn hàng shipper');
              router.replace('/shipper-orders');
            }
          } else {
            console.log('Splash: Không phải shipper, vào giao diện chính');
            router.replace('/(tabs)');
          }
        } else {
          console.log('Splash: Chưa đăng nhập, chuyển đến login');
          router.replace('/login');
        }
      }
    }, 1400);
    return () => clearTimeout(t);
  }, [loading, token, user, router]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/ShelfStackerDelivery.png')} style={{ width: 140, height: 140 }} />
      <Text style={styles.title}>ShelfStacker Delivery</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }, title: { marginTop: 12, fontSize: 20, fontWeight: '700' } });
