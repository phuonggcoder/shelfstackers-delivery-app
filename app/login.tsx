import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { shipperApi } from '@/lib/shipperApi';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [pwd, setPwd] = useState('');
  const router = useRouter();
  const { signIn } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput placeholder="Số điện thoại" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Mật khẩu" value={pwd} onChangeText={setPwd} style={styles.input} secureTextEntry />
      <Button title="Đăng nhập" onPress={async () => {
        // fake login for demo - replace with real API call
        const fakeToken = 'dev-token';
        const fakeUser = { name: 'Employee 1', phone };
  shipperApi.setToken(fakeToken);
  await signIn({ token: fakeToken, user: fakeUser });
  // go to tabs home (index) after successful login
  router.replace('/(tabs)');
      }} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, justifyContent: 'center' }, title: { fontSize: 20, textAlign: 'center', marginBottom: 12 }, input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 8 } });
