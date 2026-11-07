import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  ShoppingCart, 
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { AppleButton } from './UI/AppleButton';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenNewSale: () => void;
  onOpenNewProduct: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsMobileMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenNewSale,
  onOpenNewProduct,
  searchQuery,
  setSearchQuery,
  setIsMobileMenuOpen
}) => {
  const { products, invoices, dbStatus, isSyncing, refreshFromDb } = useData();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Business Overview',
      subtitle: 'Real-time performance of seed inventory, daily revenue, and employee payroll'
    },
    products: {
      title: 'Seed Inventory & Stock',
      subtitle: 'Manage imported hybrid batches, local farm production, and stock updates'
    },
    sales: {
      title: 'Sales & Sell Dashboard',
      subtitle: 'Daily & monthly sell reports, customer orders, and instant stock deduction'
    },
    invoices: {
      title: 'Invoices & Billing',
      subtitle: 'Itemized invoices with tax, salesperson terms, and instant print/PDF demo format'
    },
    customers: {
      title: 'Customers & Lead Capture',
      subtitle: 'Wholesale dealers, commercial farm clients, and inbound farmer lead pipeline'
    },
    employees: {
      title: 'Employee & Payroll System',
      subtitle: 'Staff directory, monthly base salary, early salary advances, bonuses & payroll reports'
    },
    reports: {
      title: 'Financial & Sales Reports',
      subtitle: 'Daily and monthly revenue statements, product profitability, and tax summaries'
    }
  };

  const currentMeta = titles[activeTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <header className="sticky top-0 z-20 bg-[#F5F5F7]/85 backdrop-blur-xl border-b border-gray-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          className="lg:hidden p-2 rounded-xl bg-white border border-gray-200 text-[#1C1C1E] shadow-2xs cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-bold text-[#1C1C1E] tracking-tight truncate">
              {currentMeta.title}
            </h2>
            {/* Database indicator pill */}
            <div 
              title={dbStatus.connected ? `Connected to Neon PostgreSQL (${dbStatus.dbName})` : 'Connecting to Neon PostgreSQL...'}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-tight border transition-all ${
                dbStatus.connected 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs' 
                  : 'bg-amber-50 text-amber-700 border-amber-200/80 animate-pulse'
              }`}
            >
              <Database className="w-3 h-3 text-emerald-600" />
              <span>Neon PostgreSQL</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>
          <p className="text-xs text-[#8E8E93] hidden md:block truncate">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Search and Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Bar */}
        <div className="relative w-36 sm:w-56 md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, orders, leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-full text-[#1C1C1E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-black font-medium"
            >
              ×
            </button>
          )}
        </div>

        {/* Sync Button */}
        <button
          onClick={() => refreshFromDb()}
          disabled={isSyncing}
          title="Refresh & Sync from Neon Database"
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-[#1C1C1E] hover:bg-gray-50 shadow-2xs cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* Primary Bento Action Button */}
        <AppleButton
          variant="dark"
          size="sm"
          onClick={onOpenNewSale}
          icon={<ShoppingCart className="w-3.5 h-3.5 text-[#34C759]" />}
          className="shadow-2xs"
        >
          <span className="hidden sm:inline">New Seed Sale</span>
          <span className="sm:hidden">Sell</span>
        </AppleButton>

        <AppleButton
          variant="outline"
          size="sm"
          onClick={onOpenNewProduct}
          icon={<Plus className="w-3.5 h-3.5 text-blue-600" />}
          className="hidden md:inline-flex bg-white hover:bg-gray-50 border-gray-200 shadow-2xs"
        >
          <span>Add Product</span>
        </AppleButton>

        {/* User Profile & Logout */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-2xs transition-all cursor-pointer"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-[11px] flex items-center justify-center">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-semibold text-gray-800 max-w-[90px] sm:max-w-[120px] truncate hidden sm:inline">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsUserMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-40 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {user.displayName || 'Seed Manager'}
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full mt-1.5 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
