import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, AlertTriangle, TrendingUp, Radio, Bell } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import AttackChart from '../components/dashboard/AttackChart';
import AttackTypeChart from '../components/dashboard/AttackTypeChart';
import RecentAttacks from '../components/dashboard/RecentAttacks';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import { analyticsAPI } from '../services/api';

// Attack type names for notifications
const ATTACK_TYPE_NAMES = {
  brute_force: 'Brute Force',
  api_exploit: 'Khai thác API',
  transaction_test: 'Test Giao dịch',
  balance_scan: 'Quét Số dư',
  wallet_creation: 'Tạo Ví',
  wallet_import: 'Import Ví',
  history_scan: 'Quét Lịch sử',
  status_check: 'Kiểm tra Trạng thái',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [attackTypes, setAttackTypes] = useState([]);
  const [recentAttacks, setRecentAttacks] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [newAttackAlert, setNewAttackAlert] = useState(false);

  // Track previous total to detect new attacks
  const prevTotalRef = useRef(null);
  const prevAttacksRef = useRef([]);

  const loadDashboardData = useCallback(async (showNotification = true) => {
    try {
      // Load all data in parallel
      const [statsRes, timelineRes, attackTypesRes, recentAttacksRes] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getTimeline(7),
        analyticsAPI.getAttackTypes(),
        analyticsAPI.getAttacks({ page: 1, per_page: 5 }),
      ]);

      const newTotal = statsRes.data?.total_attacks || 0;
      const newAttacks = recentAttacksRes.data.logs || [];

      // Check for new attacks and show notification
      if (showNotification && prevTotalRef.current !== null && newTotal > prevTotalRef.current) {
        const attackCount = newTotal - prevTotalRef.current;

        // Find the newest attack to show in notification
        if (newAttacks.length > 0 && newAttacks[0]) {
          const newestAttack = newAttacks[0];
          const attackTypeName = ATTACK_TYPE_NAMES[newestAttack.attack_type] || newestAttack.attack_type;

          toast.warning(
            `🚨 Phát hiện ${attackCount} tấn công mới: ${attackTypeName} từ ${newestAttack.ip_address}`
          );

          // Flash animation
          setNewAttackAlert(true);
          setTimeout(() => setNewAttackAlert(false), 2000);

          // Play notification sound (optional)
          playNotificationSound();
        }
      }

      // Update refs
      prevTotalRef.current = newTotal;
      prevAttacksRef.current = newAttacks;

      setStats(statsRes.data);
      setTimeline(timelineRes.data);
      setAttackTypes(attackTypesRes.data);
      setRecentAttacks(newAttacks);
      setLastUpdate(new Date());

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (loading) {
        toast.error('Không thể tải dữ liệu dashboard');
      }
      setLoading(false);
    }
  }, [loading, toast]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      // Audio not supported
    }
  };

  useEffect(() => {
    loadDashboardData(false); // Don't show notification on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto refresh mỗi 3 giây khi live mode
    const interval = setInterval(() => {
      if (isLive) {
        loadDashboardData(true);
      }
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tổng quan</h1>
          <p className="text-sm text-gray-600 mt-1">
            Theo dõi và phân tích các cuộc tấn công vào hệ thống honeypot
          </p>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Cập nhật lần cuối</p>
            <p className="text-sm text-gray-700">
              {lastUpdate.toLocaleTimeString('vi-VN')}
            </p>
          </div>

          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              isLive
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Radio className={`w-4 h-4 ${isLive ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">
              {isLive ? 'LIVE' : 'Tạm dừng'}
            </span>
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* New Attack Alert Banner */}
      {newAttackAlert && (
        <div className="bg-red-500 text-white px-4 py-3 rounded-lg flex items-center gap-3 animate-pulse">
          <Bell className="w-5 h-5" />
          <span className="font-medium">Phát hiện tấn công mới!</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`transition-all duration-300 ${newAttackAlert ? 'scale-105 ring-2 ring-red-400 rounded-lg' : ''}`}>
          <StatsCard
            title="Tổng tấn công"
            value={stats?.total_attacks || 0}
            icon={Shield}
            color="blue"
          />
        </div>
        <div className={`transition-all duration-300 ${newAttackAlert ? 'scale-105 ring-2 ring-red-400 rounded-lg' : ''}`}>
          <StatsCard
            title="Tấn công hôm nay"
            value={stats?.today_attacks || 0}
            icon={Activity}
            color="green"
          />
        </div>
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
