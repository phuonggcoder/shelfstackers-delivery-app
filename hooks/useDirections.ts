import { geocodingService } from '@/lib/geocodingService';
import { MapsService } from '@/lib/mapsConfig';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

interface UseDirectionsReturn {
  openDirections: (address: string) => Promise<void>;
  openDirectionsToCoordinates: (lat: number, lng: number) => Promise<void>;
  getAddressFromCoordinates: (lat: number, lng: number) => Promise<string | null>;
  loading: boolean;
}

export const useDirections = (): UseDirectionsReturn => {
  const [loading, setLoading] = useState(false);

  /**
   * Mở chỉ đường đến địa chỉ
   */
  const openDirections = useCallback(async (address: string) => {
    if (!address || address.trim() === '') {
      Alert.alert('Lỗi', 'Không có địa chỉ để chỉ đường');
      return;
    }

    setLoading(true);
    try {
      const success = await MapsService.openDirections(address);
      if (!success) {
        Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ');
      }
    } catch (error) {
      console.error('Failed to open directions:', error);
      Alert.alert('Lỗi', 'Không thể mở chỉ đường');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mở chỉ đường đến tọa độ
   */
  const openDirectionsToCoordinates = useCallback(async (lat: number, lng: number) => {
    console.log('🗺️ Opening directions to coordinates:', { lat, lng });
    
    if (!MapsService.validateCoordinates(lat, lng)) {
      console.error('❌ Invalid coordinates:', { lat, lng });
      Alert.alert('Lỗi', 'Tọa độ không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Attempting to open maps with coordinates...');
      const success = await MapsService.openDirectionsToCoordinates(lat, lng);
      if (success) {
        console.log('✅ Successfully opened maps with coordinates');
      } else {
        console.error('❌ Failed to open maps with coordinates');
        Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ');
      }
    } catch (error) {
      console.error('❌ Failed to open directions to coordinates:', error);
      Alert.alert('Lỗi', 'Không thể mở chỉ đường');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy địa chỉ từ tọa độ
   */
  const getAddressFromCoordinates = useCallback(async (lat: number, lng: number): Promise<string | null> => {
    if (!MapsService.validateCoordinates(lat, lng)) {
      return null;
    }

    try {
      const result = await geocodingService.getAddressFromCoordinates(lat, lng);
      if (result) {
        // Tạo địa chỉ đầy đủ
        const addressParts = [
          result.address.street,
          result.address.ward,
          result.address.district,
          result.address.city
        ].filter(Boolean);
        
        return addressParts.join(', ');
      }
      return null;
    } catch (error) {
      console.error('Failed to get address from coordinates:', error);
      return null;
    }
  }, []);

  return {
    openDirections,
    openDirectionsToCoordinates,
    getAddressFromCoordinates,
    loading
  };
};
