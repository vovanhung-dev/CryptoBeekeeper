import React, { useState } from 'react';
import {
  Play,
  Zap,
  Search,
  Send,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { honeypotAPI } from '../services/api';

// Dữ liệu mẫu để demo nhanh
const SAMPLE_DATA = {
  seedPhrases: [
    {
      label: 'Seed phrase mẫu 1',
      value: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    },
    {
      label: 'Seed phrase mẫu 2',
      value: 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong',
    },
    {
      label: 'Seed phrase mẫu 3',
      value: 'letter advice cage absurd amount doctor acoustic avoid letter advice cage above',
    },
  ],
  addresses: [
    {
      label: 'Ví có balance cao',
      value: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE21',
    },
    {
      label: 'Ví Ethereum phổ biến',
      value: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
    },
    {
      label: 'Ví test ngẫu nhiên',
      value: '0x1234567890AbcdEF1234567890aBcDeF12345678',
    },
  ],
  transfers: [
    {
      label: 'Chuyển 0.5 ETH',
      from: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE21',
      to: '0xAttacker1234567890AbcdEF1234567890aBcDeF',
      amount: '0.5',
    },
    {
      label: 'Chuyển 1.0 ETH',
      from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
      to: '0xHacker9876543210FeDcBa0987654321FeDcBa09',
      amount: '1.0',
    },
    {
      label: 'Chuyển toàn bộ 2.5 ETH',
      from: '0x1234567890AbcdEF1234567890aBcDeF12345678',
      to: '0xThief5555555555555555555555555555555555555',
      amount: '2.5',
    },
  ],
};

const Simulation = () => {
  const toast = useToast();

  // Attack simulation states
  const [activeTab, setActiveTab] = useState('import');
  const [loading, setLoading] = useState(false);

  // Import wallet simulation
  const [seedPhrase, setSeedPhrase] = useState('');
  const [importResult, setImportResult] = useState(null);

  // Balance check simulation
  const [checkAddress, setCheckAddress] = useState('');
  const [balanceResult, setBalanceResult] = useState(null);

  // Transfer simulation
  const [transferData, setTransferData] = useState({
    from_address: '',
    to_address: '',
    amount: '',
  });
  const [transferResult, setTransferResult] = useState(null);

  // Attack logs
  const [attackLogs, setAttackLogs] = useState([]);

  const addLog = (type, message, status) => {
    const newLog = {
      id: Date.now(),
      type,
      message,
      status,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
    };
    setAttackLogs((prev) => [newLog, ...prev].slice(0, 20));
  };

  // Simulate import wallet attack
  const handleImportAttack = async () => {
    if (!seedPhrase.trim()) {
      toast.error('Vui lòng nhập seed phrase');
      return;
    }

    const words = seedPhrase.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      toast.error('Seed phrase phải có 12 hoặc 24 từ');
      return;
    }

    setLoading(true);
    addLog('import', `Đang thử import seed phrase: ${words.slice(0, 3).join(' ')}...`, 'pending');

    try {
      const response = await honeypotAPI.importWallet(seedPhrase);

      if (response.success) {
        setImportResult({
          success: true,
          data: response.data,
        });
        addLog('import', `Import thành công! Địa chỉ: ${response.data.address}`, 'success');
        toast.success('Honeypot: Đã ghi nhận hành vi import wallet');
      } else {
        setImportResult({
          success: false,
          message: response.message,
        });
        addLog('import', `Import thất bại: ${response.message}`, 'error');
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: error.message,
      });
      addLog('import', `Lỗi: ${error.message}`, 'error');
    }

    setLoading(false);
  };

  // Simulate balance check attack
  const handleBalanceCheck = async () => {
    if (!checkAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ ví');
      return;
    }

    setLoading(true);
    addLog('balance', `Đang quét balance của: ${checkAddress.slice(0, 10)}...`, 'pending');

    try {
      const response = await honeypotAPI.getBalance(checkAddress);

      if (response.success) {
        setBalanceResult({
          success: true,
          data: response.data,
        });
        addLog(
          'balance',
          `Quét thành công! Balance: ${response.data.balance} ${response.data.currency}`,
          'success'
        );
        toast.success('Honeypot: Đã ghi nhận hành vi quét balance');
      } else {
        setBalanceResult({
          success: false,
          message: response.message,
        });
        addLog('balance', `Quét thất bại: ${response.message}`, 'error');
      }
    } catch (error) {
      setBalanceResult({
        success: false,
        message: error.message,
      });
      addLog('balance', `Lỗi: ${error.message}`, 'error');
    }

    setLoading(false);
  };

  // Simulate transfer attack
  const handleTransferAttack = async () => {
    if (!transferData.from_address || !transferData.to_address || !transferData.amount) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    addLog(
      'transfer',
      `Đang thử chuyển ${transferData.amount} ETH từ ${transferData.from_address.slice(0, 10)}...`,
      'pending'
    );

    try {
      const response = await honeypotAPI.transfer(
        transferData.from_address,
        transferData.to_address,
        parseFloat(transferData.amount)
      );

      if (response.success) {
        setTransferResult({
          success: true,
          data: response.data,
        });
        addLog(
          'transfer',
          `Giao dịch được tạo! Hash: ${response.data.transaction_hash.slice(0, 20)}...`,
          'success'
        );
        toast.success('Honeypot: Đã ghi nhận hành vi chuyển tiền');
      } else {
        setTransferResult({
          success: false,
          message: response.message,
        });
        addLog('transfer', `Giao dịch thất bại: ${response.message}`, 'error');
      }
    } catch (error) {
      setTransferResult({
        success: false,
        message: error.message,
      });
      addLog('transfer', `Lỗi: ${error.message}`, 'error');
    }

    setLoading(false);
  };

  const clearResults = () => {
    setImportResult(null);
    setBalanceResult(null);
    setTransferResult(null);
    setSeedPhrase('');
    setCheckAddress('');
    setTransferData({ from_address: '', to_address: '', amount: '' });
  };

  const tabs = [
    { id: 'import', name: 'Import Seed', icon: Key },
    { id: 'balance', name: 'Quét Balance', icon: Search },
    { id: 'transfer', name: 'Chuyển tiền', icon: Send },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Mô phỏng tấn công</h1>
        <p className="text-sm text-gray-600 mt-1">
          Demo các hành vi tấn công mà honeypot sẽ ghi nhận
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Simulation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Warning */}
          <div className="card-standard bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                  Môi trường mô phỏng
                </h4>
                <p className="text-sm text-yellow-800">
                  Đây là môi trường demo để mô phỏng hành vi của kẻ tấn công. Tất cả các
                  hành động đều được ghi nhận vào hệ thống honeypot. Dùng để trình diễn
                  cách hệ thống hoạt động.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card-standard">
            <div className="border-b border-gray-200 mb-4">
              <div className="flex gap-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Import Seed Tab */}
            {activeTab === 'import' && (
              <div className="space-y-4">
                {/* Quick select sample data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn nhanh dữ liệu mẫu
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_DATA.seedPhrases.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setSeedPhrase(item.value)}
                        className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seed Phrase (12 hoặc 24 từ)
                  </label>
                  <textarea
                    className="input-standard h-24 resize-none"
                    placeholder="Nhập seed phrase để mô phỏng attacker import ví..."
                    value={seedPhrase}
                    onChange={(e) => setSeedPhrase(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleImportAttack}
                  disabled={loading || !seedPhrase.trim()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Mô phỏng Import
                </button>

                {importResult && (
                  <div
                    className={`p-4 rounded-md ${
                      importResult.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {importResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p
                          className={`font-medium ${
                            importResult.success ? 'text-green-800' : 'text-red-800'
                          }`}
                        >
                          {importResult.success ? 'Import thành công!' : 'Import thất bại'}
                        </p>
                        {importResult.success && importResult.data && (
                          <div className="mt-2 text-sm text-green-700">
                            <p>Địa chỉ: {importResult.data.address}</p>
                            <p>Balance: {importResult.data.balance} ETH</p>
                          </div>
                        )}
                        {!importResult.success && (
                          <p className="text-sm text-red-700">{importResult.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Balance Check Tab */}
            {activeTab === 'balance' && (
              <div className="space-y-4">
                {/* Quick select sample data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn nhanh địa chỉ mẫu
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_DATA.addresses.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setCheckAddress(item.value)}
                        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ ví Ethereum
                  </label>
                  <input
                    type="text"
                    className="input-standard font-mono"
                    placeholder="0x..."
                    value={checkAddress}
                    onChange={(e) => setCheckAddress(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleBalanceCheck}
                  disabled={loading || !checkAddress.trim()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Mô phỏng quét Balance
                </button>

                {balanceResult && (
                  <div
                    className={`p-4 rounded-md ${
                      balanceResult.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {balanceResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p
                          className={`font-medium ${
                            balanceResult.success ? 'text-green-800' : 'text-red-800'
                          }`}
                        >
                          {balanceResult.success ? 'Quét thành công!' : 'Quét thất bại'}
                        </p>
                        {balanceResult.success && balanceResult.data && (
                          <div className="mt-2 text-sm text-green-700">
                            <p>Địa chỉ: {balanceResult.data.address}</p>
                            <p className="text-xl font-semibold">
                              Balance: {balanceResult.data.balance} {balanceResult.data.currency}
                            </p>
                          </div>
                        )}
                        {!balanceResult.success && (
                          <p className="text-sm text-red-700">{balanceResult.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transfer Tab */}
            {activeTab === 'transfer' && (
              <div className="space-y-4">
                {/* Quick select sample data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn nhanh giao dịch mẫu
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_DATA.transfers.map((item, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          setTransferData({
                            from_address: item.from,
                            to_address: item.to,
                            amount: item.amount,
                          })
                        }
                        className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Từ địa chỉ (ví nạn nhân)
                  </label>
                  <input
                    type="text"
                    className="input-standard font-mono"
                    placeholder="0x..."
                    value={transferData.from_address}
                    onChange={(e) =>
                      setTransferData({ ...transferData, from_address: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đến địa chỉ (ví attacker)
                  </label>
                  <input
                    type="text"
                    className="input-standard font-mono"
                    placeholder="0x..."
                    value={transferData.to_address}
                    onChange={(e) =>
                      setTransferData({ ...transferData, to_address: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    className="input-standard"
                    placeholder="0.0"
                    value={transferData.amount}
                    onChange={(e) =>
                      setTransferData({ ...transferData, amount: e.target.value })
                    }
                  />
                </div>

                <button
                  onClick={handleTransferAttack}
                  disabled={loading || !transferData.from_address || !transferData.to_address || !transferData.amount}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Mô phỏng chuyển tiền
                </button>

                {transferResult && (
                  <div
                    className={`p-4 rounded-md ${
                      transferResult.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {transferResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p
                          className={`font-medium ${
                            transferResult.success ? 'text-green-800' : 'text-red-800'
                          }`}
                        >
                          {transferResult.success
                            ? 'Giao dịch được tạo!'
                            : 'Giao dịch thất bại'}
                        </p>
                        {transferResult.success && transferResult.data && (
                          <div className="mt-2 text-sm text-green-700 space-y-1">
                            <p>Hash: {transferResult.data.transaction_hash}</p>
                            <p>Trạng thái: {transferResult.data.status}</p>
                            <p>Gas: {transferResult.data.gas}</p>
                          </div>
                        )}
                        {!transferResult.success && (
                          <p className="text-sm text-red-700">{transferResult.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Clear button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={clearResults}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Xóa kết quả
              </button>
            </div>
          </div>
        </div>

        {/* Attack Log Panel */}
        <div className="lg:col-span-1">
          <div className="card-standard sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-600" />
                Log hoạt động
              </h3>
              <button
                onClick={() => setAttackLogs([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Xóa log
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {attackLogs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Chưa có hoạt động nào được ghi nhận
                </p>
              ) : (
                attackLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-md text-sm ${
                      log.status === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : log.status === 'error'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        {log.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        ) : log.status === 'error' ? (
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                        ) : (
                          <Zap className="w-4 h-4 text-yellow-600 mt-0.5" />
                        )}
                        <div>
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mb-1 ${
                              log.type === 'import'
                                ? 'bg-purple-100 text-purple-700'
                                : log.type === 'balance'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {log.type === 'import'
                              ? 'Import'
                              : log.type === 'balance'
                              ? 'Balance'
                              : 'Transfer'}
                          </span>
                          <p className="text-gray-700">{log.message}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {log.timestamp}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card-standard bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Cách hoạt động của Honeypot
            </h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Mỗi hành động import seed phrase sẽ được ghi vào database</li>
              <li>Quét balance giúp attacker tin rằng ví có tiền thật</li>
              <li>Giao dịch chuyển tiền sẽ luôn "pending" - không thực hiện thật</li>
              <li>Tất cả IP, thời gian, payload được log để phân tích</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
