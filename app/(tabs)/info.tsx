import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function InfoTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin Shipper</Text>
      <Text>Employee 1 Phan Huy Ích</Text>
      <Text>0911111111</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: '#fff' }, title: { fontSize: 20, fontWeight: '700', marginBottom: 8 } });
