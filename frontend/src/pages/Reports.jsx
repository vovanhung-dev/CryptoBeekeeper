import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Calendar, Filter, Printer } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import { analyticsAPI } from '../services/api';

const Reports = () => {
  const toast = useToast();
  const reportRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('attacks');
  const [timeRange, setTimeRange] = useState(7);
  const [stats, setStats] = useState(null);
  const [exporting, setExporting] = useState(false);

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
    if (!stats) {
      toast.error('Không có dữ liệu để xuất báo cáo');
      return;
    }

    setExporting(true);

    // Tạo nội dung HTML cho PDF
    const reportDate = new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const timeRangeText = timeRange === 7 ? '7 ngày qua' : timeRange === 30 ? '30 ngày qua' : '90 ngày qua';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Báo cáo CryptoBeekeeper</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #1f2937;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 28px;
            color: #1e40af;
            margin-bottom: 8px;
          }
          .header p {
            color: #6b7280;
            font-size: 14px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-card {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .stat-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
          }
          .ip-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .ip-table th, .ip-table td {
            padding: 10px 15px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .ip-table th {
            background: #f3f4f6;
            font-weight: 600;
            color: #374151;
          }
          .ip-table tr:hover {
            background: #f9fafb;
          }
          .trend-box {
            display: flex;
            gap: 30px;
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
          }
          .trend-item {
            flex: 1;
          }
          .trend-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .trend-value {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🐝 CryptoBeekeeper - Báo cáo Honeypot</h1>
          <p>Ngày tạo: ${reportDate} | Khoảng thời gian: ${timeRangeText}</p>
        </div>

        <div class="section">
          <h2 class="section-title">Tổng quan hệ thống</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Tổng tấn công</div>
              <div class="stat-value">${stats.general.total_attacks || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Tấn công hôm nay</div>
              <div class="stat-value">${stats.general.today_attacks || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">IP độc nhất</div>
              <div class="stat-value">${stats.general.top_ips?.length || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Loại tấn công</div>
              <div class="stat-value">${stats.general.attack_types?.length || 0}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Xu hướng tấn công</h2>
          <div class="trend-box">
            <div class="trend-item">
              <div class="trend-label">Xu hướng hiện tại</div>
              <div class="trend-value">${
                stats.trends.trend === 'increasing' ? '📈 Tăng' :
                stats.trends.trend === 'decreasing' ? '📉 Giảm' : '➡️ Ổn định'
              }</div>
            </div>
            <div class="trend-item">
              <div class="trend-label">Trung bình mỗi ngày</div>
              <div class="trend-value">${stats.trends.average_per_day || 0} cuộc</div>
            </div>
            <div class="trend-item">
              <div class="trend-label">Tổng trong khoảng thời gian</div>
              <div class="trend-value">${stats.trends.total || 0} cuộc</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Top 10 IP tấn công nhiều nhất</h2>
          <table class="ip-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Địa chỉ IP</th>
                <th>Số lần tấn công</th>
              </tr>
            </thead>
            <tbody>
              ${stats.topIPs.slice(0, 10).map((ip, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td style="font-family: monospace;">${ip._id}</td>
                  <td><strong>${ip.count}</strong> lần</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>CryptoBeekeeper Honeypot System - Báo cáo được tạo tự động</p>
          <p>Mô phỏng ví tiền điện tử nhằm nghiên cứu hành vi tấn công</p>
        </div>
      </body>
      </html>
    `;

    // Mở cửa sổ in mới
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Đợi nội dung load xong rồi in
      printWindow.onload = () => {
        printWindow.print();
        // Không đóng cửa sổ ngay để user có thể lưu PDF
      };

      toast.success('Đang mở cửa sổ in - Chọn "Save as PDF" để lưu');
    } else {
      toast.error('Không thể mở cửa sổ in. Vui lòng tắt popup blocker');
    }

    setExporting(false);
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
          <button
            onClick={handleExportPDF}
            disabled={exporting || !stats}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                Xuất PDF
              </>
            )}
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
