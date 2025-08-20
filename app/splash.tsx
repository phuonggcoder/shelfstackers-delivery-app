import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function Splash() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace('/login'), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/ShelfStackerDelivery.png')} style={{ width: 140, height: 140 }} />
      <Text style={styles.title}>ShelfStacker Delivery</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }, title: { marginTop: 12, fontSize: 20, fontWeight: '700' } });
