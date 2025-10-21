// Email validation
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Ethereum address validation
export const isValidEthereumAddress = (address) => {
  const re = /^0x[a-fA-F0-9]{40}$/;
  return re.test(address);
};

// IP address validation
export const isValidIP = (ip) => {
  const re = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return re.test(ip);
};

// Number validation
export const isPositiveNumber = (value) => {
  return !isNaN(value) && Number(value) > 0;
};

// String validation
export const isEmpty = (value) => {
  return !value || value.trim() === '';
};

export const minLength = (value, min) => {
  return value && value.length >= min;
};

export const maxLength = (value, max) => {
  return value && value.length <= max;
};
