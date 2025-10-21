import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AttackTypeChart = ({ data, title = 'Phân loại tấn công' }) => {
  // Transform data for pie chart
  const chartData = data.map((item) => ({
    name: item._id || 'Unknown',
    value: item.count,
  }));

  return (
    <div className="card-standard">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AttackTypeChart;
