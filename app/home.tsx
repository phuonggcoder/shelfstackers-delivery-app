import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang chủ</Text>
      <Button title="Mở đơn mẫu" onPress={() => router.push('/detail?id=123')} />
      <View style={{ height: 8 }} />
      <Button title="Thông tin" onPress={() => router.push('/info')} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, title: { fontSize: 22, marginBottom: 12 } });
