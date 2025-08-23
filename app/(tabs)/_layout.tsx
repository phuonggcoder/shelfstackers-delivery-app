import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Slot, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Slot />

      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomTab} onPress={() => router.push('/shipper/orders')}>
            <IconSymbol name="inventory" size={22} color={Colors.light.tabIconSelected} />
            <Text style={[styles.bottomTabText, { color: Colors.light.tabIconSelected }]}>Đơn hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomTab} onPress={() => router.push('/info')}>
            <IconSymbol name="person" size={22} color={'#999'} />
            <Text style={styles.bottomTabText}>Cá nhân</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBarContainer: { position: 'absolute', left: 0, right: 0, bottom: 0, height: Platform.OS === 'android' ? 84 : 94, alignItems: 'center', justifyContent: 'flex-end' },
  bottomBar: { width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, borderTopWidth: 1, borderColor: '#eee', paddingVertical: 8, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 16, zIndex: 9999, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
  bottomTab: { alignItems: 'center', justifyContent: 'center' },
  bottomTabText: { marginTop: 4, fontSize: 12 },
});
