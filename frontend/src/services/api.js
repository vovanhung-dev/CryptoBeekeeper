import axios from 'axios';

// Base URL cho API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor để handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      throw new Error('Không thể kết nối tới server');
    }

    // Handle API errors
    const message = error.response.data?.message || 'Có lỗi xảy ra';
    throw new Error(message);
  }
);

// Analytics APIs
export const analyticsAPI = {
  // Lấy thống kê tổng quan
  getStats: async () => {
    const response = await api.get('/api/analytics/stats');
    return response.data;
  },

  // Lấy danh sách tấn công
  getAttacks: async (params = {}) => {
    const response = await api.get('/api/analytics/attacks', { params });
    return response.data;
  },

  // Lấy top IPs
  getTopIPs: async (limit = 10) => {
    const response = await api.get('/api/analytics/top-ips', { params: { limit } });
    return response.data;
  },

  // Lấy phân loại tấn công
  getAttackTypes: async () => {
    const response = await api.get('/api/analytics/attack-types');
    return response.data;
  },

  // Lấy timeline
  getTimeline: async (days = 7) => {
    const response = await api.get('/api/analytics/timeline', { params: { days } });
    return response.data;
  },

  // Phân tích IP
  analyzeIP: async (ipAddress, hours = 24) => {
    const response = await api.get(`/api/analytics/ip-analysis/${ipAddress}`, { params: { hours } });
    return response.data;
  },

  // Lấy xu hướng
  getTrends: async (days = 7) => {
    const response = await api.get('/api/analytics/trends', { params: { days } });
    return response.data;
  },

  // Lấy công cụ tấn công
  getAttackTools: async () => {
    const response = await api.get('/api/analytics/tools');
    return response.data;
  },

  // Export logs
  exportLogs: async (params = {}) => {
    const response = await api.get('/api/analytics/export', { params });
    return response.data;
  },
};

// Honeypot APIs (for testing purposes)
export const honeypotAPI = {
  // Lấy danh sách tất cả wallets
  getWallets: async (limit = 100, skip = 0) => {
    const response = await api.get('/api/wallet/list', { params: { limit, skip } });
    return response.data;
  },

  // Lấy chi tiết wallet
  getWalletDetail: async (address) => {
    const response = await api.get(`/api/wallet/${address}`);
    return response.data;
  },

  // Tạo wallet
  createWallet: async () => {
    const response = await api.post('/api/wallet/create');
    return response.data;
  },

  // Xóa wallet
  deleteWallet: async (address) => {
    const response = await api.delete(`/api/wallet/${address}`);
    return response.data;
  },

  // Import wallet
  importWallet: async (seedPhrase) => {
    const response = await api.post('/api/wallet/import', { seed_phrase: seedPhrase });
    return response.data;
  },

  // Lấy balance
  getBalance: async (address) => {
    const response = await api.get('/api/wallet/balance', { params: { address } });
    return response.data;
  },

  // Chuyển tiền
  transfer: async (fromAddress, toAddress, amount) => {
    const response = await api.post('/api/transfer', {
      from_address: fromAddress,
      to_address: toAddress,
      amount,
    });
    return response.data;
  },

  // Lấy lịch sử
  getTransactionHistory: async (address) => {
    const response = await api.get('/api/transaction/history', { params: { address } });
    return response.data;
  },

  // Kiểm tra trạng thái transaction
  getTransactionStatus: async (txHash) => {
    const response = await api.get('/api/transaction/status', { params: { hash: txHash } });
    return response.data;
  },
};

// Settings APIs
export const settingsAPI = {
  // Lấy tất cả settings
  getSettings: async () => {
    const response = await api.get('/api/settings');
    return response.data;
  },

  // Lưu settings
  saveSettings: async (settings) => {
    const response = await api.post('/api/settings', settings);
    return response.data;
  },

  // Lấy database settings
  getDatabaseSettings: async () => {
    const response = await api.get('/api/settings/database');
    return response.data;
  },

  // Lấy honeypot settings
  getHoneypotSettings: async () => {
    const response = await api.get('/api/settings/honeypot');
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

export default api;
