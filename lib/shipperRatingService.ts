import AsyncStorage from '@react-native-async-storage/async-storage';

class ShipperRatingService {
  // Sử dụng API completed-orders thay vì shipper-ratings (chưa có)
  private static BASE_URL = 'https://server-shelf-stacker-w1ds.onrender.com/api/shipper';

  static async getPrompts() {
    try {
      // Tạm thời trả về prompts cố định vì chưa có API
      // TODO: Thay thế bằng API thật khi backend có endpoint
      return [
        { id: "fast_delivery", text: "Giao hàng nhanh chóng", type: "positive" },
        { id: "good_service", text: "Thái độ phục vụ tốt", type: "positive" },
        { id: "careful_packaging", text: "Đóng gói cẩn thận", type: "positive" },
        { id: "clear_notification", text: "Thông báo rõ ràng", type: "positive" },
        { id: "on_time_delivery", text: "Giao hàng đúng giờ", type: "positive" },
        { id: "good_complaint_handling", text: "Xử lý khiếu nại tốt", type: "positive" },
        { id: "slow_delivery", text: "Giao hàng chậm", type: "negative" },
        { id: "bad_attitude", text: "Thái độ không tốt", type: "negative" },
        { id: "careless_packaging", text: "Đóng gói không cẩn thận", type: "negative" },
        { id: "no_notification", text: "Không thông báo trước", type: "negative" }
      ];
    } catch (error) {
      console.error('API Error in getPrompts:', error);
      throw new Error('Lỗi kết nối mạng');
    }
  }

