import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Shield } from 'lucide-react';

const RecentAttacks = ({ attacks, onViewAll }) => {
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
          {attacks.map((attack, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getAttackTypeColor(
                      attack.attack_type
                    )}`}
                  >
                    {getAttackTypeName(attack.attack_type)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(attack.timestamp), {
                      addSuffix: true,
                      locale: vi,
                    })}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentAttacks;
