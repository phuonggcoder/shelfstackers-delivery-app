const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://server-shelf-stacker-w1ds.onrender.com/api';

let _token: string | null = null;

export const shipperApi = {
  setToken(token: string | null) {
    _token = token;
  },

  async request(path: string, opts: any = {}) {
    const headers: any = { 'Content-Type': 'application/json' };
    if (_token) headers.Authorization = `Bearer ${_token}`;
    const res = await fetch(`${API_BASE}${path}`, { headers, ...opts });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API ${res.status}: ${txt}`);
    }
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async login({ phone, password }: { phone: string; password: string }) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) });
  },

  async getOrders(query = '') {
    return this.request(`/shipper/orders${query ? '?' + query : ''}`);
  },

  async getOrder(id: string) {
    return this.request(`/shipper/orders/${id}`);
  },

  async acceptOrder(id: string) {
    return this.request(`/shipper/orders/${id}/accept`, { method: 'POST' });
  },

  async rejectOrder(id: string) {
    return this.request(`/shipper/orders/${id}/reject`, { method: 'POST' });
  },

  async updateStatus(id: string, body: any) {
    return this.request(`/shipper/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) });
  },
};
