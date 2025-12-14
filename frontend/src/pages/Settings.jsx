import React, { useState, useEffect } from 'react';
import { Database, Shield, Bell, FileText, Save } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import { settingsAPI } from '../services/api';

const Settings = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    database: {
      log_retention_days: 90,
    },
    honeypot: {
      fake_wallet_count: 10,
      min_fake_balance: 0.1,
      max_fake_balance: 5.0,
    },
    notifications: {
      email_on_dangerous_attack: true,
      notify_repeated_ip: false,
      daily_report: true,
    },
    export: {
      default_format: 'csv',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();

      if (response.success && response.data) {
        setSettings((prev) => ({
          ...prev,
          ...response.data,
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Không thể tải cài đặt');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await settingsAPI.saveSettings(settings);

      if (response.success) {
        toast.success('Lưu cài đặt thành công');
      } else {
        toast.error(response.message || 'Không thể lưu cài đặt');
      }

      setSaving(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Không thể lưu cài đặt');
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Đang tải cài đặt..." />;
  }

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
                value={settings.database.log_retention_days}
                onChange={(e) =>
                  updateSetting('database', 'log_retention_days', parseInt(e.target.value) || 90)
                }
                placeholder="Nhập số ngày..."
                min={1}
                max={365}
              />
              <p className="text-xs text-gray-500 mt-1">
                Logs cũ hơn số ngày này sẽ được tự động xóa (1-365 ngày)
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
                value={settings.honeypot.fake_wallet_count}
                onChange={(e) =>
                  updateSetting('honeypot', 'fake_wallet_count', parseInt(e.target.value) || 10)
                }
                placeholder="Nhập số lượng..."
                min={1}
                max={100}
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
                value={settings.honeypot.min_fake_balance}
                onChange={(e) =>
                  updateSetting('honeypot', 'min_fake_balance', parseFloat(e.target.value) || 0.1)
                }
                placeholder="Nhập số tiền..."
                min={0}
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
                value={settings.honeypot.max_fake_balance}
                onChange={(e) =>
                  updateSetting('honeypot', 'max_fake_balance', parseFloat(e.target.value) || 5.0)
                }
                placeholder="Nhập số tiền..."
                min={0}
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
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
                checked={settings.notifications.email_on_dangerous_attack}
                onChange={(e) =>
                  updateSetting('notifications', 'email_on_dangerous_attack', e.target.checked)
                }
              />
              <span className="text-sm text-gray-700">
                Gửi email khi phát hiện tấn công nguy hiểm
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
                checked={settings.notifications.notify_repeated_ip}
                onChange={(e) =>
                  updateSetting('notifications', 'notify_repeated_ip', e.target.checked)
                }
              />
              <span className="text-sm text-gray-700">
                Thông báo khi có IP tấn công nhiều lần
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
                checked={settings.notifications.daily_report}
                onChange={(e) => updateSetting('notifications', 'daily_report', e.target.checked)}
              />
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
              <select
                className="input-standard"
                value={settings.export.default_format}
                onChange={(e) => updateSetting('export', 'default_format', e.target.value)}
              >
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
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Lưu cài đặt
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;
