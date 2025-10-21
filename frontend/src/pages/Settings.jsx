import React from 'react';
import { Database, Shield, Bell, FileText } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Cài đặt</h1>
        <p className="text-sm text-gray-600 mt-1">
          Quản lý cấu hình hệ thống honeypot
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 gap-6">
        {/* Database Settings */}
        <div className="card-standard">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cơ sở dữ liệu</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian lưu trữ logs (ngày)
              </label>
              <input
                type="number"
                className="input-standard"
                defaultValue={90}
                placeholder="Nhập số ngày..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Logs cũ hơn số ngày này sẽ được tự động xóa
              </p>
            </div>
          </div>
        </div>

        {/* Honeypot Settings */}
        <div className="card-standard">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cấu hình Honeypot</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng fake wallets
              </label>
              <input
                type="number"
                className="input-standard"
                defaultValue={10}
                placeholder="Nhập số lượng..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fake balance tối thiểu (ETH)
              </label>
              <input
                type="number"
                step="0.1"
                className="input-standard"
                defaultValue={0.1}
                placeholder="Nhập số tiền..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fake balance tối đa (ETH)
              </label>
              <input
                type="number"
                step="0.1"
                className="input-standard"
                defaultValue={5.0}
                placeholder="Nhập số tiền..."
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card-standard">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
              <span className="text-sm text-gray-700">
                Gửi email khi phát hiện tấn công nguy hiểm
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">
                Thông báo khi có IP tấn công nhiều lần
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
              <span className="text-sm text-gray-700">Báo cáo hàng ngày</span>
            </label>
          </div>
        </div>

        {/* Export Settings */}
        <div className="card-standard">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Xuất dữ liệu</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Định dạng xuất mặc định
              </label>
              <select className="input-standard">
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF (Báo cáo)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn-primary">Lưu cài đặt</button>
      </div>
    </div>
  );
};

export default Settings;
