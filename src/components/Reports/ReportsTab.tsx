import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Sprout, 
  Globe, 
  Calendar,
  Users,
  PieChart as PieIcon,
  BarChart3,
  Layers
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AppleCard } from '../UI/AppleCard';
import { AppleButton } from '../UI/AppleButton';
import { Badge } from '../UI/Badge';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatTaka, formatTakaCompact } from '../../utils/format';

export const ReportsTab: React.FC = () => {
  const { products, invoices, employees, salaryPayments, bonuses } = useData();

  const [fiscalYear, setFiscalYear] = useState('2026');

  // Seed Inventory Valuation
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalInventoryCost = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);
  const totalInventoryRetailValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.sellingPrice), 0);
  const expectedGrossProfit = totalInventoryRetailValue - totalInventoryCost;

  // Sales Revenue Analysis
  const totalSalesRevenue = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalCostOfGoodsSold = invoices.reduce((sum, inv) => {
    return sum + inv.items.reduce((itemSum, it) => {
      const prod = products.find(p => p.id === it.productId);
      const cost = prod ? prod.costPrice : it.unitPrice * 0.55;
      return itemSum + (cost * it.quantity);
    }, 0);
  }, 0);
  const grossMarginDollars = totalSalesRevenue - totalCostOfGoodsSold;
  const grossMarginPercent = totalSalesRevenue > 0 ? ((grossMarginDollars / totalSalesRevenue) * 100).toFixed(1) : '0';

  // Payroll Cost Analysis
  const totalPayrollPaid = salaryPayments.reduce((sum, r) => sum + r.netSalary, 0);
  const totalBonusesPaid = bonuses.reduce((sum, b) => sum + b.amount, 0);

  // Net Operating Profit
  const netOperatingIncome = grossMarginDollars - totalPayrollPaid;

  // Monthly Comparison Data (BDT in thousands)
  const monthlyData = [
    { month: 'Apr', sales: 382000, payroll: 184000, profit: 198000 },
    { month: 'May', sales: 495000, payroll: 184000, profit: 311000 },
    { month: 'Jun', sales: 618000, payroll: 212000, profit: 406000 },
    { month: 'Jul', sales: 742000, payroll: 225000, profit: 517000 },
    { month: 'Aug', sales: 884000, payroll: 248000, profit: 636000 },
  ];

  const pieData = [
    { name: 'Imported Hybrids', value: products.filter(p => p.type === 'imported').reduce((s, p) => s + (p.stockQuantity * p.sellingPrice), 0) },
    { name: 'Own Farm Cultivars', value: products.filter(p => p.type === 'own_production').reduce((s, p) => s + (p.stockQuantity * p.sellingPrice), 0) }
  ];

  const PIE_COLORS = ['#007AFF', '#34C759'];

  const handleExportComprehensiveReport = () => {
    const lines = [
      '====================================================',
      'AGROSEED BIO-GENOMICS - MASTER FINANCIAL & SEED AUDIT REPORT',
      `Generated: ${new Date().toISOString()}`,
      '====================================================',
      '',
      '1. INVENTORY VALUATION',
      `Total Seed Stock Units: ${totalStockUnits.toLocaleString()}`,
      `Total Inventory Asset Value (Retail): ৳${totalInventoryRetailValue.toFixed(2)}`,
      `Total Inventory Cost Basis: ৳${totalInventoryCost.toFixed(2)}`,
      `Expected Unrealized Profit: ৳${expectedGrossProfit.toFixed(2)}`,
      '',
      '2. REVENUE & PROFITABILITY',
      `Total Seed Sales Revenue: ৳${totalSalesRevenue.toFixed(2)}`,
      `Cost of Goods Sold (COGS): ৳${totalCostOfGoodsSold.toFixed(2)}`,
      `Gross Profit: ৳${grossMarginDollars.toFixed(2)} (${grossMarginPercent}%)`,
      '',
      '3. PAYROLL & COMPENSATION EXPENSES',
      `Total Staff Count: ${employees.length}`,
      `Total Payroll Disbursed: ৳${totalPayrollPaid.toFixed(2)}`,
      `Total Bonuses Awarded: ৳${totalBonusesPaid.toFixed(2)}`,
      '',
      '4. NET OPERATING ESTIMATE',
      `Estimated Net Operating Surplus: ৳${netOperatingIncome.toFixed(2)}`,
      '===================================================='
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Seed_Master_Financial_Report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export */}
      <AppleCard padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#1C1C1E] tracking-tight">
            Financial Intelligence & Seed Audit Reports
          </h2>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Consolidated business overview comparing seed sales revenues, gross margins, and payroll expenditures
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AppleButton
            variant="primary"
            size="sm"
            onClick={handleExportComprehensiveReport}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Comprehensive Audit
          </AppleButton>
        </div>
      </AppleCard>

      {/* 4 Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <AppleCard padding="md" className="border-l-4 border-l-[#007AFF]">
          <div className="text-xs font-semibold text-[#8E8E93] uppercase">Gross Seed Revenue</div>
          <div className="text-2xl font-bold text-[#1C1C1E] mt-1">
            {formatTaka(totalSalesRevenue)}
          </div>
          <div className="text-[11px] text-[#636366] mt-0.5">{invoices.length} invoices generated</div>
        </AppleCard>

        <AppleCard padding="md" className="border-l-4 border-l-[#34C759]">
          <div className="text-xs font-semibold text-[#8E8E93] uppercase">Gross Margin (৳)</div>
          <div className="text-2xl font-bold text-[#34C759] mt-1">
            {formatTaka(grossMarginDollars)}
          </div>
          <div className="text-[11px] text-[#34C759] font-semibold mt-0.5">{grossMarginPercent}% gross profit margin</div>
        </AppleCard>

        <AppleCard padding="md" className="border-l-4 border-l-[#FF9500]">
          <div className="text-xs font-semibold text-[#8E8E93] uppercase">Inventory Retail Value</div>
          <div className="text-2xl font-bold text-[#FF9500] mt-1">
            {formatTaka(totalInventoryRetailValue)}
          </div>
          <div className="text-[11px] text-[#636366] mt-0.5">{totalStockUnits.toLocaleString()} units in warehouse</div>
        </AppleCard>

        <AppleCard padding="md" className="border-l-4 border-l-[#AF52DE]">
          <div className="text-xs font-semibold text-[#8E8E93] uppercase">Total Payroll Expense</div>
          <div className="text-2xl font-bold text-[#AF52DE] mt-1">
            {formatTaka(totalPayrollPaid)}
          </div>
          <div className="text-[11px] text-[#636366] mt-0.5">{employees.length} staff & seasonal crew</div>
        </AppleCard>
      </div>

      {/* Chart: Sales Revenue vs Payroll Costs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AppleCard padding="lg" className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
                Monthly Performance: Sales Revenue vs Staff Payroll
              </h3>
              <p className="text-xs text-[#8E8E93]">
                Tracking operating leverage and seed sales profitability
              </p>
            </div>
            <Badge variant="blue" size="sm">2026 Fiscal Season</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} stroke="#8E8E93" fontSize={11} />
                <YAxis tickLine={false} stroke="#8E8E93" fontSize={11} tickFormatter={(v) => formatTakaCompact(v)} />
                <Tooltip 
                  formatter={(val: number) => [formatTaka(val), '']}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="sales" name="Seed Sales Revenue" fill="#007AFF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="payroll" name="Payroll & Bonuses" fill="#AF52DE" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" name="Gross Operating Profit" fill="#34C759" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AppleCard>

        {/* Warehouse Valuation Breakdown Pie */}
        <AppleCard padding="lg" className="space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
              Warehouse Stock Value Split
            </h3>
            <p className="text-xs text-[#8E8E93]">
              Imported hybrids vs Own production cultivars
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [formatTaka(v), 'Valuation']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-black/[0.06] text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
                <span className="text-[#636366]">Imported Seeds:</span>
              </div>
              <span className="font-bold text-[#1C1C1E]">{formatTaka(pieData[0].value)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#34C759]" />
                <span className="text-[#636366]">Own Farm Seeds:</span>
              </div>
              <span className="font-bold text-[#1C1C1E]">{formatTaka(pieData[1].value)}</span>
            </div>
          </div>
        </AppleCard>
      </div>
    </div>
  );
};
