import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Slot, usePathname, useRouter } from 'expo-router';
import * as React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const isProfile = pathname.startsWith('/profile') || pathname.includes('/profile');
  const isOrders = pathname.startsWith('/shipper') || pathname.includes('/shipper');
  const isMessages = pathname.startsWith('/messages') || pathname.includes('/messages');
  const bottomHeight = Platform.OS === 'android' ? 84 : 94;

  return (
    <View style={{ flex: 1, paddingBottom: bottomHeight }}>
      <Slot />

      <View style={[styles.bottomBarContainer, { height: bottomHeight }]}> 
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomTab} onPress={() => router.push('/shipper/orders')}>
            <IconSymbol name="inventory" size={26} color={isOrders ? Colors.light.tabIconInfo : Colors.light.tabIconDefault} />
            <Text style={[styles.bottomTabText, { color: isOrders ? Colors.light.tabIconInfo : Colors.light.tabIconDefault }]}>Đơn hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomTab} onPress={() => router.push('/messages')}>
            <IconSymbol name="chat" size={26} color={isMessages ? Colors.light.tabIconInfo : Colors.light.tabIconDefault} />
            <Text style={[styles.bottomTabText, { color: isMessages ? Colors.light.tabIconInfo : Colors.light.tabIconDefault }]}>Tin nhắn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomTab} onPress={() => router.push('/profile')}>
            <IconSymbol name="person" size={26} color={isProfile ? Colors.light.tabIconInfo : Colors.light.tabIconDefault} />
            <Text style={[styles.bottomTabText, { color: isProfile ? Colors.light.tabIconInfo : Colors.light.tabIconDefault }]}>Cá nhân</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBarContainer: { position: 'absolute', left: 0, right: 0, bottom: 0, height: Platform.OS === 'android' ? 84 : 94, alignItems: 'center', justifyContent: 'flex-end' },
  bottomBar: { width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, borderTopWidth: 1, borderColor: '#fff', paddingVertical: 8, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 16, zIndex: 9999, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
  bottomTab: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 16 },
  bottomTabText: { marginTop: 6, fontSize: 13 },
});
