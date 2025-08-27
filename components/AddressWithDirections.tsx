import { useDirections } from '@/hooks/useDirections';
import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface AddressWithDirectionsProps {
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  // Thêm props mới để hỗ trợ đầy đủ dữ liệu từ API
  orderCoordinates?: {
    coordinates?: [number, number]; // [longitude, latitude] - GeoJSON format
    latitude?: number;
    longitude?: number;
    source?: string;
  };
  osmData?: {
    lat: number;
    lng: number;
    displayName: string;
  };
  showDirectionsButton?: boolean;
  showCoordinatesInfo?: boolean; // Hiển thị thông tin tọa độ
  style?: any;
}

export const AddressWithDirections: React.FC<AddressWithDirectionsProps> = ({
  address,
  coordinates,
  orderCoordinates,
  osmData,
  showDirectionsButton = true,
  showCoordinatesInfo = false,
  style
}) => {
  const [displayAddress, setDisplayAddress] = useState<string>('');
  const [finalCoordinates, setFinalCoordinates] = useState<{
    latitude: number;
    longitude: number;
    source: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const { openDirections, openDirectionsToCoordinates, getAddressFromCoordinates } = useDirections();

  // Xử lý tọa độ theo thứ tự ưu tiên từ API documentation
  useEffect(() => {
    const processCoordinates = () => {
      console.log('📍 AddressWithDirections: Processing coordinates with priority order:', {
        osmData,
        orderCoordinates,
        coordinates,
        address
      });

      // Ưu tiên 1: OSM Data (OpenStreetMap) - độ chính xác cao nhất
      if (osmData?.lat && osmData?.lng) {
        console.log('✅ Using OSM coordinates:', { lat: osmData.lat, lng: osmData.lng });
        setFinalCoordinates({
          latitude: osmData.lat,
          longitude: osmData.lng,
          source: 'osm'
        });
        setDisplayAddress(osmData.displayName || address || '');
        return;
      }

      // Ưu tiên 2: Order coordinates (GeoJSON format)
      if (orderCoordinates?.coordinates && orderCoordinates.coordinates.length === 2) {
        const [lng, lat] = orderCoordinates.coordinates; // GeoJSON: [longitude, latitude]
        console.log('✅ Using order GeoJSON coordinates:', { lat, lng });
        setFinalCoordinates({
          latitude: lat,
          longitude: lng,
          source: 'location'
        });
        setDisplayAddress(address || '');
        return;
      }

      // Ưu tiên 3: Manual coordinates
      if (orderCoordinates?.latitude && orderCoordinates?.longitude) {
        console.log('✅ Using manual coordinates:', { 
          lat: orderCoordinates.latitude, 
          lng: orderCoordinates.longitude 
        });
        setFinalCoordinates({
          latitude: orderCoordinates.latitude,
          longitude: orderCoordinates.longitude,
          source: 'manual'
        });
        setDisplayAddress(address || '');
        return;
      }

      // Ưu tiên 4: Legacy coordinates prop
      if (coordinates?.latitude && coordinates?.longitude) {
        console.log('✅ Using legacy coordinates:', coordinates);
        setFinalCoordinates({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          source: 'legacy'
        });
        setDisplayAddress(address || '');
        return;
      }

      // Fallback: Không có tọa độ
      console.log('❌ No coordinates available, using address only');
      setFinalCoordinates(null);
      setDisplayAddress(address || 'Không có địa chỉ');
    };

    processCoordinates();
  }, [osmData, orderCoordinates, coordinates, address]);

  // Xử lý khi tap vào nút chỉ đường
  const handleDirectionsPress = async () => {
    if (finalCoordinates) {
      // ✅ ƯU TIÊN: Mở maps với tọa độ chính xác
      console.log('🗺️ Opening directions to coordinates:', finalCoordinates);
      await openDirectionsToCoordinates(finalCoordinates.latitude, finalCoordinates.longitude);
    } else if (displayAddress && displayAddress !== 'Không có địa chỉ') {
      // Fallback: Mở maps với địa chỉ text
      console.log('📍 Opening directions to address:', displayAddress);
      await openDirections(displayAddress);
    } else {
      console.warn('⚠️ No coordinates or address available for directions');
      Alert.alert('Thông báo', 'Không có thông tin để chỉ đường');
    }
  };

  // Hiển thị thông tin tọa độ nếu được yêu cầu
  const renderCoordinatesInfo = () => {
    if (!showCoordinatesInfo || !finalCoordinates) return null;

    return (
      <View style={styles.coordinatesInfo}>
        <View style={styles.coordinatesRow}>
          <Ionicons name="location" size={14} color="#4A90E2" />
          <ThemedText style={styles.coordinatesLabel}>
            GPS: {finalCoordinates.latitude.toFixed(6)}, {finalCoordinates.longitude.toFixed(6)}
          </ThemedText>
        </View>
        <ThemedText style={styles.sourceText}>
          Nguồn: {finalCoordinates.source === 'osm' ? 'OpenStreetMap' : 
                   finalCoordinates.source === 'location' ? 'GeoJSON' : 
                   finalCoordinates.source === 'manual' ? 'Thủ công' : 'Legacy'}
        </ThemedText>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color="#2196F3" />
        <ThemedText style={styles.loadingText}>Đang xác định địa chỉ...</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Địa chỉ hiển thị */}
      <View style={styles.addressContainer}>
        <ThemedText style={styles.addressText}>
          {displayAddress || 'Không có địa chỉ'}
        </ThemedText>
        
        {/* Thông tin tọa độ (nếu được yêu cầu) */}
        {renderCoordinatesInfo()}
      </View>
      
      {/* Nút chỉ đường */}
      {showDirectionsButton && (finalCoordinates || displayAddress) && (
        <TouchableOpacity 
          style={[
            styles.directionsButton,
            finalCoordinates && styles.directionsButtonWithCoords
          ]} 
          onPress={handleDirectionsPress}
        >
          <Ionicons 
            name={finalCoordinates ? "navigate" : "paper-plane"} 
            size={16} 
            color={finalCoordinates ? "#4A90E2" : "#2196F3"} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  addressContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  directionsButton: {
    padding: 6,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
    minHeight: 24
  },
  directionsButtonWithCoords: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  coordinatesInfo: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  coordinatesLabel: {
    fontSize: 11,
    color: '#4A90E2',
    fontFamily: 'monospace',
    marginLeft: 4,
  },
  sourceText: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
    marginLeft: 18,
  },
});
