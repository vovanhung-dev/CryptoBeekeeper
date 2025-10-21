import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import { analyticsAPI } from '../services/api';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Analytics = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState(null);
  const [topIPs, setTopIPs] = useState([]);
  const [tools, setTools] = useState([]);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const [trendsRes, topIPsRes, toolsRes] = await Promise.all([
        analyticsAPI.getTrends(timeRange),
        analyticsAPI.getTopIPs(10),
        analyticsAPI.getAttackTools(),
      ]);

      setTrends(trendsRes.data);
      setTopIPs(topIPsRes.data);
      setTools(toolsRes.data);

      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Không thể tải dữ liệu phân tích');
      setLoading(false);
    }
  };

  const getTrendIcon = () => {
    if (!trends) return null;

    switch (trends.trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-green-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendText = () => {
    if (!trends) return '';

    switch (trends.trend) {
      case 'increasing':
        return 'Tăng';
      case 'decreasing':
        return 'Giảm';
      default:
        return 'Ổn định';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Đang tải phân tích..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Phân tích chi tiết</h1>
          <p className="text-sm text-gray-600 mt-1">
            Phân tích xu hướng và hành vi tấn công
          </p>
        </div>

        {/* Time Range Selector */}
        <select
          className="input-standard w-48"
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
        >
          <option value={7}>7 ngày qua</option>
          <option value={30}>30 ngày qua</option>
          <option value={90}>90 ngày qua</option>
        </select>
      </div>

      {/* Trends Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-standard">
          <div className="flex items-center gap-3">
            {getTrendIcon()}
            <div>
              <p className="text-sm text-gray-600">Xu hướng</p>
              <p className="text-xl font-semibold text-gray-900">{getTrendText()}</p>
            </div>
          </div>
        </div>

        <div className="card-standard">
          <p className="text-sm text-gray-600 mb-1">Trung bình mỗi ngày</p>
          <p className="text-2xl font-semibold text-gray-900">
            {trends?.average_per_day || 0}
          </p>
        </div>

        <div className="card-standard">
          <p className="text-sm text-gray-600 mb-1">Tổng tấn công</p>
          <p className="text-2xl font-semibold text-gray-900">
            {trends?.total_attacks || 0}
          </p>
        </div>
      </div>

      {/* Top IPs */}
      <div className="card-standard">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 10 địa chỉ IP tấn công nhiều nhất
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topIPs}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="_id"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attack Tools */}
      <div className="card-standard">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Công cụ tấn công được sử dụng
        </h3>

        <div className="space-y-3">
          {tools.slice(0, 10).map((tool, index) => {
            const percentage = (tool.count / tools.reduce((sum, t) => sum + t.count, 0)) * 100;

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-48 text-sm font-medium text-gray-700 truncate">
                  {tool.tool}
                </div>

                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="w-20 text-right">
                  <span className="text-sm font-medium text-gray-900">{tool.count}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
