import React, { useState, useEffect } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LogDetail from '../components/logs/LogDetail';
import { useToast } from '../components/common/Toast';
import { analyticsAPI } from '../services/api';
import { formatDate } from '../utils/formatters';

const AttackLogs = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);

  const [selectedLog, setSelectedLog] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    attackType: '',
  });

  useEffect(() => {
    loadLogs();
  }, [currentPage, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        per_page: perPage,
      };

      if (filters.attackType) {
        params.attack_type = filters.attackType;
      }

      if (filters.search) {
        params.ip = filters.search;
      }

      const response = await analyticsAPI.getAttacks(params);

      setLogs(response.data.logs);
      setTotalLogs(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error loading logs:', error);
      toast.error('Không thể tải danh sách tấn công');
      setLoading(false);
    }
  };

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  const handleExport = async () => {
    try {
      const response = await analyticsAPI.exportLogs();
      const csv = response.data.csv;

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attack-logs-${new Date().toISOString()}.csv`;
      a.click();

      toast.success('Đã xuất file thành công');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Không thể xuất file');
    }
  };

  const columns = [
    {
      key: 'timestamp',
      label: 'Thời gian',
      render: (value) => formatDate(value, 'full'),
    },
    {
      key: 'ip_address',
      label: 'Địa chỉ IP',
    },
    {
      key: 'method',
      label: 'Phương thức',
      render: (value, row) => (
        <span className="font-mono text-xs">
          {value} {row.endpoint}
        </span>
      ),
    },
    {
      key: 'attack_type',
      label: 'Loại tấn công',
      render: (value) => {
        const colors = {
          brute_force: 'bg-red-100 text-red-800',
          api_exploit: 'bg-yellow-100 text-yellow-800',
          transaction_test: 'bg-blue-100 text-blue-800',
          balance_scan: 'bg-green-100 text-green-800',
        };

        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              colors[value] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {value}
          </span>
        );
      },
    },
    {
      key: 'geolocation',
      label: 'Quốc gia',
      render: (value) => value?.country || 'Unknown',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Nhật ký tấn công</h1>
          <p className="text-sm text-gray-600 mt-1">
            Danh sách tất cả các cuộc tấn công được ghi nhận
          </p>
        </div>

        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Xuất CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card-standard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm theo IP
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nhập địa chỉ IP..."
                className="input-standard pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          {/* Attack Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại tấn công
            </label>
            <select
              className="input-standard"
              value={filters.attackType}
              onChange={(e) => setFilters({ ...filters, attackType: e.target.value })}
            >
              <option value="">Tất cả</option>
              <option value="brute_force">Brute Force</option>
              <option value="api_exploit">API Exploit</option>
              <option value="transaction_test">Transaction Test</option>
              <option value="balance_scan">Balance Scan</option>
              <option value="wallet_creation">Wallet Creation</option>
            </select>
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', attackType: '' })}
              className="btn-secondary w-full"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-standard p-0">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Table
              columns={columns}
              data={logs}
              onRowClick={handleRowClick}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalLogs / perPage)}
              onPageChange={setCurrentPage}
              totalItems={totalLogs}
              itemsPerPage={perPage}
            />
          </>
        )}
      </div>

      {/* Detail Modal */}
      <LogDetail log={selectedLog} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default AttackLogs;
