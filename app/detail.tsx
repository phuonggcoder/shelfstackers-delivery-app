import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Detail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = String(params.id || params.orderId || '');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết đơn {id}</Text>
      <Button title="Mở bản đồ" onPress={() => router.push('/(tabs)/shipper/map?lat=10.8&lng=106.65')} />
      <View style={{ height: 8 }} />
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, title: { fontSize: 20, marginBottom: 12 } });
