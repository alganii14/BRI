import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Database, Upload, Settings, BarChart3, LogOut, User, X, AlertTriangle, Users, Building2, Package, FileSpreadsheet } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/rfmts', icon: Users, label: 'RFMT' },
    { path: '/ukers', icon: Building2, label: 'Uker' },
    { path: '/product-types', icon: Package, label: 'Product Type' },
    { path: '/di319', icon: FileSpreadsheet, label: 'DI319 Data' },
    { path: '/import', icon: Upload, label: 'Import Data' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    // Remove all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    setShowLogoutModal(false);
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const username = localStorage.getItem('username') || 'Admin';

  return (
    <>
      <div className="h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white fixed left-0 top-0 shadow-xl">
        {/* Logo */}
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <BarChart3 size={32} className="text-blue-300" />
            <div>
              <h1 className="text-xl font-bold">Pipeline</h1>
              <p className="text-xs text-blue-300">Dashboard System</p>
            </div>
          </div>
        </div>

      {/* Menu Items */}
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition-all duration-200 ${
                active
                  ? 'bg-blue-700 border-l-4 border-white text-white font-semibold'
                  : 'hover:bg-blue-700/50 text-blue-100'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full border-t border-blue-700">
        {/* User Info */}
        <div className="p-4 bg-blue-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{username}</p>
              <p className="text-xs text-blue-300">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
        <p className="text-xs text-blue-300 text-center py-3">
          © 2025 Pipeline Dashboard
        </p>
      </div>
    </div>

    {/* Logout Confirmation Modal - Rendered outside sidebar */}
    {showLogoutModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden relative z-[10000]">
            {/* Header */}
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-white" size={24} />
                <h3 className="text-white font-bold text-lg">Konfirmasi Logout</h3>
              </div>
              <button
                onClick={handleLogoutCancel}
                className="text-white hover:text-red-100 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 text-center mb-2">
                Apakah Anda yakin ingin keluar dari aplikasi?
              </p>
              <p className="text-gray-500 text-sm text-center">
                Anda harus login kembali untuk mengakses dashboard.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center gap-2"
              >
                <LogOut size={16} />
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
