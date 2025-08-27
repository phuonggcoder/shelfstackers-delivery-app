import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Linking,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface OrderMapViewProps {
  order: {
    _id: string;
    order_id?: string;
    shipping_address_snapshot?: {
      coordinates?: {
        coordinates: [number, number]; // [longitude, latitude]
      };
      latitude?: number;
      longitude?: number;
      fullAddress?: string;
      location?: {
        type: string;
        coordinates: [number, number];
      };
      osm?: {
        lat: number;
        lng: number;
        displayName: string;
      };
    };
    summary?: {
      customerAddress?: string;
    };
  };
  style?: any;
}

export const OrderMapView: React.FC<OrderMapViewProps> = ({ order, style }) => {
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
    source: string;
  } | null>(null);
  const [address, setAddress] = useState<string>('');

  // Lấy tọa độ từ đơn hàng theo thứ tự ưu tiên
  useEffect(() => {
    const extractCoordinates = () => {
      const snapshot = order.shipping_address_snapshot;
      
      // Ưu tiên 1: OSM data (OpenStreetMap)
      if (snapshot?.osm?.lat && snapshot?.osm?.lng) {
        setCoordinates({
          latitude: snapshot.osm.lat,
          longitude: snapshot.osm.lng,
          source: 'osm'
        });
        setAddress(snapshot.osm.displayName || '');
        return;
      }
      
      // Ưu tiên 2: Location coordinates (GeoJSON)
      if (snapshot?.location?.coordinates && snapshot.location.coordinates.length === 2) {
        const [lng, lat] = snapshot.location.coordinates;
        setCoordinates({
          latitude: lat,
          longitude: lng,
          source: 'location'
        });
        setAddress(snapshot.fullAddress || '');
        return;
      }
      
      // Ưu tiên 3: Manual coordinates
      if (snapshot?.latitude && snapshot?.longitude) {
        setCoordinates({
          latitude: snapshot.latitude,
          longitude: snapshot.longitude,
          source: 'manual'
        });
        setAddress(snapshot.fullAddress || '');
        return;
      }
      
      // Fallback: Không có tọa độ
      setCoordinates(null);
      setAddress(snapshot?.fullAddress || order.summary?.customerAddress || 'Không có địa chỉ');
    };

    extractCoordinates();
  }, [order]);

  // Mở Google Maps với tọa độ
  const openGoogleMaps = async () => {
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
  };

  // Mở Google Maps với địa chỉ text
  const openGoogleMapsWithAddress = async () => {
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
  };

  // Hiển thị thông tin tọa độ
  const renderCoordinatesInfo = () => {
    if (!coordinates) {
      return (
        <View style={styles.noCoordinatesContainer}>
          <Ionicons name="location-outline" size={24} color="#999" />
          <ThemedText style={styles.noCoordinatesText}>
            Không có tọa độ GPS
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.coordinatesContainer}>
        <View style={styles.coordinatesRow}>
          <Ionicons name="location" size={16} color="#4A90E2" />
          <ThemedText style={styles.coordinatesLabel}>
            Tọa độ GPS:
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
                     coordinates.source === 'location' ? 'GeoJSON' : 'Thủ công'}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="map" size={20} color="#4A90E2" />
          <ThemedText style={styles.headerTitle}>
            Thông tin địa điểm
          </ThemedText>
        </View>
        
        {coordinates && (
          <TouchableOpacity 
            style={styles.directionsButton}
            onPress={openGoogleMaps}
          >
            <Ionicons name="navigate" size={16} color="#4A90E2" />
            <ThemedText style={styles.directionsButtonText}>
              Chỉ đường
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Địa chỉ */}
      <View style={styles.addressSection}>
        <View style={styles.addressHeader}>
          <Ionicons name="home" size={16} color="#666" />
          <ThemedText style={styles.addressLabel}>Địa chỉ giao hàng:</ThemedText>
        </View>
        <ThemedText style={styles.addressText}>
          {address}
        </ThemedText>
        
        {!coordinates && address !== 'Không có địa chỉ' && (
          <TouchableOpacity 
            style={styles.addressDirectionsButton}
            onPress={openGoogleMapsWithAddress}
          >
            <Ionicons name="paper-plane" size={14} color="#4A90E2" />
            <ThemedText style={styles.addressDirectionsButtonText}>
              Chỉ đường theo địa chỉ
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Thông tin tọa độ */}
      {renderCoordinatesInfo()}

      {/* Nút hành động */}
      <View style={styles.actionsContainer}>
        {coordinates ? (
          <TouchableOpacity 
            style={styles.primaryAction}
            onPress={openGoogleMaps}
          >
            <Ionicons name="navigate" size={18} color="#FFF" />
            <ThemedText style={styles.primaryActionText}>
              Mở Google Maps với tọa độ
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.secondaryAction}
            onPress={openGoogleMapsWithAddress}
            disabled={address === 'Không có địa chỉ'}
          >
            <Ionicons name="map" size={18} color="#4A90E2" />
            <ThemedText style={styles.secondaryActionText}>
              Mở Google Maps với địa chỉ
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  directionsButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
    marginLeft: 4,
  },
  addressSection: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  addressDirectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  addressDirectionsButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    marginLeft: 4,
  },
  noCoordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 16,
  },
  noCoordinatesText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  coordinatesContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  coordinatesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 6,
  },
  coordinatesData: {
    marginBottom: 8,
  },
  coordinateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  coordinateLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  coordinateValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  sourceContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
  },
  sourceText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginTop: 8,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryActionText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
