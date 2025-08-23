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
     
      {/* Thông tin cá nhân */}
      <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
      <View style={styles.profileRow}>
        <Image source={{ uri: displayUser.avatar || sampleUser.avatar }} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{displayUser.full_name}</Text>
          {/* <Text style={styles.profileUsername}>Username: {displayUser.username}</Text> */}
          <Text style={styles.profileEmail}>Email: {displayUser.email}</Text>
          <View style={styles.profilePhoneRow}>
            <Ionicons name="call" size={18} color="#219653" style={{ marginRight: 6 }} />
            <Text style={styles.profilePhone}>{displayUser.phone_number}</Text>
          </View>
          <Text style={styles.profileGender}>Giới tính: {displayUser.gender === 'male' ? 'Nam' : displayUser.gender === 'female' ? 'Nữ' : displayUser.gender || 'Chưa cập nhật'}</Text>
          <Text style={styles.profileRoles}>Roles: {Array.isArray(displayUser.roles) ? displayUser.roles.join(', ') : displayUser.roles}</Text>
        </View>
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
                full_name: displayUser.fuall_name,
                phone_number: displayUser.phone_number,
                avatar: displayUser.avatar,
                gender: displayUser.gender,
              },
            })
          }
        >
          <FontAwesome name="user" size={20} color="#219653" style={{ marginRight: 12 }} />
          <Text style={styles.optionText}>Cập nhật tài khoản</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => router.push('/changepassword')}
        >
          <Ionicons name="key" size={20} color="#219653" style={{ marginRight: 12 }} />
          <Text style={styles.optionText}>Đổi mật khẩu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="headset" size={20} color="#219653" style={{ marginRight: 12 }} />
          <Text style={styles.optionText}>Hỗ trợ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={async () => {
          await signOut();
          router.replace('/login');
        }}>
          <MaterialIcons name="logout" size={20} color="#219653" style={{ marginRight: 12 }} />
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
    marginTop: 12,
    color: '#222',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#6FCF97',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
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
    color: '#219653',
    marginTop: 2,
    fontWeight: 'bold',
  },
});
