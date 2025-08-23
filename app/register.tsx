import { useAuth } from '@/lib/auth';
import { shipperApi } from '@/lib/shipperApi';
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

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone_number: '',
    gender: 'other',
    roles: ['shipper']
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (formData.phone_number && formData.phone_number.length < 10) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await shipperApi.register({
        username: formData.username || undefined,
        email: formData.email.toLowerCase(),
        password: formData.password,
        full_name: formData.full_name || undefined,
        phone_number: formData.phone_number || undefined,
        gender: formData.gender || undefined,
        roles: formData.roles
      });

      if (response.access_token) {
        // Debug: Log response để kiểm tra
        console.log('=== DEBUG REGISTER RESPONSE ===');
        console.log('Full response:', response);
        console.log('User object:', response.user);
        console.log('User roles:', response.user?.roles);
        console.log('Shipper verified:', response.user?.shipper_verified);
        console.log('================================');
        
        // Kiểm tra xem shipper đã được xét duyệt chưa
        if (response.user && response.user.roles && response.user.roles.includes('shipper')) {
          // Nếu là shipper, kiểm tra trạng thái xét duyệt
          // Mặc định shipper mới đăng ký sẽ chưa được xét duyệt
          const isShipperVerified = response.user.shipper_verified === true;
          
          if (!isShipperVerified) {
            // Chưa được xét duyệt, chuyển đến trang chờ
            console.log('Shipper chưa được xét duyệt, chuyển đến trang chờ');
            
            await signIn({
              token: response.access_token,
              refreshToken: response.refresh_token,
              user: response.user
            });
            
            Alert.alert(
              'Đăng ký thành công!', 
              'Tài khoản shipper của bạn đã được tạo. Vui lòng đợi admin xét duyệt.',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/application')
                }
              ]
            );
          } else {
            // Đã được xét duyệt, vào giao diện chính
            console.log('Shipper đã được xét duyệt, vào giao diện chính');
            
            await signIn({
              token: response.access_token,
              refreshToken: response.refresh_token,
              user: response.user
            });

            Alert.alert(
              'Thành công', 
              'Tài khoản đã được tạo và đăng nhập thành công!',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(tabs)')
                }
              ]
            );
          }
        } else {
          // Không phải shipper, xử lý bình thường
          console.log('Không phải shipper, xử lý bình thường');
          
          await signIn({
            token: response.access_token,
            refreshToken: response.refresh_token,
            user: response.user
          });

          Alert.alert(
            'Thành công', 
            'Tài khoản đã được tạo và đăng nhập thành công!',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(tabs)')
              }
            ]
          );
        }
      } else {
        Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      
      if (error.message) {
        if (error.message.includes('Email already exists')) {
          errorMessage = 'Email đã tồn tại. Vui lòng sử dụng email khác hoặc đăng nhập.';
        } else if (error.message.includes('Username already exists')) {
          errorMessage = 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      {/* Logo và tên ứng dụng */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/ShelfStackerDelivery.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.pageTitle}>Đăng ký tài khoản</Text>
      </View>

      {/* Form đăng ký */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email *</Text>
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
          <Text style={styles.inputLabel}>Mật khẩu *</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Xác nhận mật khẩu *</Text>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            value={formData.full_name}
            onChangeText={(value) => handleInputChange('full_name', value)}
            placeholder="Nhập họ và tên đầy đủ"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={formData.phone_number}
            onChangeText={(value) => handleInputChange('phone_number', value)}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Giới tính</Text>
          <View style={styles.genderContainer}>
            {['male', 'female', 'other'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderOption,
                  formData.gender === gender && styles.genderOptionSelected
                ]}
                onPress={() => handleInputChange('gender', gender)}
              >
                <Text style={[
                  styles.genderOptionText,
                  formData.gender === gender && styles.genderOptionTextSelected
                ]}>
                  {gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.registerButton, loading && styles.disabledButton]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.registerButtonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={goToLogin}>
          <Text style={styles.loginLinkText}>
            Đã có tài khoản? <Text style={styles.loginLinkTextBold}>Đăng nhập</Text>
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
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  genderOptionText: {
    fontSize: 14,
    color: '#666',
  },
  genderOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  registerButton: {
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
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 16,
    color: '#666',
  },
  loginLinkTextBold: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});
