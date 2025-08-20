import { useAuth } from '@/lib/auth';
import { shipperApi } from '@/lib/shipperApi';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ShipperLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const response = await shipperApi.login(formData.email, formData.password);
      
      if (response.access_token) {
        // Kiểm tra xem user có role shipper không
        if (response.user && response.user.roles && response.user.roles.includes('shipper')) {
          await signIn({
            token: response.access_token,
            refreshToken: response.refresh_token,
            user: response.user
          });

          Alert.alert(
            'Thành công',
            'Đăng nhập shipper thành công!',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(tabs)/shipper')
              }
            ]
          );
        } else {
          Alert.alert('Lỗi', 'Tài khoản này không có quyền shipper. Vui lòng sử dụng tài khoản khác.');
        }
      } else {
        Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (error: any) {
      console.error('Shipper login error:', error);
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';

      if (error.message) {
        if (error.message.includes('Invalid email or password')) {
          errorMessage = 'Email hoặc mật khẩu không chính xác.';
        } else if (error.message.includes('account has been locked')) {
          errorMessage = 'Tài khoản đã bị khóa. Vui lòng liên hệ admin.';
        } else if (error.message.includes('Google or SMS')) {
          errorMessage = 'Tài khoản này được tạo bằng Google hoặc SMS. Vui lòng sử dụng phương thức đăng nhập phù hợp.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    router.push('/register');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/ShelfStackerDelivery.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.pageTitle}>Đăng nhập Shipper</Text>
        <Text style={styles.pageSubtitle}>Đăng nhập để quản lý đơn hàng</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Nhập email của bạn"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Nhập mật khẩu"
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Đăng nhập Shipper</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerLink} onPress={goToRegister}>
          <Text style={styles.registerLinkText}>
            Chưa có tài khoản? <Text style={styles.registerLinkTextBold}>Đăng ký ngay</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 16,
    color: '#666',
  },
  registerLinkTextBold: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});
