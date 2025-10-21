import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import { analyticsAPI } from '../services/api';

const Reports = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('attacks');
  const [timeRange, setTimeRange] = useState(7);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);

      const [statsRes, trendsRes, topIPsRes] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getTrends(timeRange),
        analyticsAPI.getTopIPs(10),
      ]);

      setStats({
        general: statsRes.data,
        trends: trendsRes.data,
        topIPs: topIPsRes.data,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error('Không thể tải dữ liệu báo cáo');
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    toast.info('Tính năng xuất PDF đang được phát triển');
  };

  const handleExportCSV = async () => {
    try {
      const response = await analyticsAPI.exportLogs();
      const csv = response.data.csv;

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cryptobeekeeper-report-${new Date().toISOString()}.csv`;
      a.click();

      toast.success('Đã xuất báo cáo CSV thành công');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Không thể xuất báo cáo CSV');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Đang tạo báo cáo..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Báo cáo</h1>
          <p className="text-sm text-gray-600 mt-1">
            Tạo và xuất báo cáo phân tích tấn công
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất CSV
          </button>
          <button onClick={handleExportPDF} className="btn-primary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card-standard">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại báo cáo
            </label>
            <select
              className="input-standard"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="attacks">Tổng hợp tấn công</option>
              <option value="trends">Phân tích xu hướng</option>
              <option value="ips">Top IP addresses</option>
              <option value="tools">Công cụ tấn công</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng thời gian
            </label>
            <select
              className="input-standard"
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
            >
              <option value={7}>7 ngày qua</option>
              <option value={30}>30 ngày qua</option>
              <option value={90}>90 ngày qua</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      {stats && (
        <div className="card-standard">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Xem trước báo cáo
          </h3>

          {/* General Stats */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Tổng quan
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Tổng tấn công</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.general.total_attacks}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tấn công hôm nay</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.general.today_attacks}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">IP độc nhất</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.general.top_ips?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Loại tấn công</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.general.attack_types?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Trends */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Xu hướng
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Xu hướng</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {stats.trends.trend === 'increasing'
                      ? 'Tăng'
                      : stats.trends.trend === 'decreasing'
                      ? 'Giảm'
                      : 'Ổn định'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Trung bình/ngày</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stats.trends.average_per_day}
                  </p>
                </div>
              </div>
            </div>

            {/* Top IPs */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Top 5 IP tấn công nhiều nhất
              </h4>
              <div className="space-y-2">
                {stats.topIPs.slice(0, 5).map((ip, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                  >
                    <span className="text-sm font-mono text-gray-900">
                      {ip._id}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {ip.count} lần
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Info */}
      <div className="card-standard bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Về báo cáo
            </h4>
            <p className="text-sm text-blue-800">
              Báo cáo được tạo tự động từ dữ liệu trong khoảng thời gian đã chọn.
              Bạn có thể xuất báo cáo dưới định dạng CSV hoặc PDF để phân tích chi tiết.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
