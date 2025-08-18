import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// Simple fallback map screen: opens external Google Maps / Apple Maps directions.
export default function MapDirections() {
  const params = useLocalSearchParams();
  const lat = Number(params.lat || 0);
  const lng = Number(params.lng || 0);
  const address = String(params.address || '');

  const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(address)}`;
  const appleUrl = `http://maps.apple.com/?daddr=${lat},${lng}`;

  const openExternal = useCallback(async () => {
    const url = Platform.OS === 'ios' ? appleUrl : googleUrl;
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.warn('Failed to open maps URL', e);
    }
  }, [appleUrl, googleUrl]);

  // Open maps immediately when we have coordinates
  useEffect(() => {
    if (lat && lng) openExternal();
  }, [lat, lng, openExternal]);

  if (!lat || !lng) {
    return (
      <View style={styles.center}><Text>Không có toạ độ để chỉ đường.</Text></View>
    );
  }

  return (
    <View style={styles.center}>
      <Text>Đang mở ứng dụng bản đồ…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
