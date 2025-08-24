import { useDirections } from '@/hooks/useDirections';
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
      if (address) {
        setDisplayAddress(address);
      } else if (coordinates) {
        setLoading(true);
        try {
          const addressFromCoords = await getAddressFromCoordinates(
            coordinates.latitude,
            coordinates.longitude
          );
          if (addressFromCoords) {
            setDisplayAddress(addressFromCoords);
          } else {
            setDisplayAddress('Không thể xác định địa chỉ');
          }
        } catch (error) {
          console.error('Failed to get address from coordinates:', error);
          setDisplayAddress('Không thể xác định địa chỉ');
        } finally {
          setLoading(false);
        }
      }
    };

    processAddress();
  }, [address, coordinates, getAddressFromCoordinates]);

  // Xử lý khi tap vào nút chỉ đường
  const handleDirectionsPress = async () => {
    if (coordinates) {
      await openDirectionsToCoordinates(coordinates.latitude, coordinates.longitude);
    } else if (displayAddress && displayAddress !== 'Không thể xác định địa chỉ') {
      await openDirections(displayAddress);
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
          <ThemedText style={styles.directionsButtonText}>🗺️</ThemedText>
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
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    marginLeft: 8,
  },
  directionsButtonText: {
    fontSize: 16,
  },
});
