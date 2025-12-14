import React from 'react';
import { Shield, Zap } from 'lucide-react';
import { formatRelativeTime, parseUTCDate } from '../../utils/formatters';

const RecentAttacks = ({ attacks, onViewAll }) => {
  // Check if attack is very recent (within 10 seconds)
  const isVeryRecent = (timestamp) => {
    const attackTime = parseUTCDate(timestamp);
    if (!attackTime) return false;
    const now = new Date();
    const diffSeconds = (now - attackTime) / 1000;
    return diffSeconds < 10;
  };
  const getAttackTypeColor = (type) => {
    const colors = {
      brute_force: 'bg-red-100 text-red-800',
      api_exploit: 'bg-yellow-100 text-yellow-800',
      transaction_test: 'bg-blue-100 text-blue-800',
      balance_scan: 'bg-green-100 text-green-800',
      wallet_creation: 'bg-purple-100 text-purple-800',
      unknown: 'bg-gray-100 text-gray-800',
    };

    return colors[type] || colors.unknown;
  };

  const getAttackTypeName = (type) => {
    const names = {
      brute_force: 'Brute Force',
      api_exploit: 'Khai thác API',
      transaction_test: 'Test Giao dịch',
      balance_scan: 'Quét Số dư',
      wallet_creation: 'Tạo Ví',
      wallet_import: 'Import Ví',
      history_scan: 'Quét Lịch sử',
      status_check: 'Kiểm tra Trạng thái',
      unknown: 'Không xác định',
    };

    return names[type] || names.unknown;
  };

  return (
    <div className="card-standard">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tấn công gần đây</h3>
        <button
          onClick={onViewAll}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Xem tất cả
        </button>
      </div>

      {attacks.length === 0 ? (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Chưa có tấn công nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attacks.map((attack, index) => {
            const isNew = isVeryRecent(attack.timestamp);
            return (
              <div
                key={attack._id || index}
                className={`flex items-start gap-3 p-3 rounded-md transition-all duration-300 ${
                  isNew
                    ? 'bg-red-50 border border-red-200 animate-pulse'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  isNew ? 'bg-red-600 animate-ping' : 'bg-red-500'
                }`}></div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isNew && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-red-600 text-white">
                        <Zap className="w-3 h-3 mr-0.5" />
                        MỚI
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getAttackTypeColor(
                        attack.attack_type
                      )}`}
                    >
                      {getAttackTypeName(attack.attack_type)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(attack.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-900 font-medium">
                    {attack.ip_address}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {attack.method} {attack.endpoint}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentAttacks;
