import { Linking, Platform } from 'react-native';

// Google Maps configuration
export const GOOGLE_MAPS_CONFIG = {
  // Cấu hình mặc định cho geocoding
  geocoding: {
    region: 'vn',
    language: 'vi'
  },
  // Rate limiting thresholds
  rateLimit: {
    geocoding: {
      requestsPerDay: 2500,  // Free tier limit
      requestsPerSecond: 50
    }
  }
};

export class MapsService {
  /**
   * Validate coordinates
   */
  static validateCoordinates(lat: number, lng: number): boolean {
    if (!lat || !lng) return false;
    if (lat < -90 || lat > 90) return false;
    if (lng < -180 || lng > 180) return false;
    return true;
  }

  /**
   * Chuyển đổi từ [lat, lng] sang GeoJSON Point
   */
  static toGeoJSON(lat: number, lng: number) {
    return {
      type: 'Point',
      coordinates: [lng, lat]  // GeoJSON uses [longitude, latitude] order
    };
  }

  /**
   * Mở Google Maps với chỉ đường đến địa chỉ
   */
  static async openDirections(address: string): Promise<boolean> {
    try {
      const encodedAddress = encodeURIComponent(address);
      let url = '';
      
      if (Platform.OS === 'ios') {
        url = `https://maps.apple.com/maps?daddr=${encodedAddress}`;
      } else {
        url = `https://maps.google.com/maps?daddr=${encodedAddress}`;
      }
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        // Fallback to web browser
        const webUrl = `https://maps.google.com/maps?daddr=${encodedAddress}`;
        await Linking.openURL(webUrl);
        return true;
      }
    } catch (error) {
      console.error('Failed to open directions:', error);
      return false;
    }
  }

  /**
   * Mở Google Maps với chỉ đường đến tọa độ
   */
  static async openDirectionsToCoordinates(lat: number, lng: number): Promise<boolean> {
    try {
      console.log('🗺️ MapsService: Opening directions to coordinates:', { lat, lng });
      
      let url = '';
      
      if (Platform.OS === 'ios') {
        url = `https://maps.apple.com/maps?daddr=${lat},${lng}`;
        console.log('🍎 iOS: Using Apple Maps URL:', url);
      } else {
        url = `https://maps.google.com/maps?daddr=${lat},${lng}`;
        console.log('🤖 Android: Using Google Maps URL:', url);
      }
      
      console.log('🔗 Checking if URL can be opened...');
      const canOpen = await Linking.canOpenURL(url);
      console.log('✅ Can open URL:', canOpen);
      
      if (canOpen) {
        console.log('🚀 Opening native maps app...');
        await Linking.openURL(url);
        return true;
      } else {
        // Fallback to web browser
        console.log('🌐 Fallback: Opening web browser...');
        const webUrl = `https://maps.google.com/maps?daddr=${lat},${lng}`;
        await Linking.openURL(webUrl);
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to open directions to coordinates:', error);
      return false;
    }
  }

  /**
   * Parse địa chỉ từ Google Maps Geocoding response
   */
  static parseAddress(result: any) {
    const components = result.address_components;
    const address = {
      street: '',
      ward: '',
      district: '',
      city: '',
      country: 'Vietnam'
    };

    for (const component of components) {
      const types = component.types;

      if (types.includes('street_number') || types.includes('route')) {
        address.street = address.street 
          ? `${address.street} ${component.long_name}`
          : component.long_name;
      }
      
      if (types.includes('sublocality_level_1')) {
        address.ward = component.long_name;
      }

      if (types.includes('administrative_area_level_2')) {
        address.district = component.long_name;
      }

      if (types.includes('administrative_area_level_1')) {
        address.city = component.long_name;
      }
    }

    return {
      address,
      formatted_address: result.formatted_address,
      place_id: result.place_id
    };
  }
}
