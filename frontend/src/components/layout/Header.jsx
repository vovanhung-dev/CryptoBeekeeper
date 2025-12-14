import React from 'react';
import { Menu, Bell, Search, Shield } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 fixed top-0 left-0 right-0 z-40">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">CryptoBeekeeper</h1>
              <p className="text-xs text-gray-500">Honeypot System</p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search (optional) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 w-48"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
