import React from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  ShoppingCart, 
  Users, 
  FileText, 
  UserCheck, 
  BarChart3, 
  RotateCcw,
  Sparkles,
  Layers,
  ArrowDownToLine,
  Plus,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 
  | 'overview' 
  | 'products' 
  | 'sales' 
  | 'customers' 
  | 'invoices' 
  | 'employees' 
  | 'reports';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewSale: () => void;
  onOpenNewProduct: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewSale,
  onOpenNewProduct,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const { products, customers, invoices, employees, resetToDefaultData } = useData();
  const { user, logout } = useAuth();

  // Badge counts
  const lowStockCount = products.filter(p => p.stockQuantity <= p.minStockAlert).length;
  const activeLeadsCount = customers.filter(c => c.leadStatus !== 'Active Customer' && c.leadStatus !== 'Inactive').length;
  const pendingInvoicesCount = invoices.filter(i => i.paymentStatus === 'Pending').length;

  const navItems = [
    {
      id: 'overview' as ActiveTab,
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: null
    },
    {
      id: 'products' as ActiveTab,
      label: 'Seed Inventory',
      icon: <Sprout className="w-4 h-4" />,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: 'bg-[#FF9500] text-white'
    },
    {
      id: 'sales' as ActiveTab,
      label: 'Sales & Orders',
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: null
    },
    {
      id: 'invoices' as ActiveTab,
      label: 'Invoices',
      icon: <FileText className="w-4 h-4" />,
      badge: pendingInvoicesCount > 0 ? `${pendingInvoicesCount}` : null,
      badgeColor: 'bg-[#007AFF] text-white'
    },
    {
      id: 'customers' as ActiveTab,
      label: 'Customers & Leads',
      icon: <Users className="w-4 h-4" />,
      badge: activeLeadsCount > 0 ? `${activeLeadsCount} Leads` : null,
      badgeColor: 'bg-[#5856D6] text-white'
    },
    {
      id: 'employees' as ActiveTab,
      label: 'Employee & Payroll',
      icon: <UserCheck className="w-4 h-4" />,
      badge: `${employees.length}`
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Financial Reports',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200/80 flex flex-col justify-between transition-transform duration-200 ease-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 flex flex-col gap-6">
          {/* Bento Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1C1C1E] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Sprout className="w-5 h-5 text-[#34C759]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm text-[#1C1C1E] tracking-tight leading-tight">
                  SeedFlow Pro
                </h1>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-100">
                  CRM
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E93] truncate max-w-[135px]">
                Seed Producer & Import
              </p>
            </div>
          </div>

          {/* Quick Action Bento Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenNewSale();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-full bg-[#1C1C1E] text-white text-xs font-semibold hover:bg-black transition-all active:scale-[0.97] cursor-pointer shadow-2xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Sell Seed</span>
            </button>
            <button
              onClick={() => {
                onOpenNewProduct();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-full bg-[#F5F5F7] text-[#1C1C1E] border border-gray-200/70 text-xs font-semibold hover:bg-gray-200/80 transition-all active:scale-[0.97] cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#34C759]" />
              <span>Product</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            <div className="px-2 pb-1 text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#F5F5F7] text-[#007AFF] font-bold shadow-2xs'
                      : 'text-gray-600 hover:bg-[#F5F5F7]/80 hover:text-[#1C1C1E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`${isActive ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-gray-200/80 text-[#636366]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bento Footer Shift / Database Status & Creator Card */}
        <div className="p-3.5 border-t border-gray-100 flex flex-col gap-2">
          {/* User Account Info */}
          {user && (
            <div className="p-2 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-blue-200 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-900 truncate">
                    {user.displayName || 'Seed Manager'}
                  </p>
                  <p className="text-[9px] text-gray-500 truncate font-mono">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Neon Database Status */}
          <div className="p-2 bg-gray-50/90 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-600">
                <Layers className="w-3 h-3" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#1C1C1E]">Neon PostgreSQL</span>
                </div>
                <p className="text-[9px] text-[#8E8E93] font-mono truncate max-w-[110px]">ep-muddy-morning</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset all Neon CRM data (Products, Invoices, Employees) to seed defaults?')) {
                  resetToDefaultData();
                }
              }}
              title="Reset Database to Seed Defaults"
              className="text-[10px] text-[#8E8E93] hover:text-[#FF3B30] flex items-center gap-1 font-semibold p-1 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Creator Attribution & Social Links */}
          <div className="pt-1.5 px-1 border-t border-gray-100 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400 font-medium">Created by</span>
              <span className="font-semibold text-gray-800 tracking-tight">Abir Das</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <a 
                href="https://animesoft.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#007AFF] hover:underline font-semibold"
              >
                animesoft.com
              </a>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.facebook.com/profile.php?id=100087771241931"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abir Das on Facebook"
                  className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 transition-colors"
                >
                  FB
                </a>
                <a
                  href="https://www.instagram.com/anemosoft?fbclid=IwY2xjawT-muJwZG9mBWV4dG4DYWVtAjEwAGJyaWQRMWZvVUVMN0lOQ051eEo2WHlzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEeGF4v2QLluqE3gDmLjTq1caN-APyroH8uWCmn5OgwNIEzrwvMbYpgqpUsa58_aem_KMBcjCDK-Fk76FBxL2V5vQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Anemosoft on Instagram"
                  className="px-1.5 py-0.5 rounded bg-pink-50 text-pink-600 font-semibold hover:bg-pink-100 transition-colors"
                >
                  IG
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
