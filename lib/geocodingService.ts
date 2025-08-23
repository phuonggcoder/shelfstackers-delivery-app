import { MapsService } from './mapsConfig';

// Simple in-memory cache for geocoding results
const geocodeCache = new Map<string, any>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface GeocodingResult {
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
    country: string;
  };
  formatted_address: string;
  place_id: string;
}

export class GeocodingService {
  private static instance: GeocodingService;
  private apiKey: string;

  private constructor() {
    // In a real app, you'd get this from environment variables
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  }

  public static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  /**
   * Tạo cache key từ latitude và longitude
   */
  private getCacheKey(latitude: number, longitude: number): string {
    // Round to 4 decimal places for cache key (roughly 11 meters precision)
    const lat = Math.round(latitude * 10000) / 10000;
    const lng = Math.round(longitude * 10000) / 10000;
    return `${lat},${lng}`;
  }

  /**
   * Lấy kết quả từ cache
   */
  private getFromCache(latitude: number, longitude: number): GeocodingResult | null {
    const cacheKey = this.getCacheKey(latitude, longitude);
    const cached = geocodeCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Geocoding cache hit:', cacheKey);
      return cached.data;
    }
    
    return null;
  }

  /**
   * Lưu kết quả vào cache
   */
  private setCache(latitude: number, longitude: number, data: GeocodingResult): void {
    const cacheKey = this.getCacheKey(latitude, longitude);
    geocodeCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Reverse geocoding với cache
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    try {
      // Check cache trước
      const cachedResult = this.getFromCache(latitude, longitude);
      if (cachedResult) {
        return cachedResult;
      }

      // Nếu không có trong cache, gọi API
      console.log('Geocoding cache miss:', `${latitude},${longitude}`);
      
      if (!this.apiKey) {
        console.warn('Google Maps API key not configured');
        return null;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}&language=vi&region=vn`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK') {
        const result = data.results[0];
        const parsedAddress = MapsService.parseAddress(result);
        
        // Lưu vào cache
        this.setCache(latitude, longitude, parsedAddress);
        return parsedAddress;
      }

      if (data.status === 'ZERO_RESULTS') {
        return null;
      }

      throw new Error(`Geocoding failed: ${data.status}`);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Reverse geocoding và parse địa chỉ
   */
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    return this.reverseGeocode(latitude, longitude);
  }

  /**
   * Xóa cache
   */
  clearCache(): void {
    geocodeCache.clear();
  }

  /**
   * Lấy thống kê cache
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: geocodeCache.size,
      hitRate: 0 // In a real app, you'd track hit/miss rates
    };
  }
}

// Export singleton instance
export const geocodingService = GeocodingService.getInstance();
