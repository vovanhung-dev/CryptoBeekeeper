import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  BarChart3,
  Settings,
  FileText,
  Wallet,
  Zap,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    {
      name: 'Tổng quan',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Quản lý ví giả',
      path: '/wallets',
      icon: Wallet,
    },
    {
      name: 'Mô phỏng tấn công',
      path: '/simulation',
      icon: Zap,
    },
    {
      name: 'Nhật ký tấn công',
      path: '/logs',
      icon: Shield,
    },
    {
      name: 'Phân tích',
      path: '/analytics',
      icon: BarChart3,
    },
    {
      name: 'Báo cáo',
      path: '/reports',
      icon: FileText,
    },
    {
      name: 'Cài đặt',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Backdrop cho mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-gray-50 border-r border-gray-200 z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Version 1.0.0</p>
            <p className="mt-1">© 2025 CryptoBeekeeper</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
