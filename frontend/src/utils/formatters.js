// Helper: Convert UTC timestamp string to local Date object
// Backend stores UTC time without 'Z' suffix, so we need to add it
const parseUTCDate = (dateString) => {
  if (!dateString) return null;

  // If string doesn't end with Z and doesn't have timezone info, treat as UTC
  let str = String(dateString);
  if (!str.endsWith('Z') && !str.includes('+') && !str.includes('-', 10)) {
    str = str + 'Z';
  }

  return new Date(str);
};

// Date formatters - properly converts UTC to local time
export const formatDate = (date, format = 'long') => {
  const d = parseUTCDate(date);

  if (!d || isNaN(d.getTime())) {
    return 'N/A';
  }

  if (format === 'short') {
    return d.toLocaleDateString('vi-VN');
  }

  if (format === 'time') {
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  if (format === 'long') {
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (format === 'full') {
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  return d.toISOString();
};

// Format relative time (e.g., "5 phút trước")
export const formatRelativeTime = (date) => {
  const d = parseUTCDate(date);

  if (!d || isNaN(d.getTime())) {
    return 'N/A';
  }

  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'Vừa xong';
  } else if (diffMin < 60) {
    return `${diffMin} phút trước`;
  } else if (diffHour < 24) {
    return `${diffHour} giờ trước`;
  } else if (diffDay < 7) {
    return `${diffDay} ngày trước`;
  } else {
    return formatDate(date, 'short');
  }
};

// Export parseUTCDate for use with date-fns
export { parseUTCDate };

// Number formatters
export const formatNumber = (number) => {
  return new Intl.NumberFormat('vi-VN').format(number);
};

export const formatCurrency = (amount, currency = 'ETH') => {
  return `${amount.toFixed(6)} ${currency}`;
};

// String formatters
export const truncateAddress = (address, startLength = 6, endLength = 4) => {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
