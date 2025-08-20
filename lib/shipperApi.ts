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
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}${path}`, { headers, ...opts });
      
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
        return await res.json();
      } catch (e) {
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
  async getOrders(query = '') {
    const q = query ? '?' + query : '';
    const primary = `${API_ENDPOINTS.GET_ORDERS}${q}`;
    try {
      return await this.request(primary);
  } catch (err) {
      // Fallbacks: some backends expose orders under /api/orders (with /my for current user)
      const fallbacks = [`/api/orders/my${q}`, `/api/orders${q}`];
      for (const path of fallbacks) {
        try {
          const res = await this.request(path);
          return res;
    } catch {
          // ignore and try next
        }
      }
      throw err;
    }
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

  async updateStatus(id: string, body: any) {
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
};
