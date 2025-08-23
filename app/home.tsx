import { useRouter } from 'expo-router';
import * as React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Home() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang chủ</Text>
      <Button title="Mở đơn mẫu" onPress={() => router.push('/detail?id=123')} />
      <View style={{ height: 8 }} />
  <Button title="Trang cá nhân" onPress={() => router.push('/profile')} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, title: { fontSize: 22, marginBottom: 12 } });
