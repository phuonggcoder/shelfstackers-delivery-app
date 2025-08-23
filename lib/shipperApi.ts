import { API_ENDPOINTS, APP_CONFIG, ERROR_MESSAGES } from './config';

let _token: string | null = null;

export const shipperApi = {
  setToken(token: string | null) {
    _token = token;
  },

  async request(path: string, opts: any = {}) {
    const headers: any = { 'Content-Type': 'application/json' };
    if (_token) headers.Authorization = `Bearer ${_token}`;
    
    try {
      const url = `${APP_CONFIG.API_BASE_URL}${path}`;
      // Debug: log request
      try {
        console.log('[API REQUEST]', opts.method || 'GET', url, 'headers:', headers, 'body:', opts.body ? opts.body.substring(0, 300) : null);
      } catch { }
      const res = await fetch(url, { headers, ...opts });
      
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = ERROR_MESSAGES.SERVER_ERROR;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.msg || errorMessage;
        } catch {
          // If not JSON, use the text directly
          if (errorText) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      try {
        const json = await res.json();
        try { console.log('[API RESPONSE]', url, 'status:', res.status, 'body:', json); } catch { }
        return json;
      } catch {
        try { console.log('[API RESPONSE] no-json', url, 'status:', res.status); } catch { }
        return null;
      }
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      throw error;
    }
  },

  // Authentication endpoints - using /auth prefix
  async requestOtp(phone: string) {
    return this.request(API_ENDPOINTS.REQUEST_OTP, { 
      method: 'POST', 
      body: JSON.stringify({ phone }) 
    });
  },

  async verifyOtp(phone: string, otp: string) {
    return this.request(API_ENDPOINTS.VERIFY_OTP, { 
      method: 'POST', 
      body: JSON.stringify({ phone, otp }) 
    });
  },

  async login(email: string, password: string) {
    return this.request(API_ENDPOINTS.LOGIN, { 
      method: 'POST', 
      body: JSON.stringify({ email, password }) 
    });
  },

  async register(userData: {
    username?: string;
    password: string;
    email: string;
    full_name?: string;
    phone_number?: string;
    gender?: string;
    birth_date?: string;
    avatar?: string;
    roles?: string[];
  }) {
    return this.request(API_ENDPOINTS.REGISTER, { 
      method: 'POST', 
      body: JSON.stringify(userData) 
    });
  },

  async googleSignIn(idToken: string) {
    return this.request(API_ENDPOINTS.GOOGLE_SIGNIN, { 
      method: 'POST', 
      body: JSON.stringify({ id_token: idToken }) 
    });
  },

  async refreshToken(refreshToken: string) {
    return this.request(API_ENDPOINTS.REFRESH_TOKEN, { 
      method: 'POST', 
      body: JSON.stringify({ refresh_token: refreshToken }) 
    });
  },

  async validateToken() {
    return this.request(API_ENDPOINTS.VALIDATE_TOKEN);
  },

  async getGoogleAuthStatus() {
    return this.request(API_ENDPOINTS.GOOGLE_AUTH_STATUS);
  },

  async testGoogleToken(idToken: string) {
    return this.request(API_ENDPOINTS.TEST_GOOGLE_TOKEN, { 
      method: 'POST', 
      body: JSON.stringify({ id_token: idToken }) 
    });
  },

  // User Management - using /api/users prefix
  async getCurrentUser() {
    return this.request(API_ENDPOINTS.GET_CURRENT_USER);
  },

  async updateProfile(profileData: any) {
    return this.request(API_ENDPOINTS.UPDATE_PROFILE, { 
      method: 'PUT', 
      body: JSON.stringify(profileData) 
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request(API_ENDPOINTS.CHANGE_PASSWORD, { 
      method: 'PUT', 
      body: JSON.stringify({ currentPassword, newPassword }) 
    });
  },

  async registerDeviceToken(deviceToken: string, deviceId?: string) {
    return this.request(API_ENDPOINTS.REGISTER_DEVICE_TOKEN, { 
      method: 'POST', 
      body: JSON.stringify({ deviceToken, deviceId }) 
    });
  },

  async unregisterDeviceToken(deviceToken: string) {
    return this.request(API_ENDPOINTS.UNREGISTER_DEVICE_TOKEN, { 
      method: 'DELETE', 
      body: JSON.stringify({ deviceToken }) 
    });
  },

  async getDeviceTokens() {
    return this.request(API_ENDPOINTS.GET_DEVICE_TOKENS);
  },

  // Session Management
  async createSession(deviceId: string, platform?: string, deviceInfo?: string) {
    return this.request(API_ENDPOINTS.CREATE_SESSION, { 
      method: 'POST', 
      body: JSON.stringify({ device_id: deviceId, platform, device_info: deviceInfo }) 
    });
  },

  async updateSessionFCM(deviceId: string, fcmToken: string) {
    return this.request(API_ENDPOINTS.UPDATE_SESSION_FCM, { 
      method: 'POST', 
      body: JSON.stringify({ device_id: deviceId, fcm_token: fcmToken }) 
    });
  },

  async getMySessions() {
    return this.request(API_ENDPOINTS.GET_MY_SESSIONS);
  },

  async deleteSession(deviceId: string) {
    return this.request(API_ENDPOINTS.DELETE_SESSION, { 
      method: 'DELETE', 
      body: JSON.stringify({ device_id: deviceId }) 
    });
  },

  // Shipper Endpoints - using /api/shipper prefix
  async getOrders(params: { status?: string; page?: number; limit?: number } = {}) {
    const { status, page = 1, limit = 50 } = params;
    const queryParams = new URLSearchParams();
    
    if (status) queryParams.append('status', status);
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    
    const query = queryParams.toString();
    const q = query ? '?' + query : '';
    
    const primary = `${API_ENDPOINTS.GET_ORDERS}${q}`;
    try {
      const res = await this.request(primary);
      // Handle new response format from shipperRouter
      if (res && res.orders && Array.isArray(res.orders)) {
        return res; // Return full response with orders array and pagination
      }
      // If primary returns nothing or an empty payload, try fallbacks
      const isEmpty = !res || (Array.isArray(res) && res.length === 0) || (res && typeof res === 'object' && !res.orders && !res.data && (Object.keys(res).length === 0));
      if (!isEmpty) return res;
    } catch {
      // will try fallbacks below
    }

    // Fallbacks: some backends expose orders under /api/orders (with /my for current user)
    const fallbacks = [`/api/orders/my${q}`, `/api/orders${q}`];
    for (const path of fallbacks) {
      try {
        const res = await this.request(path);
        const isEmpty = !res || (Array.isArray(res) && res.length === 0) || (res && typeof res === 'object' && !res.orders && !res.data && (Object.keys(res).length === 0));
        if (!isEmpty) return res;
      } catch {
        // ignore and try next
      }
    }
    // If nothing returned, return empty array so UI shows fallback message
    return [];
  },

  async getOrder(id: string) {
    const primary = `${API_ENDPOINTS.GET_ORDER}/${id}`;
    try {
      return await this.request(primary);
    } catch (err) {
      // fallback to /api/orders/:id
      try {
        return await this.request(`/api/orders/${id}`);
      } catch {
        throw err;
      }
    }
  },

  async acceptOrder(id: string) {
    const primary = `${API_ENDPOINTS.ACCEPT_ORDER}/${id}/accept`;
    try {
      return await this.request(primary, { method: 'POST' });
    } catch {
      // fallback: try /api/orders/:id/accept or set status via /api/orders/:id/status
      try {
        return await this.request(`/api/orders/${id}/accept`, { method: 'POST' });
      } catch {
        return this.request(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ order_status: 'OutForDelivery' }) });
      }
    }
  },

  async rejectOrder(id: string) {
    const primary = `${API_ENDPOINTS.REJECT_ORDER}/${id}/reject`;
    try {
      return await this.request(primary, { method: 'POST' });
    } catch {
      try {
        return await this.request(`/api/orders/${id}/reject`, { method: 'POST' });
      } catch {
        return this.request(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ order_status: 'Cancelled' }) });
      }
    }
  },

  async updateStatus(id: string, body: { order_status: string; note?: string }) {
    const primary = `${API_ENDPOINTS.UPDATE_STATUS}/${id}/status`;
    try {
      return await this.request(primary, {
        method: 'PATCH',
        body: JSON.stringify(body)
      });
    } catch (err) {
      // fallback to general orders status endpoint
      try {
        return await this.request(`/api/orders/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify(body)
        });
      } catch {
          throw err;
        }
    }
  },

  // New method to get orders by specific status with better filtering
  async getOrdersByStatus(status: string, page: number = 1, limit: number = 50) {
    return this.getOrders({ status, page, limit });
  },

  // New method to get available orders (unassigned or assigned to current shipper)
  async getAvailableOrders(page: number = 1, limit: number = 50) {
    // For available orders, we want AwaitingPickup status
    return this.getOrders({ status: 'AwaitingPickup', page, limit });
  },

  // New method to get assigned orders for current shipper
  async getAssignedOrders(page: number = 1, limit: number = 50) {
    // For assigned orders, we want orders that are not AwaitingPickup
    return this.getOrders({ page, limit });
  },
};
