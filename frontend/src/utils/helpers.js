// Helper functions

import { ATTACK_TYPES } from './constants';

/**
 * Get attack type info
 */
export const getAttackTypeInfo = (type) => {
  return ATTACK_TYPES[type] || ATTACK_TYPES.unknown;
};

/**
 * Get attack type color classes
 */
export const getAttackTypeColorClass = (type) => {
  const colors = {
    brute_force: 'bg-red-100 text-red-800',
    api_exploit: 'bg-yellow-100 text-yellow-800',
    transaction_test: 'bg-blue-100 text-blue-800',
    balance_scan: 'bg-green-100 text-green-800',
    wallet_creation: 'bg-purple-100 text-purple-800',
    wallet_import: 'bg-indigo-100 text-indigo-800',
    history_scan: 'bg-cyan-100 text-cyan-800',
    status_check: 'bg-teal-100 text-teal-800',
    unknown: 'bg-gray-100 text-gray-800',
  };

  return colors[type] || colors.unknown;
};

/**
 * Download file from blob
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Download CSV from text
 */
export const downloadCSV = (csvText, filename = 'export.csv') => {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
};

/**
 * Download JSON
 */
export const downloadJSON = (data, filename = 'export.json') => {
  const jsonText = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonText], { type: 'application/json' });
  downloadFile(blob, filename);
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if object is empty
 */
export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};
