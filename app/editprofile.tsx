import { useAuth } from '@/lib/auth';
// Nếu chưa cài, hãy chạy: npm install @react-native-community/datetimepicker
import DateTimePicker from '@react-native-community/datetimepicker';
// Nếu chưa cài, hãy chạy: npm install @react-native-picker/picker
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
  // Hàm chọn ảnh và upload lên server
  // Tự động lưu profile sau khi upload avatar thành công
  const pickAndUploadAvatar = async () => {
    // Chọn ảnh từ thư viện
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Bạn cần cấp quyền truy cập thư viện ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets || !result.assets[0]) return;
    const imageUri = result.assets[0].uri;

    // Upload lên server
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    } as any);
    // Thêm userId vào formData
    formData.append('userId', user?._id || user?.id || '');
    // Có thể đổi endpoint nếu backend bạn dùng /api/user-upload/avatar hoặc /api/upload/smart
    const uploadRes = await fetch('https://server-shelf-stacker-w1ds.onrender.com/api/user-upload/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    const uploadData = await uploadRes.json();
    if (uploadData.success && uploadData.user && uploadData.user.avatar) {
      setAvatar(uploadData.user.avatar);
      alert('Cập nhật avatar thành công!');
    } else if (uploadData.url) {
      setAvatar(uploadData.url);
      alert('Cập nhật avatar thành công!');
    } else {
      alert(uploadData.message || 'Upload avatar thất bại');
    }
  };
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Lấy thông tin hiện tại từ user context hoặc params
  const [fullName, setFullName] = useState(
    (typeof params.full_name === 'string' && params.full_name) || user?.full_name || ''
  );
  const [phoneNumber, setPhoneNumber] = useState(
    (typeof params.phone_number === 'string' && params.phone_number) || user?.phone_number || ''
  );
  const [gender, setGender] = useState(
    (typeof params.gender === 'string' && params.gender) || user?.gender || 'other'
  );
  const [birthDate, setBirthDate] = useState(
    (typeof params.birth_date === 'string' && params.birth_date)
      ? new Date(params.birth_date as string)
      : user?.birth_date
      ? new Date(user.birth_date)
      : new Date()
  );
  const [avatar, setAvatar] = useState(
    (typeof params.avatar === 'string' && params.avatar) || user?.avatar || ''
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    // Định dạng ngày sinh đúng 'YYYY-MM-DD'
    const formatBirthDate = (date: Date | undefined) => {
      if (!date) return undefined;
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const birthDateStr = formatBirthDate(birthDate);
    if (token) {
      try {
        const res = await fetch('https://server-shelf-stacker-w1ds.onrender.com/auth/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: fullName,
            phone_number: phoneNumber,
            gender,
            birth_date: birthDateStr,
            avatar,
          }),
        });
        if (res.ok) {
          if (typeof refreshUser === 'function') {
            await refreshUser();
          }
          alert('Lưu thay đổi thành công!');
          try {
            router.back();
          } catch (e) {
            router.replace('/'); // hoặc thay bằng trang profile nếu có
          }
        } else {
          const data = await res.json();
          alert(data.message || 'Cập nhật thất bại');
        }
      } catch (err) {
        alert('Lỗi kết nối server');
      }
    } else {
      try {
        const sampleUser = {
          full_name: fullName,
          phone_number: phoneNumber,
          gender,
          birth_date: birthDateStr,
          avatar,
        };
        window.localStorage.setItem('sampleUser', JSON.stringify(sampleUser));
        alert('Dữ liệu mẫu đã được cập nhật!');
        router.back();
      } catch (err) {
        alert('Lỗi lưu dữ liệu mẫu');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cập nhật thông tin cá nhân</Text>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickAndUploadAvatar}>
          <Image source={{ uri: avatar || 'https://i.imgur.com/8Km9tLL.png' }} style={styles.avatar} />
        </TouchableOpacity>
        <Text style={{ color: '#888', marginBottom: 8 }}>Nhấn vào ảnh để chọn ảnh mới</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <View style={styles.input}>
        <Picker
          selectedValue={gender}
          onValueChange={setGender}
        >
          <Picker.Item label="Nam" value="male" />
          <Picker.Item label="Nữ" value="female" />
          <Picker.Item label="Khác" value="other" />
        </Picker>
      </View>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Ngày sinh (yyyy-mm-dd)"
          value={birthDate ? birthDate.toISOString().slice(0, 10) : ''}
          editable={false}
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={birthDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event, date) => {
            setShowDatePicker(false);
            if (date) setBirthDate(date);
          }}
        />
      )}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#219653',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
