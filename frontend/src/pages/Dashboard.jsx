import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import AttackChart from '../components/dashboard/AttackChart';
import AttackTypeChart from '../components/dashboard/AttackTypeChart';
import RecentAttacks from '../components/dashboard/RecentAttacks';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import { analyticsAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [attackTypes, setAttackTypes] = useState([]);
  const [recentAttacks, setRecentAttacks] = useState([]);

  useEffect(() => {
    loadDashboardData();

    // Auto refresh mỗi 30 giây
    const interval = setInterval(loadDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load all data in parallel
      const [statsRes, timelineRes, attackTypesRes, recentAttacksRes] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getTimeline(7),
        analyticsAPI.getAttackTypes(),
        analyticsAPI.getAttacks({ page: 1, per_page: 5 }),
      ]);

      setStats(statsRes.data);
      setTimeline(timelineRes.data);
      setAttackTypes(attackTypesRes.data);
      setRecentAttacks(recentAttacksRes.data.logs);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Không thể tải dữ liệu dashboard');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tổng quan</h1>
        <p className="text-sm text-gray-600 mt-1">
          Theo dõi và phân tích các cuộc tấn công vào hệ thống honeypot
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng tấn công"
          value={stats?.total_attacks || 0}
          icon={Shield}
          color="blue"
        />
        <StatsCard
          title="Tấn công hôm nay"
          value={stats?.today_attacks || 0}
          icon={Activity}
          color="green"
        />
        <StatsCard
          title="IP độc nhất"
          value={stats?.top_ips?.length || 0}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatsCard
          title="Loại tấn công"
          value={stats?.attack_types?.length || 0}
          icon={TrendingUp}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttackChart data={timeline} title="Tấn công 7 ngày qua" />
        <AttackTypeChart data={attackTypes} title="Phân loại tấn công" />
      </div>

      {/* Recent Attacks */}
      <RecentAttacks
        attacks={recentAttacks}
        onViewAll={() => navigate('/logs')}
      />
    </div>
  );
};

export default Dashboard;
