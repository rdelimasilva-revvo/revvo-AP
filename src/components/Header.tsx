import React, { useState } from 'react';
import { User, LogOut, Settings, Bell, Search } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
  sidebarCollapsed: boolean;
  pageTitle: string;
  onSearchClick?: () => void;
  onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, sidebarCollapsed, pageTitle, onSearchClick, onSettingsClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className={`fixed top-0 left-0 ${sidebarCollapsed ? 'lg:left-0' : 'lg:left-64'} right-0 bg-white border-b border-gray-100 z-20 transition-all duration-300`}>
      <div className="px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Left — page title */}
        <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate ml-10 lg:ml-0">{pageTitle}</h1>

        {/* Center — search */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4 md:mx-8 hidden sm:block">
          <button
            onClick={onSearchClick}
            className="w-full flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors bg-gray-50/50"
          >
            <Search className="w-4 h-4" />
            <span>Ir para...</span>
            <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right — actions + user */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Settings */}
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block" />

          {/* User */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900 leading-tight">Usuário Admin</p>
                <p className="text-xs text-gray-500 leading-tight">admin@revvo.com.br</p>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Usuário Admin</p>
                    <p className="text-xs text-gray-500">admin@revvo.com.br</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
