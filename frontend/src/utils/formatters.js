// Date formatters
export const formatDate = (date, format = 'long') => {
  const d = new Date(date);

  if (format === 'short') {
    return d.toLocaleDateString('vi-VN');
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

  return d.toISOString();
};

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
