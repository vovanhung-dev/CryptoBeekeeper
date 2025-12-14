import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Key,
  AlertTriangle,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { honeypotAPI } from '../services/api';
import { formatDate } from '../utils/formatters';

const Wallets = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState([]);
  const [totalWallets, setTotalWallets] = useState(0);
  const [creating, setCreating] = useState(false);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      const response = await honeypotAPI.getWallets();

      if (response.success) {
        setWallets(response.data.wallets || []);
        setTotalWallets(response.data.total || 0);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading wallets:', error);
      toast.error('Không thể tải danh sách ví');
      setLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    try {
      setCreating(true);
      const response = await honeypotAPI.createWallet();

      if (response.success) {
        toast.success('Tạo ví giả thành công');
        loadWallets();
      } else {
        toast.error(response.message || 'Không thể tạo ví');
      }
      setCreating(false);
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast.error('Không thể tạo ví');
      setCreating(false);
    }
  };

  const handleViewDetail = async (wallet) => {
    try {
      const response = await honeypotAPI.getWalletDetail(wallet.address);

      if (response.success) {
        setSelectedWallet(response.data);
        setShowDetailModal(true);
        setShowSeedPhrase(false);
        setShowPrivateKey(false);
      } else {
        toast.error('Không thể lấy chi tiết ví');
      }
    } catch (error) {
      console.error('Error getting wallet detail:', error);
      toast.error('Không thể lấy chi tiết ví');
    }
  };

  const handleDeleteClick = (wallet) => {
    setWalletToDelete(wallet);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!walletToDelete) return;

    try {
      setDeleting(true);
      const response = await honeypotAPI.deleteWallet(walletToDelete.address);

      if (response.success) {
        toast.success('Đã xóa ví thành công');
        setShowDeleteModal(false);
        setWalletToDelete(null);
        loadWallets();
      } else {
        toast.error(response.message || 'Không thể xóa ví');
      }
      setDeleting(false);
    } catch (error) {
      console.error('Error deleting wallet:', error);
      toast.error('Không thể xóa ví');
      setDeleting(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Đang tải danh sách ví..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý Ví Giả</h1>
          <p className="text-sm text-gray-600 mt-1">
            Tạo và quản lý các ví honeypot để thu hút kẻ tấn công
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadWallets}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
          <button
            onClick={handleCreateWallet}
            disabled={creating}
            className="btn-primary flex items-center gap-2"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Tạo ví mới
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-standard">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng số ví</p>
              <p className="text-2xl font-semibold text-gray-900">{totalWallets}</p>
            </div>
          </div>
        </div>

        <div className="card-standard">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Seed phrases</p>
              <p className="text-2xl font-semibold text-gray-900">{totalWallets}</p>
            </div>
          </div>
        </div>

        <div className="card-standard">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Trạng thái</p>
              <p className="text-lg font-semibold text-green-600">Hoạt động</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallets List */}
      <div className="card-standard">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách ví giả</h3>

        {wallets.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Chưa có ví nào được tạo</p>
            <button
              onClick={handleCreateWallet}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo ví đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Địa chỉ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Số dư giả
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Loại tiền
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wallets.map((wallet) => (
                  <tr key={wallet.address} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-900">
                          {truncateAddress(wallet.address)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(wallet.address, 'địa chỉ')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-green-600">
                        {wallet.balance?.toFixed(4) || '0.0000'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {wallet.currency || 'ETH'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(wallet.created_at, 'full')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(wallet)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(wallet)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="Xóa ví"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="card-standard bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-900 mb-1">
              Lưu ý về Honeypot
            </h4>
            <p className="text-sm text-yellow-800">
              Các ví này là ví giả được tạo để thu hút kẻ tấn công. Seed phrase và private key
              được cố tình để lộ để ghi nhận hành vi của attacker khi họ cố gắng truy cập.
              Không sử dụng các ví này cho mục đích thực.
            </p>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết ví giả"
        size="lg"
      >
        {selectedWallet && (
          <div className="space-y-4">
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ ví
              </label>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-md">
                <code className="flex-1 text-sm text-gray-900 break-all">
                  {selectedWallet.address}
                </code>
                <button
                  onClick={() => copyToClipboard(selectedWallet.address, 'địa chỉ')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Balance */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số dư giả
                </label>
                <p className="text-2xl font-semibold text-green-600">
                  {selectedWallet.balance?.toFixed(4)} {selectedWallet.currency}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày tạo
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedWallet.created_at, 'full')}
                </p>
              </div>
            </div>

            {/* Seed Phrase */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">
                  Seed Phrase (12 từ)
                </label>
                <button
                  onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {showSeedPhrase ? (
                    <>
                      <EyeOff className="w-4 h-4" /> Ẩn
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" /> Hiện
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                {showSeedPhrase ? (
                  <div className="flex items-start gap-2">
                    <code className="flex-1 text-sm text-gray-900 break-all">
                      {selectedWallet.seed_phrase || 'N/A'}
                    </code>
                    {selectedWallet.seed_phrase && (
                      <button
                        onClick={() =>
                          copyToClipboard(selectedWallet.seed_phrase, 'seed phrase')
                        }
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">••••••••••••••••••••••••</p>
                )}
              </div>
            </div>

            {/* Private Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Private Key</label>
                <button
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {showPrivateKey ? (
                    <>
                      <EyeOff className="w-4 h-4" /> Ẩn
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" /> Hiện
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                {showPrivateKey ? (
                  <div className="flex items-start gap-2">
                    <code className="flex-1 text-sm text-gray-900 break-all">
                      {selectedWallet.private_key || 'N/A'}
                    </code>
                    {selectedWallet.private_key && (
                      <button
                        onClick={() =>
                          copyToClipboard(selectedWallet.private_key, 'private key')
                        }
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">••••••••••••••••••••••••</p>
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                <p className="text-sm text-red-800">
                  Đây là ví honeypot - thông tin này sẽ được dùng để theo dõi kẻ tấn công.
                  Mọi hành động sử dụng seed phrase/private key này sẽ được ghi nhận.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa ví{' '}
            <span className="font-mono text-sm">
              {walletToDelete && truncateAddress(walletToDelete.address)}
            </span>
            ?
          </p>
          <p className="text-sm text-red-600">Hành động này không thể hoàn tác.</p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Xóa ví
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Wallets;
