import { useAuth } from '@/lib/auth';
import { Picker } from '@react-native-picker/picker';
import * as React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ProfileDetailScreen() {
  const { user } = useAuth();
  const sampleUser = {
    username: 'sampleuser',
    email: 'sample@example.com',
    full_name: 'Nguyễn Văn A',
    phone_number: '0912345678',
    gender: 'male',
    roles: ['user'],
    avatar: 'https://i.imgur.com/8Km9tLL.png',
  };
  const displayUser = user || sampleUser;
  return (
    <ScrollView contentContainerStyle={styles.container}>
     
      <View style={styles.avatarContainer}>
        <Image source={{ uri: displayUser.avatar || sampleUser.avatar }} style={styles.avatar} />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value={displayUser.username} editable={false} />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={displayUser.email} editable={false} />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput style={styles.input} value={displayUser.full_name} editable={false} />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput style={styles.input} value={displayUser.phone_number} editable={false} />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Giới tính</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={displayUser.gender} enabled={false} style={styles.picker}>
            <Picker.Item label="Nam" value="male" />
            <Picker.Item label="Nữ" value="female" />
            <Picker.Item label="Khác" value="other" />
          </Picker>
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Roles</Text>
        <TextInput style={styles.input} value={Array.isArray(displayUser.roles) ? displayUser.roles.join(', ') : displayUser.roles} editable={false} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4A90E2',
    marginBottom: 12,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  formGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: '#222',
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f5f5f5',
    color: '#222',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  picker: {
    width: '100%',
    color: '#222',
  },
});
