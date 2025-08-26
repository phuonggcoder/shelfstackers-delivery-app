import { useAuth } from '@/lib/auth';
import { shipperApi } from '@/lib/shipperApi';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useState } from 'react';
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

export default function Login() {
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
        // Debug: Log response để kiểm tra
        console.log('=== DEBUG LOGIN RESPONSE ===');
        console.log('Full response:', response);
        console.log('User object:', response.user);
        console.log('User roles:', response.user?.roles);
        console.log('Shipper verified:', response.user?.shipper_verified);
        console.log('================================');
        
        // Persist tokens first
        await signIn({
          token: response.access_token,
          refreshToken: response.refresh_token,
          user: response.user
        });

        // Fetch fresh profile from API (ensure we have up-to-date shipper flags)
        let freshUser = null;
        try {
          freshUser = await shipperApi.getCurrentUser();
        } catch (e) {
          // Fallback to server response if /me fails
          freshUser = response.user;
        }

        const isShipper = Array.isArray(freshUser?.roles) && freshUser.roles.includes('shipper');
        const isShipperVerified = !!freshUser?.shipper_verified;

        if (isShipper) {
          if (!isShipperVerified) {
            // Shipper but not verified -> go to application/waiting screen
            console.log('Shipper not verified, redirecting to application');
            router.replace('/application');
          } else {
            // Verified shipper -> redirect to shipper orders
            console.log('Verified shipper, redirecting to orders');
            router.replace('/(tabs)/shipper/orders');
          }
        } else {
          // Không cho phép user thường vào ứng dụng - đây là app shipper
          console.log('Regular user not allowed - this is a shipper app');
          Alert.alert(
            'Không thể đăng nhập',
            'Ứng dụng này chỉ dành cho shipper. Tài khoản của bạn không có quyền truy cập.',
            [
              {
                text: 'Đăng xuất',
                onPress: async () => {
                  // Đăng xuất user
                  await signIn({ token: '', refreshToken: '', user: null });
                  // Reset form
                  setFormData({ email: '', password: '' });
                }
              }
            ]
          );
        }
      } else {
        Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
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
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />

        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/ShelfStackerDelivery.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.pageTitle}>Đăng nhập</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Nhập email của bạn"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="Nhập mật khẩu"
                secureTextEntry
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#667eea" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerLink} onPress={goToRegister}>
            <Text style={styles.registerLinkText}>
              Chưa có tài khoản? <Text style={styles.registerLinkTextBold}>Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
    color: '#fff',
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
    color: '#fff',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
    color: '#fff',
  },
  loginButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '600',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  registerLinkTextBold: {
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
