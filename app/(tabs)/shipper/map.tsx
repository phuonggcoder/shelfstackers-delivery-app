import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

// Trang map cải tiến với thông tin tọa độ chi tiết
export default function MapDirections() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
    source: string;
  } | null>(null);
  const [address, setAddress] = useState<string>('');

  // Xử lý params từ navigation
  useEffect(() => {
    const lat = Number(params.lat || 0);
    const lng = Number(params.lng || 0);
    const addr = String(params.address || '');
    const source = String(params.source || 'unknown');

    if (lat && lng) {
      setCoordinates({
        latitude: lat,
        longitude: lng,
        source: source
      });
      setAddress(addr);
    }
  }, [params]);

  // Mở Google Maps với tọa độ
  const openGoogleMaps = useCallback(async () => {
    if (!coordinates) {
      Alert.alert('Thông báo', 'Không có tọa độ để chỉ đường');
      return;
    }

    try {
      const { latitude, longitude } = coordinates;
      let url = '';
      
      if (Platform.OS === 'ios') {
        url = `https://maps.apple.com/?daddr=${latitude},${longitude}`;
      } else {
        url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      }
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to web browser
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Failed to open maps:', error);
      Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ');
    }
  }, [coordinates]);

  // Mở Google Maps với địa chỉ text
  const openGoogleMapsWithAddress = useCallback(async () => {
    if (!address || address === 'Không có địa chỉ') {
      Alert.alert('Thông báo', 'Không có địa chỉ để chỉ đường');
      return;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      let url = '';
      
      if (Platform.OS === 'ios') {
        url = `https://maps.apple.com/?daddr=${encodedAddress}`;
      } else {
        url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      }
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to web browser
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Failed to open maps:', error);
      Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ');
    }
  }, [address]);

  // Hiển thị thông tin tọa độ
  const renderCoordinatesInfo = () => {
    if (!coordinates) {
      return (
        <View style={styles.noCoordinatesContainer}>
          <Ionicons name="location-outline" size={48} color="#999" />
          <ThemedText style={styles.noCoordinatesTitle}>
            Không có tọa độ GPS
          </ThemedText>
          <ThemedText style={styles.noCoordinatesText}>
            Không thể hiển thị bản đồ vì thiếu thông tin tọa độ
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.coordinatesContainer}>
        <View style={styles.coordinatesHeader}>
          <Ionicons name="location" size={24} color="#4A90E2" />
          <ThemedText style={styles.coordinatesTitle}>
            Tọa độ GPS
          </ThemedText>
        </View>
        
        <View style={styles.coordinatesData}>
          <View style={styles.coordinateItem}>
            <ThemedText style={styles.coordinateLabel}>Vĩ độ:</ThemedText>
            <ThemedText style={styles.coordinateValue}>
              {coordinates.latitude.toFixed(6)}
            </ThemedText>
          </View>
          
          <View style={styles.coordinateItem}>
            <ThemedText style={styles.coordinateLabel}>Kinh độ:</ThemedText>
            <ThemedText style={styles.coordinateValue}>
              {coordinates.longitude.toFixed(6)}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.sourceContainer}>
          <ThemedText style={styles.sourceText}>
            Nguồn: {coordinates.source === 'osm' ? 'OpenStreetMap' : 
                     coordinates.source === 'location' ? 'GeoJSON' : 
                     coordinates.source === 'manual' ? 'Thủ công' : 
                     coordinates.source === 'unknown' ? 'Không xác định' : coordinates.source}
          </ThemedText>
        </View>
      </View>
    );
  };

  // Hiển thị địa chỉ
  const renderAddressInfo = () => {
    if (!address || address === 'Không có địa chỉ') {
      return (
        <View style={styles.noAddressContainer}>
          <Ionicons name="home-outline" size={24} color="#999" />
          <ThemedText style={styles.noAddressText}>
            Không có thông tin địa chỉ
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.addressContainer}>
        <View style={styles.addressHeader}>
          <Ionicons name="home" size={20} color="#666" />
          <ThemedText style={styles.addressLabel}>Địa chỉ giao hàng:</ThemedText>
        </View>
        <ThemedText style={styles.addressText}>
          {address}
        </ThemedText>
      </View>
    );
  };

  // Tự động mở maps khi có tọa độ
  useEffect(() => {
    if (coordinates) {
      // Delay một chút để user có thể thấy thông tin trước khi mở maps
      const timer = setTimeout(() => {
        openGoogleMaps();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [coordinates, openGoogleMaps]);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Thông tin địa điểm</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Thông tin tọa độ */}
        {renderCoordinatesInfo()}

        {/* Thông tin địa chỉ */}
        {renderAddressInfo()}

        {/* Nút hành động */}
        <View style={styles.actionsContainer}>
          {coordinates ? (
            <TouchableOpacity 
              style={styles.primaryAction}
              onPress={openGoogleMaps}
            >
              <Ionicons name="navigate" size={20} color="#FFF" />
              <ThemedText style={styles.primaryActionText}>
                Mở Google Maps với tọa độ
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.secondaryAction}
              onPress={openGoogleMapsWithAddress}
              disabled={!address || address === 'Không có địa chỉ'}
            >
              <Ionicons name="map" size={20} color="#4A90E2" />
              <ThemedText style={styles.secondaryActionText}>
                Mở Google Maps với địa chỉ
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Thông báo tự động mở maps */}
        {coordinates && (
          <View style={styles.autoOpenInfo}>
            <Ionicons name="information-circle" size={16} color="#4A90E2" />
            <ThemedText style={styles.autoOpenText}>
              Ứng dụng bản đồ sẽ tự động mở sau 2 giây
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  noCoordinatesContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noCoordinatesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noCoordinatesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  coordinatesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coordinatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coordinatesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  coordinatesData: {
    marginBottom: 16,
  },
  coordinateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  coordinateLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  coordinateValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  sourceContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  sourceText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  noAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noAddressText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  addressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryActionText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  autoOpenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  autoOpenText: {
    fontSize: 12,
    color: '#1976D2',
    marginLeft: 8,
    textAlign: 'center',
  },
});
