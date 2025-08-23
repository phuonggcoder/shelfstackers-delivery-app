import { useAuth } from '@/lib/auth';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

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

  return (
    <View style={styles.container}>
      {/* Tiêu đề trên cùng */}
      <Text style={styles.topTitle}>Thông tin cá nhân</Text>
      {/* Avatar lớn và căn giữa */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: displayUser.avatar || sampleUser.avatar }} style={styles.avatarLarge} />
        <Text style={styles.profileFullName}>{displayUser.full_name}</Text>
      </View>
      {/* Tùy chọn */}
      <Text style={styles.sectionTitle}>Tùy chọn</Text>
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
          <Text style={styles.optionText}>Cập nhật tài khoản</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => router.push('/profile-detail')}
        >
          <MaterialIcons name="info" size={20} color="#4A90E2" style={{ marginRight: 12 }} />
          <Text style={styles.optionText}>Chi tiết thông tin cá nhân</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => router.push('/changepassword')}
        >
          <Ionicons name="key" size={20} color="#4A90E2" style={{ marginRight: 12 }} />
          <Text style={styles.optionText}>Đổi mật khẩu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <FontAwesome name="language" size={20} color="#4A90E2" style={{ marginRight: 12 }} />
          <Text style={styles.optionText}>Đổi ngôn ngữ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={async () => {
          await signOut();
          router.replace('/login');
        }}>
          <MaterialIcons name="logout" size={20} color="#4A90E2" style={{ marginRight: 12 }} />
          <Text style={styles.optionText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    padding: 16,
    justifyContent: 'flex-start',
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
  infoButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 32,
  },
  topTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileUsername: {
    fontSize: 14,
    color: '#222',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#222',
    marginBottom: 2,
  },
  profilePhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePhone: {
    fontSize: 15,
    color: '#222',
  },
  profileGender: {
    fontSize: 14,
    color: '#222',
    marginTop: 2,
  },
  profileRoles: {
    fontSize: 14,
    color: '#222',
    marginTop: 2,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 6,
  },
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 10,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  tabItemActive: {
    alignItems: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: 13,
    color: '#828282',
    marginTop: 2,
  },
  tabTextActive: {
    fontSize: 13,
    color: '#4A90E2',
    marginTop: 2,
    fontWeight: 'bold',
  },
});
