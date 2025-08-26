import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import EmailOTPVerification from './EmailOTPVerification';
const { useState } = React;

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone_number: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone_number: '',
  });
  
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  const handleChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Họ tên là bắt buộc';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const registrationData = {
        email: formData.email.toLowerCase(),
        password: formData.password,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        roles: ['shipper'],
      };

      const response = await fetch('https://server-shelf-stacker-w1ds.onrender.com/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();
      console.log('Registration response:', data);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Data user:', data.user);
      console.log('Data requiresVerification:', data.requiresVerification);

      // Debug chi tiết
      console.log('=== DEBUG REGISTRATION ===');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('Has user:', !!data.user);
      console.log('Has requiresVerification:', !!data.requiresVerification);
      console.log('Condition 1 (response.ok):', response.ok);
      console.log('Condition 2 (status === 201):', response.status === 201);
      console.log('Final condition:', response.ok || response.status === 201);
      
      // Kiểm tra cả response.ok và status code
      if (response.ok || response.status === 201) {
        console.log('✅ Registration successful, data:', data);
        
        // Kiểm tra nếu có user object hoặc requiresVerification
        if (data.user || data.requiresVerification) {
          console.log('✅ Has user or requiresVerification');
          const userData = data.user || { id: data.userId || data.id, email: formData.email };
          console.log('✅ User data:', userData);
          setRegisteredUser(userData);
          
          console.log('✅ About to show success alert');
          try {
            Alert.alert(
              'Đăng ký thành công!',
              'Mã xác thực OTP đã được gửi đến email của bạn. Sau khi xác thực, hồ sơ của bạn sẽ được gửi đến admin để xét duyệt.',
              [
                {
                  text: 'Xác thực ngay',
                  onPress: () => {
                    console.log('✅ Setting showOTP to true, registeredUser:', userData);
                    setShowOTP(true);
                  },
                },
              ]
            );
            console.log('✅ Success alert shown');
          } catch (error) {
            console.error('❌ Error showing alert:', error);
          }
        } else {
          console.log('❌ No user or requiresVerification');
          // Nếu không có user hoặc requiresVerification, coi như lỗi
          Alert.alert('Lỗi', 'Đăng ký thành công nhưng không nhận được thông tin xác thực. Vui lòng thử lại.');
        }
      } else {
        console.log('❌ Registration failed - response not ok and status not 201');
        if (data.message?.includes('Google account')) {
          Alert.alert(
            'Email đã tồn tại',
            'Email này đã được sử dụng với tài khoản Google. Vui lòng đăng nhập bằng Google.',
            [{ text: 'OK' }]
          );
        } else if (data.message?.includes('SMS account')) {
          Alert.alert(
            'Email đã tồn tại',
            'Email này đã được sử dụng với tài khoản SMS. Vui lòng đăng nhập bằng SMS.',
            [{ text: 'OK' }]
          );
        } else if (data.message?.includes('Email already exists')) {
          Alert.alert(
            'Email đã tồn tại',
            'Email này đã được sử dụng. Vui lòng đăng nhập hoặc đặt lại mật khẩu.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Lỗi', data.message || 'Không thể đăng ký tài khoản. Vui lòng thử lại.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.');
    } finally {
      setIsLoading(false);
    }
  };



  const handleVerificationSuccess = (userData: any) => {
    setShowOTP(false);
    
    Alert.alert(
      'Xác thực thành công!',
      'Tài khoản của bạn đã được xác thực. Hồ sơ đăng ký làm shipper đã được gửi đến admin để xét duyệt. Bạn sẽ nhận được thông báo khi được chấp thuận.',
              [
          {
            text: 'Đăng nhập ngay',
            onPress: () => router.push('/login'),
          },
          {
            text: 'Đóng',
            style: 'cancel',
          },
        ]
    );
  };

  const handleSendOTP = async () => {
    try {
      const response = await fetch('https://server-shelf-stacker-w1ds.onrender.com/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email.toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Thành công', 'Mã OTP mới đã được gửi đến email của bạn');
      } else {
        throw new Error(data.message || 'Không thể gửi OTP');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      console.log('🔍 === DEBUG VERIFY OTP API ===');
      console.log('🔍 Calling API:', 'https://server-shelf-stacker-w1ds.onrender.com/api/users/verify-email-otp');
      console.log('🔍 Request body:', { email: formData.email.toLowerCase(), otp: otp, password: '***' });

      const response = await fetch('https://server-shelf-stacker-w1ds.onrender.com/api/users/verify-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          otp: otp,
          password: formData.password, // Thêm password theo yêu cầu backend
        }),
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

      // Kiểm tra content-type trước khi parse JSON
      const contentType = response.headers.get('content-type');
      console.log('🔍 Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        // Nếu không phải JSON, đọc text để debug
        const textResponse = await response.text();
        console.error('❌ Non-JSON response received:');
        console.error('❌ Status:', response.status);
        console.error('❌ Content-Type:', contentType);
        console.error('❌ Response text:', textResponse);
        throw new Error(`Server trả về response không phải JSON. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ JSON response parsed successfully:', data);

      if (response.ok && data.success) {
        console.log('✅ OTP verification successful');
        return data;
      } else {
        console.log('❌ OTP verification failed:', data.message);
        throw new Error(data.message || 'Mã OTP không đúng');
      }
    } catch (error: any) {
      console.error('❌ Error in handleVerifyOTP:', error);
      if (error.name === 'SyntaxError') {
        console.error('❌ JSON Parse Error - Server returned non-JSON response');
        throw new Error('Lỗi kết nối server. Vui lòng thử lại sau.');
      }
      throw error;
    }
  };

  if (showOTP && registeredUser) {
    return (
      <EmailOTPVerification
        email={formData.email}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={() => setShowOTP(false)}
        type="registration"
        onResendOTP={handleSendOTP}
        onVerifyOTP={handleVerifyOTP}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.placeholder} />
            <View style={styles.placeholder} />
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/ShelfStackerDelivery.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Đăng ký tài khoản Shipper</Text>
            <Text style={styles.description}>
              Điền thông tin để đăng ký làm shipper
            </Text>

            {/* Registration Form */}
            <View style={styles.form}>
              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(value) => handleChange('email', value)}
                    placeholder="Nhập email của bạn"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mật khẩu *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(value) => handleChange('password', value)}
                    placeholder="Nhập mật khẩu"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleChange('confirmPassword', value)}
                    placeholder="Nhập lại mật khẩu"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              {/* Full Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Họ tên *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    value={formData.full_name}
                    onChangeText={(value) => handleChange('full_name', value)}
                    placeholder="Nhập họ tên đầy đủ"
                    autoCapitalize="words"
                  />
                </View>
                {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
              </View>

              {/* Phone Number */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Số điện thoại *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    value={formData.phone_number}
                    onChangeText={(value) => handleChange('phone_number', value)}
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.phone_number && <Text style={styles.errorText}>{errors.phone_number}</Text>}
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  isLoading && styles.registerButtonDisabled
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color="#fff" />
                    <Text style={styles.registerButtonText}>
                      Đăng ký
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Đã có tài khoản?
                </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.loginLink}>
                    Đăng nhập ngay
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 4,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  registerButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
