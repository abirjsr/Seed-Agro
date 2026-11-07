import React, { useState } from 'react';
import { 
  DollarSign, 
  Sprout, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  Package, 
  Sparkles,
  FileText,
  UserCheck,
  ChevronRight,
  Globe,
  Plus,
  BarChart3,
  Calendar,
  Download,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AppleCard } from '../UI/AppleCard';
import { MetricCard } from '../UI/MetricCard';
import { Badge } from '../UI/Badge';
import { AppleButton } from '../UI/AppleButton';
import { ActiveTab } from '../Sidebar';
import { InvoiceDetails, SeedProduct } from '../../types';
import { formatTaka, formatTakaCompact } from '../../utils/format';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface OverviewTabProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewSale: () => void;
  onOpenNewProduct: () => void;
  onViewInvoice: (invoice: InvoiceDetails) => void;
  onQuickStockUpdate: (product: SeedProduct) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  setActiveTab,
  onOpenNewSale,
  onOpenNewProduct,
  onViewInvoice,
  onQuickStockUpdate
}) => {
  const { 
    products, 
    invoices, 
    customers, 
    employees, 
    salaryPayments, 
    earlySalaryAdvances,
    addCustomer
  } = useData();

  const [productOriginFilter, setProductOriginFilter] = useState<'all' | 'imported' | 'own_production'>('all');
  const [quickLeadName, setQuickLeadName] = useState('');
  const [quickLeadCompany, setQuickLeadCompany] = useState('');
  const [quickLeadPhone, setQuickLeadPhone] = useState('');
  const [quickLeadSuccess, setQuickLeadSuccess] = useState(false);

  // Metrics calculations
  const totalRevenue = invoices.reduce((sum, i) => sum + i.total, 0);
  const paidRevenue = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const pendingRevenue = totalRevenue - paidRevenue;

  // Products stock split
  const importedProducts = products.filter(p => p.type === 'imported');
  const ownProdProducts = products.filter(p => p.type === 'own_production');

  const importedTotalStock = importedProducts.reduce((sum, p) => sum + p.stockQuantity, 0);
  const ownProdTotalStock = ownProdProducts.reduce((sum, p) => sum + p.stockQuantity, 0);

  const lowStockProducts = products.filter(p => p.stockQuantity <= p.minStockAlert);
  const activeLeads = customers.filter(c => c.leadStatus !== 'Active Customer' && c.leadStatus !== 'Inactive');

  // Total payroll
  const activePayroll = salaryPayments.reduce((sum, s) => sum + s.netSalary, 0);
  const totalAdvances = earlySalaryAdvances.reduce((sum, a) => sum + a.amount, 0);

  // Filtered mini products for bento cell
  const displayedProducts = products.filter(p => {
    if (productOriginFilter === 'all') return true;
    return p.type === productOriginFilter;
  }).slice(0, 5);

  // Sales Trend Chart Data dynamically derived from real invoices
  const salesChartData = React.useMemo(() => {
    if (invoices.length === 0) {
      return [
        { date: 'Day 1', sales: 0, imported: 0, own: 0 },
        { date: 'Day 2', sales: 0, imported: 0, own: 0 },
        { date: 'Day 3', sales: 0, imported: 0, own: 0 },
        { date: 'Day 4', sales: 0, imported: 0, own: 0 },
        { date: 'Day 5', sales: 0, imported: 0, own: 0 },
        { date: 'Day 6', sales: 0, imported: 0, own: 0 },
        { date: 'Day 7', sales: 0, imported: 0, own: 0 },
      ];
    }
    const map = new Map<string, { date: string; sales: number; imported: number; own: number }>();
    invoices.forEach(inv => {
      const d = inv.issueDate || 'Recent';
      const existing = map.get(d) || { date: d, sales: 0, imported: 0, own: 0 };
      existing.sales += inv.total;
      map.set(d, existing);
    });
    return Array.from(map.values()).slice(-7);
  }, [invoices]);

  // Pie chart data
  const inventoryPieData = [
    { name: 'Imported Hybrids', value: importedTotalStock, color: '#007AFF' },
    { name: 'Own Production Seeds', value: ownProdTotalStock, color: '#34C759' }
  ];

  const handleQuickAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLeadName.trim()) return;
    addCustomer({
      name: quickLeadName.trim(),
      companyName: quickLeadCompany.trim() || 'Independent Grower',
      customerType: 'Commercial Farm',
      email: `${quickLeadName.toLowerCase().replace(/\s+/g, '')}@farmmail.com`,
      phone: quickLeadPhone.trim() || '+1 (555) 019-2831',
      address: 'Rural Route 4',
      city: 'Des Moines',
      state: 'IA',
      zipCode: '50301',
      leadStatus: 'New Lead',
      notes: 'Captured via Bento quick lead capture widget.'
    });
    setQuickLeadName('');
    setQuickLeadCompany('');
    setQuickLeadPhone('');
    setQuickLeadSuccess(true);
    setTimeout(() => setQuickLeadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Bento Top Header Greeting Card */}
      <AppleCard padding="lg" className="bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#1C1C1E] text-white">
                Bento Suite
              </span>
              <span className="text-xs text-gray-500 font-medium">August 2026 Production & Harvest Cycle</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1E] tracking-tight">
              Seed Agro Operations & Distribution
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
              Real-time monitoring across {products.length} registered seed lines ({importedProducts.length} imported genetics, {ownProdProducts.length} local farm production), sales invoices, customer leads, and employee payroll.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <AppleButton
              variant="dark"
              size="md"
              onClick={onOpenNewSale}
              icon={<ShoppingCart className="w-4 h-4 text-[#34C759]" />}
            >
              New Seed Sale
            </AppleButton>
            <AppleButton
              variant="outline"
              size="md"
              onClick={() => setActiveTab('invoices')}
              icon={<FileText className="w-4 h-4 text-blue-600" />}
            >
              Invoices Register
            </AppleButton>
            <AppleButton
              variant="outline"
              size="md"
              onClick={onOpenNewProduct}
              icon={<Plus className="w-4 h-4 text-[#34C759]" />}
            >
              Add Product
            </AppleButton>
          </div>
        </div>
      </AppleCard>

      {/* Bento Grid Tier 1: Inventory Table (8 cols) + Lead Capture Pipeline (4 cols) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Bento Cell 1: Product Inventory & Stock Status (8 cols) */}
        <AppleCard padding="none" className="col-span-12 lg:col-span-8 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div>
                <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
                  Product Inventory & Stock Status
                </h3>
                <p className="text-xs text-gray-400">
                  Live availability for imported hybrid batches and local crop seed lines
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-full text-xs font-medium self-start sm:self-auto">
                <button
                  onClick={() => setProductOriginFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    productOriginFilter === 'all' ? 'bg-white text-black shadow-2xs' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setProductOriginFilter('imported')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    productOriginFilter === 'imported' ? 'bg-white text-blue-600 shadow-2xs' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>Imported</span>
                </button>
                <button
                  onClick={() => setProductOriginFilter('own_production')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    productOriginFilter === 'own_production' ? 'bg-white text-green-600 shadow-2xs' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <Sprout className="w-3 h-3" />
                  <span>Own Farm</span>
                </button>
              </div>
            </div>

            {/* Compact Bento Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-semibold">
                    <th className="py-3 px-5">Product & Variety</th>
                    <th className="py-3 px-4">Origin Type</th>
                    <th className="py-3 px-4">Batch #</th>
                    <th className="py-3 px-4 text-right">In Stock</th>
                    <th className="py-3 px-4 text-right">Price / Unit</th>
                    <th className="py-3 px-5 text-right">Quick Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedProducts.map((p) => {
                    const isLow = p.stockQuantity <= p.minStockAlert;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-5">
                          <div className="font-bold text-gray-900">{p.name}</div>
                          <div className="text-[11px] text-blue-600 font-medium">{p.subProductName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={p.type === 'imported' ? 'blue' : 'green'} size="sm">
                            {p.type === 'imported' ? 'Imported' : 'Own Prod'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-[11px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                            {p.batchNumber}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-bold ${isLow ? 'text-red-500' : 'text-gray-900'}`}>
                            {p.stockQuantity.toLocaleString()} {p.unit}
                          </span>
                          {isLow && (
                            <span className="block text-[10px] text-orange-500 font-semibold">Low Stock</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">
                          {formatTaka(p.sellingPrice)}
                        </td>
                        <td className="py-3 px-5 text-right">
                          <button
                            onClick={() => onQuickStockUpdate(p)}
                            className="px-3 py-1 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            ± Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Showing top varieties ({displayedProducts.length} of {products.length})
            </span>
            <button
              onClick={() => setActiveTab('products')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open Full Inventory Roster</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </AppleCard>

        {/* Bento Cell 2: Lead Capture & Customer Pipeline (4 cols) */}
        <AppleCard padding="lg" className="col-span-12 lg:col-span-4 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
                  Lead Capture & Pipeline
                </h3>
                <p className="text-xs text-gray-400">
                  Inbound farmer prospects & buyers
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                {activeLeads.length} Leads
              </span>
            </div>

            {/* Quick Inbound Leads List */}
            <div className="space-y-2 mb-4">
              {activeLeads.slice(0, 3).map((lead) => (
                <div key={lead.id} className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-gray-900">{lead.name}</div>
                    <div className="text-[11px] text-gray-500">{lead.companyName || lead.city}</div>
                  </div>
                  <Badge variant={lead.leadStatus === 'New Lead' ? 'orange' : 'purple'} size="sm">
                    {lead.leadStatus}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Inline Quick Add Lead Form */}
            <form onSubmit={handleQuickAddLead} className="space-y-2 pt-3 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Instant Lead Capture
              </span>
              <input
                type="text"
                placeholder="Farmer / Contact Name *"
                value={quickLeadName}
                onChange={(e) => setQuickLeadName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Farm / Co-op"
                  value={quickLeadCompany}
                  onChange={(e) => setQuickLeadCompany(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <input
                  type="text"
                  placeholder="Phone #"
                  value={quickLeadPhone}
                  onChange={(e) => setQuickLeadPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#1C1C1E] hover:bg-black text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Capture Inbound Lead</span>
              </button>
              {quickLeadSuccess && (
                <div className="text-[11px] text-green-600 font-semibold flex items-center justify-center gap-1 pt-1 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lead registered to pipeline!
                </div>
              )}
            </form>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400">{customers.length} total contacts</span>
            <button
              onClick={() => setActiveTab('customers')}
              className="font-semibold text-blue-600 hover:underline"
            >
              View Pipeline →
            </button>
          </div>
        </AppleCard>
      </div>

      {/* Bento Grid Tier 2: Dark Metric Tile (4 cols) + Employee Payroll (5 cols) + Reports (3 cols) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Bento Cell 3: Dark Bento Tile - Monthly Sales & Revenue (4 cols) */}
        <AppleCard 
          dark 
          padding="lg" 
          className="col-span-12 md:col-span-4 flex flex-col justify-between relative overflow-hidden"
        >
          {/* Subtle glow circle */}
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#007AFF]/20 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium uppercase tracking-wider">Gross Revenue</span>
              <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[11px] font-bold border border-green-500/30">
                +18.4% MoM
              </span>
            </div>

            <div className="text-3xl font-bold text-white mt-2">
              {formatTaka(totalRevenue)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {formatTaka(paidRevenue, 0)} settled • {formatTaka(pendingRevenue, 0)} terms due
            </p>

            {/* Custom SVG Bar Sparklines */}
            <div className="mt-6 flex items-end gap-2 h-16 pt-2">
              {[45, 60, 35, 75, 55, 90, 80, 100, 68].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-white/20 hover:bg-[#007AFF] transition-all rounded-t-sm"
                    style={{ height: `${h}%` }} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-gray-400">{invoices.length} invoices registered</span>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-xs font-semibold text-[#007AFF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Sales Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </AppleCard>

        {/* Bento Cell 4: Employee & Payroll Snapshot (5 cols) */}
        <AppleCard padding="lg" className="col-span-12 md:col-span-5 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
                  Employee & Payroll Roster
                </h3>
                <p className="text-xs text-gray-400">
                  Staff compensation, bonuses & advances
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                {formatTaka(activePayroll, 0)} Active
              </span>
            </div>

            {/* Staff list preview */}
            <div className="space-y-2">
              {employees.slice(0, 3).map((emp) => (
                <div key={emp.id} className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{emp.name}</div>
                      <div className="text-[10px] text-gray-500">{emp.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900 block">{formatTaka(emp.baseMonthlySalary ?? 0, 0)}/mo</span>
                    <span className="text-[10px] text-green-600 font-semibold">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400">{employees.length} total staff</span>
            <button
              onClick={() => setActiveTab('employees')}
              className="font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Payroll</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </AppleCard>

        {/* Bento Cell 5: Quick Reports & Audits (3 cols) */}
        <AppleCard padding="lg" className="col-span-12 md:col-span-3 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
                Quick Reports
              </h3>
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Instant PDF/CSV export statements
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('reports')}
                className="w-full p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Daily Sell Report</span>
                  <span className="text-[10px] text-gray-400">August 24, 2026</span>
                </div>
                <Download className="w-3.5 h-3.5 text-gray-500" />
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className="w-full p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Yearly Statement</span>
                  <span className="text-[10px] text-gray-400">FY 2026 Fiscal Ledger</span>
                </div>
                <Download className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100 text-right">
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              All Reports →
            </button>
          </div>
        </AppleCard>
      </div>

      {/* Bento Grid Tier 3: Charts (8 cols Area Chart + 4 cols Seed Ratio Donut) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Bento Cell 6: Sales & Production Distribution Area Chart (8 cols) */}
        <AppleCard padding="lg" className="col-span-12 lg:col-span-8 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-[#1C1C1E] tracking-tight">
                Daily Sales & Distribution Trends
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Imported hybrid genetics revenue vs. local farm production
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-gray-900">
                <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
                <span>Imported Seeds</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-gray-900">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" />
                <span>Own Farm Seeds</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bentoImported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bentoOwn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#8E8E93" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#F2F2F7' }}
                />
                <YAxis 
                  stroke="#8E8E93" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#F2F2F7' }}
                  tickFormatter={(val) => formatTakaCompact(val)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    fontSize: '12px'
                  }}
                  formatter={(val: number) => [formatTaka(val), '']}
                />
                <Area
                  type="monotone"
                  dataKey="imported"
                  name="Imported Seeds"
                  stroke="#007AFF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#bentoImported)"
                />
                <Area
                  type="monotone"
                  dataKey="own"
                  name="Own Production"
                  stroke="#34C759"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#bentoOwn)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AppleCard>

        {/* Bento Cell 7: Seed Stock Ratio & Low Stock Warning (4 cols) */}
        <AppleCard padding="lg" className="col-span-12 lg:col-span-4 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1C1C1E] tracking-tight">
                  Seed Stock Ratio
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Genetic origin inventory balance
                </p>
              </div>
              <Sprout className="w-4 h-4 text-green-600" />
            </div>

            <div className="h-40 w-full my-2 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {inventoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${(val ?? 0).toLocaleString()} units`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</span>
                <span className="text-base font-bold text-[#1C1C1E]">
                  {(importedTotalStock + ownProdTotalStock).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
                <span className="font-medium text-gray-800">Imported Hybrids</span>
              </div>
              <span className="font-bold text-gray-900">
                {importedTotalStock.toLocaleString()} ({Math.round((importedTotalStock / (importedTotalStock + ownProdTotalStock || 1)) * 100)}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" />
                <span className="font-medium text-gray-800">Own Farm Production</span>
              </div>
              <span className="font-bold text-gray-900">
                {ownProdTotalStock.toLocaleString()} ({Math.round((ownProdTotalStock / (importedTotalStock + ownProdTotalStock || 1)) * 100)}%)
              </span>
            </div>
          </div>
        </AppleCard>
      </div>
    </div>
  );
};
