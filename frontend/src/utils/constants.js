// Application constants

// Attack types mapping
export const ATTACK_TYPES = {
  brute_force: {
    label: 'Brute Force',
    color: 'red',
    description: 'Thử nhiều lần private key hoặc seed phrase'
  },
  api_exploit: {
    label: 'Khai thác API',
    color: 'yellow',
    description: 'Khai thác lỗ hổng API endpoints'
  },
  transaction_test: {
    label: 'Test Giao dịch',
    color: 'blue',
    description: 'Gửi giao dịch test độc hại'
  },
  balance_scan: {
    label: 'Quét Số dư',
    color: 'green',
    description: 'Quét số dư nhiều addresses'
  },
  wallet_creation: {
    label: 'Tạo Ví',
    color: 'purple',
    description: 'Tạo ví hàng loạt'
  },
  wallet_import: {
    label: 'Import Ví',
    color: 'indigo',
    description: 'Import ví từ seed phrase'
  },
  history_scan: {
    label: 'Quét Lịch sử',
    color: 'cyan',
    description: 'Quét lịch sử giao dịch'
  },
  status_check: {
    label: 'Kiểm tra Trạng thái',
    color: 'teal',
    description: 'Kiểm tra trạng thái transaction'
  },
  unknown: {
    label: 'Không xác định',
    color: 'gray',
    description: 'Loại tấn công không xác định'
  }
};

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Chart colors (Tailwind)
export const CHART_COLORS = {
  primary: '#2563eb',    // blue-600
  success: '#10b981',    // green-500
  warning: '#f59e0b',    // yellow-500
  danger: '#ef4444',     // red-500
  info: '#06b6d4',       // cyan-500
  purple: '#8b5cf6',     // purple-500
};

// Time ranges
export const TIME_RANGES = [
  { value: 7, label: '7 ngày qua' },
  { value: 30, label: '30 ngày qua' },
  { value: 90, label: '90 ngày qua' },
];

// Auto-refresh interval (ms)
export const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

// Toast durations
export const TOAST_DURATION = {
  short: 2000,
  medium: 3000,
  long: 5000,
};

// Export formats
export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'pdf', label: 'PDF (Coming soon)', disabled: true },
];
