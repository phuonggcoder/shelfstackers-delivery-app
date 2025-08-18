import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Info() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin Shipper</Text>
      <Text>Employee 1 Phan Huy ích</Text>
      <Text>0911111111</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 20, fontWeight: '700', marginBottom: 8 } });
