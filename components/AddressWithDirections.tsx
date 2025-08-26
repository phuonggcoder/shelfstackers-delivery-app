import { useDirections } from '@/hooks/useDirections';
import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface AddressWithDirectionsProps {
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  showDirectionsButton?: boolean;
  style?: any;
}

export const AddressWithDirections: React.FC<AddressWithDirectionsProps> = ({
  address,
  coordinates,
  showDirectionsButton = true,
  style
}) => {
  const [displayAddress, setDisplayAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { openDirections, openDirectionsToCoordinates, getAddressFromCoordinates } = useDirections();

  // Xử lý địa chỉ khi component mount
  useEffect(() => {
    const processAddress = async () => {
      console.log('📍 AddressWithDirections: Processing address and coordinates:', {
        address,
        coordinates,
        hasCoordinates: !!coordinates
      });
      
      if (address && address !== 'Không có địa chỉ') {
        console.log('📝 Using provided address:', address);
        setDisplayAddress(address);
      } else if (coordinates) {
        console.log('🗺️ Using coordinates to get address:', coordinates);
        setLoading(true);
        try {
          const addressFromCoords = await getAddressFromCoordinates(
            coordinates.latitude,
            coordinates.longitude
          );
          if (addressFromCoords) {
            console.log('✅ Got address from coordinates:', addressFromCoords);
            setDisplayAddress(addressFromCoords);
          } else {
            console.warn('⚠️ Could not get address from coordinates');
            setDisplayAddress('Không thể xác định địa chỉ');
          }
        } catch (error) {
          console.error('❌ Failed to get address from coordinates:', error);
          setDisplayAddress('Không thể xác định địa chỉ');
        } finally {
          setLoading(false);
        }
      } else {
        // Nếu không có địa chỉ, hiển thị thông báo
        console.log('❌ No address or coordinates available');
        setDisplayAddress('Không có địa chỉ');
      }
    };

    processAddress();
  }, [address, coordinates, getAddressFromCoordinates]);

  // Xử lý khi tap vào nút chỉ đường
  const handleDirectionsPress = async () => {
    if (coordinates) {
      // ✅ ƯU TIÊN: Mở maps với tọa độ chính xác
      console.log('🗺️ Opening directions to coordinates:', coordinates);
      await openDirectionsToCoordinates(coordinates.latitude, coordinates.longitude);
    } else if (displayAddress && displayAddress !== 'Không thể xác định địa chỉ') {
      // Fallback: Mở maps với địa chỉ text
      console.log('📍 Opening directions to address:', displayAddress);
      await openDirections(displayAddress);
    } else {
      console.warn('⚠️ No coordinates or address available for directions');
    }
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

      </View>
      
      {/* Nút chỉ đường */}
      {showDirectionsButton && (coordinates || displayAddress) && (
        <TouchableOpacity 
          style={styles.directionsButton} 
          onPress={handleDirectionsPress}
        >
          <Ionicons name="paper-plane" size={16} color="#2196F3" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
