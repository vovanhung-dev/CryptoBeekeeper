import React from 'react';
import Modal from '../common/Modal';
import { Calendar, Globe, Monitor, Code } from 'lucide-react';

const LogDetail = ({ log, isOpen, onClose }) => {
  if (!log) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết tấn công" size="lg">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Thời gian</span>
            </div>
            <p className="text-sm text-gray-900">{formatDate(log.timestamp)}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Địa chỉ IP</span>
            </div>
            <p className="text-sm text-gray-900">{log.ip_address}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Code className="w-4 h-4" />
              <span className="text-sm font-medium">Phương thức</span>
            </div>
            <p className="text-sm text-gray-900">
              {log.method} {log.endpoint}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Monitor className="w-4 h-4" />
              <span className="text-sm font-medium">Loại tấn công</span>
            </div>
            <p className="text-sm text-gray-900">{log.attack_type}</p>
          </div>
        </div>

        {/* Geolocation */}
        {log.geolocation && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Vị trí địa lý</h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Quốc gia:</span>
                  <span className="ml-2 text-gray-900">{log.geolocation.country || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Thành phố:</span>
                  <span className="ml-2 text-gray-900">{log.geolocation.city || 'N/A'}</span>
                </div>
                {log.geolocation.isp && (
                  <div className="col-span-2">
                    <span className="text-gray-500">ISP:</span>
                    <span className="ml-2 text-gray-900">{log.geolocation.isp}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Agent */}
        {log.user_agent && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">User Agent</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <code className="text-xs text-gray-700 break-all">{log.user_agent}</code>
            </div>
          </div>
        )}

        {/* Headers */}
        {log.headers && Object.keys(log.headers).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Headers</h4>
            <div className="bg-gray-50 p-3 rounded-md max-h-48 overflow-y-auto scrollbar-thin">
              <pre className="text-xs text-gray-700">
                {JSON.stringify(log.headers, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Payload */}
        {log.payload && Object.keys(log.payload).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Payload</h4>
            <div className="bg-gray-50 p-3 rounded-md max-h-48 overflow-y-auto scrollbar-thin">
              <pre className="text-xs text-gray-700">
                {JSON.stringify(log.payload, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Query Params */}
        {log.query_params && Object.keys(log.query_params).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Query Parameters</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <pre className="text-xs text-gray-700">
                {JSON.stringify(log.query_params, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LogDetail;
