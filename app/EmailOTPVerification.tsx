import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EmailOTPVerificationProps {
  email: string;
  onVerificationSuccess: (userData: any) => void;
  onBack: () => void;
  type: 'registration' | 'login' | 'password_reset';
  onResendOTP: () => Promise<void>;
  onVerifyOTP: (otp: string) => Promise<any>;
}

const { width } = Dimensions.get('window');

export default function EmailOTPVerification({
  email,
  onVerificationSuccess,
  onBack,
  type,
  onResendOTP,
  onVerifyOTP,
}: EmailOTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 phút
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [error, setError] = useState('');

  const inputRefs = useRef<TextInput[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Tự động gửi OTP khi component mount
    const autoSendOTP = async () => {
      try {
        await onResendOTP();
        setCountdown(300);
        setCanResend(false);
        setResendCount(prev => prev + 1);
      } catch (error: any) {
        setError(error.message || 'Không thể gửi OTP');
      }
    };
    
    autoSendOTP();
    
    // Animation fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    setIsLoading(true);
    setError('');
    try {
      await onResendOTP();
      setCountdown(300);
      setCanResend(false);
      setResendCount(prev => prev + 1);
    } catch (error: any) {
      setError(error.message || 'Không thể gửi OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || resendCount >= 3) return;
    await handleSendOTP();
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 số OTP');
      return;
    }

    console.log('🔍 === DEBUG OTP VERIFICATION ===');
    console.log('🔍 OTP entered:', otpString);
    console.log('🔍 Email:', email);
    console.log('🔍 Calling onVerifyOTP...');

    setIsLoading(true);
    setError('');
    try {
      const result = await onVerifyOTP(otpString);
      console.log('✅ OTP verification successful:', result);
      onVerificationSuccess(result);
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      setError(error.message || 'Mã OTP không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động chuyển sang ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Xóa lỗi khi user bắt đầu nhập
    if (error) setError('');
  };

  const handleKeyPress = (e: any, index: number) => {
    // Xử lý phím backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTitle = () => {
    switch (type) {
      case 'registration':
        return 'Xác thực Email';
      case 'login':
        return 'Đăng nhập bằng OTP';
      case 'password_reset':
        return 'Đặt lại mật khẩu';
      default:
        return 'Xác thực OTP';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'registration':
        return 'Nhập mã 6 số đã được gửi đến email của bạn để hoàn tất đăng ký';
      case 'login':
        return 'Nhập mã 6 số đã được gửi đến email của bạn để đăng nhập';
      case 'password_reset':
        return 'Nhập mã 6 số đã được gửi đến email của bạn để đặt lại mật khẩu';
      default:
        return 'Nhập mã 6 số đã được gửi đến email của bạn';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{getTitle()}</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="mail" size={32} color="#667eea" />
              </View>
            </View>

            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.description}>{getDescription()}</Text>

            {/* Email Display */}
            <View style={styles.emailContainer}>
              <Ionicons name="mail-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Mã xác thực OTP</Text>
              <View style={styles.otpInputs}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled,
                      error && styles.otpInputError,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                ))}
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* Countdown Timer */}
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.timerText}>
                Mã OTP sẽ hết hạn sau: {formatTime(countdown)}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  isLoading && styles.verifyButtonDisabled,
                ]}
                onPress={handleVerifyOTP}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.verifyButtonText}>Xác thực</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.resendButton,
                  (!canResend || resendCount >= 3) && styles.resendButtonDisabled,
                ]}
                onPress={handleResendOTP}
                disabled={!canResend || resendCount >= 3 || isLoading}
              >
                <Ionicons name="refresh" size={16} color={canResend ? "#fff" : "rgba(255, 255, 255, 0.5)"} />
                <Text style={[
                  styles.resendButtonText,
                  (!canResend || resendCount >= 3) && styles.resendButtonTextDisabled,
                ]}>
                  {resendCount >= 3 ? 'Đã gửi tối đa' : 'Gửi lại OTP'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Help Text */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                Không nhận được email? Kiểm tra thư mục spam hoặc
              </Text>
              <TouchableOpacity onPress={handleSendOTP}>
                <Text style={styles.helpLink}>gửi lại email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
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
  iconContainer: {
    marginBottom: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
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
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 30,
  },
  emailText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  otpContainer: {
    width: '100%',
    marginBottom: 30,
  },
  otpLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpInput: {
    width: (width - 80) / 6,
    height: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  otpInputFilled: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  otpInputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 30,
  },
  timerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginLeft: 8,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
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
  verifyButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  verifyButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  resendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  resendButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  helpText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  helpLink: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginLeft: 4,
  },
});
