import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cá nhân</Text>
      <Text style={styles.item}>{user?.name || user?.fullName || 'Employee'}</Text>
      <Text style={styles.item}>{user?.phone || ''}</Text>
  <View style={{ height: 12 }} />
  <Button title="Cập nhật" onPress={() => router.push('./profile/edit')} />
      <View style={{ height: 8 }} />
      <Button title="Đăng xuất" onPress={() => signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  item: { fontSize: 16, marginBottom: 6 },
});