  static async getShipperRating(shipperId: string, token?: string) {
    console.log('🔍 getShipperRating - Method called with shipperId:', shipperId);
    console.log('🔍 getShipperRating - THIS IS THE MAIN METHOD (limit=10)');
    try {
      // Debug: Log token và URL
      console.log('🔑 getShipperRating - Parameter token:', token ? 'Có token' : 'Không có token');
      console.log('🔑 getShipperRating - Parameter token length:', token ? token.length : 0);
      
      const asyncStorageToken = await AsyncStorage.getItem('token');
      console.log('🔑 getShipperRating - AsyncStorage token:', asyncStorageToken ? 'Có token' : 'Không có token');
      console.log('🔑 getShipperRating - AsyncStorage token length:', asyncStorageToken ? asyncStorageToken.length : 0);
      
      const authToken = token || asyncStorageToken;
      console.log('🔑 getShipperRating - Final authToken:', authToken ? 'Có token' : 'Không có token');
      console.log('🔑 getShipperRating - Final authToken length:', authToken ? authToken.length : 0);
      console.log('🔑 getShipperRating - Final authToken preview:', authToken ? `${authToken.substring(0, 20)}...` : 'N/A');
                  console.log('🔑 getShipperRating - URL:', `${this.BASE_URL}/completed-orders?page=1&limit=10`);
      
                  // Sử dụng API completed-orders để lấy thống kê rating
            const response = await fetch(
              `${this.BASE_URL}/completed-orders?page=1&limit=10`,
              {
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              }
            );
      
      if (!response.ok) {
        console.log('❌ getShipperRating API Error - Status:', response.status);
        console.log('❌ getShipperRating API Error - Status Text:', response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ getShipperRating API Success - Response data:', data);
      console.log('✅ getShipperRating API - Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (data.stats) {
        // Tính toán rating từ orders nếu có
        let calculatedAvgRating = data.stats.average_rating || 0;
        let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        // Nếu có orders và average_rating = 0, tính toán từ orders
        if (data.orders && data.orders.length > 0 && calculatedAvgRating === 0) {
          console.log('🔍 getShipperRating - Rating calculation - Orders found:', data.orders.length);
          
          // Debug: Log tất cả orders để thấy rating
          console.log('🔍 getShipperRating - All orders:', data.orders.map((order: any) => ({
            order_id: order.order_id,
            shipper_rating: order.shipper_rating,
            order_status: order.order_status
          })));
          
          const ratings = data.orders
            .filter(order => order.shipper_rating && order.shipper_rating > 0)
            .map(order => order.shipper_rating);
          
          console.log('🔍 getShipperRating - Rating calculation - Valid ratings:', ratings);
          
          if (ratings.length > 0) {
            calculatedAvgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            console.log('🔍 getShipperRating - Rating calculation - Calculated avg:', calculatedAvgRating);
            
            // Tính rating distribution
            ratings.forEach(rating => {
              const star = Math.round(rating);
              if (star >= 1 && star <= 5) {
                ratingDistribution[star as keyof typeof ratingDistribution]++;
              }
            });
            console.log('🔍 getShipperRating - Rating calculation - Distribution:', ratingDistribution);
          }
        }
        
        // Chuyển đổi format từ completed-orders sang rating stats
        const result = {
          stats: {
            total_ratings: data.stats.total_rated_orders || 0,
            avg_rating: calculatedAvgRating,
            rating_distribution: ratingDistribution,
            delivered_orders: data.stats.total_completed_orders || 0
          }
        };
        
        console.log('🔍 getShipperRating - Final result:', result);
        return result;
      } else {
        throw new Error('Không thể tải thống kê rating');
      }
    } catch (error) {
      console.error('API Error in getShipperRating:', error);
      throw new Error('Lỗi kết nối mạng');
    }
  }

  static async getMyRatings(page = 1, limit = 10, token?: string) {
    console.log('🔍 getMyRatings - Method called with page:', page, 'limit:', limit);
    console.log('🔍 getMyRatings - THIS IS THE SECONDARY METHOD');
    try {
      // Debug: Log token và URL
      console.log('🔑 getMyRatings - Parameter token:', token ? 'Có token' : 'Không có token');
      console.log('🔑 getMyRatings - Parameter token length:', token ? token.length : 0);
      
      const asyncStorageToken = await AsyncStorage.getItem('token');
      console.log('🔑 getMyRatings - AsyncStorage token:', asyncStorageToken ? 'Có token' : 'Không có token');
      console.log('🔑 getMyRatings - AsyncStorage token length:', asyncStorageToken ? asyncStorageToken.length : 0);
      
      const authToken = token || asyncStorageToken;
      console.log('🔑 getMyRatings - Final authToken:', authToken ? 'Có token' : 'Không có token');
      console.log('🔑 getMyRatings - Final authToken length:', authToken ? authToken.length : 0);
      console.log('🔑 getMyRatings - Final authToken preview:', authToken ? `${authToken.substring(0, 20)}...` : 'N/A');
      console.log('🔑 getMyRatings - URL:', `${this.BASE_URL}/completed-orders?page=${page}&limit=${limit}`);
      
      // Sử dụng API completed-orders để lấy thống kê
      const response = await fetch(
        `${this.BASE_URL}/completed-orders?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.log('❌ getShipperRating API Error - Status:', response.status);
        console.log('❌ getShipperRating API Error - Status Text:', response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ getShipperRating API Success - Response data:', data);
      console.log('✅ getShipperRating API - Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (data.stats) {
        // Tính toán rating từ orders nếu có
        let calculatedAvgRating = data.stats.average_rating || 0;
        let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        // Nếu có orders và average_rating = 0, tính toán từ orders
        if (data.orders && data.orders.length > 0 && calculatedAvgRating === 0) {
          console.log('🔍 getMyRatings - Rating calculation - Orders found:', data.orders.length);
          
          // Debug: Log tất cả orders để thấy rating
          console.log('🔍 getMyRatings - All orders:', data.orders.map((order: any) => ({
            order_id: order.order_id,
            shipper_rating: order.shipper_rating,
            order_status: order.order_status
          })));
          
          const ratings = data.orders
            .filter(order => order.shipper_rating && order.shipper_rating > 0)
            .map(order => order.shipper_rating);
          
          console.log('🔍 getMyRatings - Rating calculation - Valid ratings:', ratings);
          
          if (ratings.length > 0) {
            calculatedAvgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            console.log('🔍 getMyRatings - Rating calculation - Calculated avg:', calculatedAvgRating);
            
            // Tính rating distribution
            ratings.forEach(rating => {
              const star = Math.round(rating);
              if (star >= 1 && star <= 5) {
                ratingDistribution[star as keyof typeof ratingDistribution]++;
              }
            });
            console.log('🔍 getMyRatings - Rating calculation - Distribution:', ratingDistribution);
          }
        }
        
        // Chuyển đổi format từ completed-orders sang rating data
        return {
          ratings: [], // Tạm thời để trống vì chưa có API chi tiết
          stats: {
            total_ratings: data.stats.total_rated_orders || 0,
            avg_rating: calculatedAvgRating,
            total_orders: data.stats.total_completed_orders || 0,
            delivered_orders: data.stats.total_completed_orders || 0,
            rating_distribution: ratingDistribution
          },
          pagination: data.pagination || { page: 1, pages: 1, total: 0 }
        };
      } else {
        throw new Error('Không thể tải danh sách đánh giá');
      }
    } catch (error) {
      console.error('API Error in getMyRatings:', error);
      throw new Error('Lỗi kết nối mạng');
    }
  }

  static async getCompletedOrders(page = 1, limit = 50, token?: string) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/completed-orders?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token || await AsyncStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Không thể tải đơn hàng hoàn thành');
      }
    } catch (error) {
      console.error('API Error in getCompletedOrders:', error);
      throw new Error('Lỗi kết nối mạng');
    }
  }
}

export default ShipperRatingService;
