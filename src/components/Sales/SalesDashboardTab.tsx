import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Sprout, 
  Globe, 
  FileText, 
  Download, 
  ArrowUpRight, 
  Plus,
  BarChart2,
  PieChart as PieIcon,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AppleCard } from '../UI/AppleCard';
import { AppleButton } from '../UI/AppleButton';
import { Badge } from '../UI/Badge';
import { SegmentedControl } from '../UI/SegmentedControl';
import { InvoiceDetails } from '../../types';
import { formatTaka } from '../../utils/format';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface SalesDashboardTabProps {
  onOpenNewSale: () => void;
  onViewInvoice: (invoice: InvoiceDetails) => void;
  searchQuery: string;
}

export const SalesDashboardTab: React.FC<SalesDashboardTabProps> = ({
  onOpenNewSale,
  onViewInvoice,
  searchQuery
}) => {
  const { invoices, products } = useData();

  const [reportView, setReportView] = useState<'daily' | 'monthly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Aggregate Daily Sales Data
  const dailySalesMap: Record<string, { total: number; count: number; imported: number; own: number }> = {};
  invoices.forEach(inv => {
    const day = inv.date;
    if (!dailySalesMap[day]) {
      dailySalesMap[day] = { total: 0, count: 0, imported: 0, own: 0 };
    }
    dailySalesMap[day].total += inv.total;
    dailySalesMap[day].count += 1;

    inv.items.forEach(it => {
      if (it.productType === 'imported') {
        dailySalesMap[day].imported += it.lineTotal;
      } else {
        dailySalesMap[day].own += it.lineTotal;
      }
    });
  });

  const dailyReportList = Object.keys(dailySalesMap).sort().reverse().map(date => ({
    date,
    ...dailySalesMap[date]
  }));

  // Aggregate Monthly Sales Data
  const monthlySalesMap: Record<string, { total: number; count: number; imported: number; own: number }> = {};
  invoices.forEach(inv => {
    const month = inv.date.substring(0, 7); // e.g. "2026-08"
    if (!monthlySalesMap[month]) {
      monthlySalesMap[month] = { total: 0, count: 0, imported: 0, own: 0 };
    }
    monthlySalesMap[month].total += inv.total;
    monthlySalesMap[month].count += 1;

    inv.items.forEach(it => {
      if (it.productType === 'imported') {
        monthlySalesMap[month].imported += it.lineTotal;
      } else {
        monthlySalesMap[month].own += it.lineTotal;
      }
    });
  });

  const monthlyReportList = Object.keys(monthlySalesMap).sort().reverse().map(month => ({
    month,
    ...monthlySalesMap[month]
  }));

  // Revenue totals
  const totalGrossSales = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalImportedSales = invoices.reduce((sum, inv) => {
    return sum + inv.items.filter(i => i.productType === 'imported').reduce((s, it) => s + it.lineTotal, 0);
  }, 0);
  const totalOwnProdSales = invoices.reduce((sum, inv) => {
    return sum + inv.items.filter(i => i.productType === 'own_production').reduce((s, it) => s + it.lineTotal, 0);
  }, 0);

  // Top Selling Products
  const productSalesCount: Record<string, { name: string; sub: string; type: string; qty: number; revenue: number; unit: string }> = {};
  invoices.forEach(inv => {
    inv.items.forEach(it => {
      if (!productSalesCount[it.productId]) {
        productSalesCount[it.productId] = {
          name: it.productName,
          sub: it.subProductName,
          type: it.productType,
          qty: 0,
          revenue: 0,
          unit: it.unit
        };
      }
      productSalesCount[it.productId].qty += it.quantity;
      productSalesCount[it.productId].revenue += it.lineTotal;
    });
  });

  const topSellingProducts = Object.values(productSalesCount).sort((a, b) => b.revenue - a.revenue);

  // Export Sales Report CSV
  const handleExportReportCSV = () => {
    if (reportView === 'daily') {
      const headers = ['Date', 'Orders Count', 'Imported Seeds Revenue (BDT)', 'Own Farm Seeds Revenue (BDT)', 'Total Sales Revenue (BDT)'];
      const rows = dailyReportList.map(d => [d.date, d.count, d.imported.toFixed(2), d.own.toFixed(2), d.total.toFixed(2)]);
      const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csv);
      link.download = `Daily_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else {
      const headers = ['Month', 'Orders Count', 'Imported Seeds Revenue (BDT)', 'Own Farm Seeds Revenue (BDT)', 'Total Sales Revenue (BDT)'];
      const rows = monthlyReportList.map(m => [m.month, m.count, m.imported.toFixed(2), m.own.toFixed(2), m.total.toFixed(2)]);
      const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csv);
      link.download = `Monthly_Sales_Report_${selectedMonth}.csv`;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Revenue Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AppleCard padding="md" className="border-l-4 border-l-[#007AFF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8E8E93] uppercase">Gross Seed Sales</span>
            <DollarSign className="w-4 h-4 text-[#007AFF]" />
          </div>
          <div className="text-2xl font-bold text-[#1C1C1E] mt-1">
            {formatTaka(totalGrossSales)}
          </div>
          <div className="text-[11px] text-[#636366] mt-0.5">{invoices.length} transactions recorded</div>
        </AppleCard>

        <AppleCard padding="md" className="border-l-4 border-l-[#007AFF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8E8E93] uppercase">Imported Seeds Sales</span>
            <Globe className="w-4 h-4 text-[#007AFF]" />
          </div>
          <div className="text-2xl font-bold text-[#007AFF] mt-1">
            {formatTaka(totalImportedSales)}
          </div>
          <div className="text-[11px] text-[#636366] mt-0.5">
            {totalGrossSales > 0 ? `${((totalImportedSales / totalGrossSales) * 100).toFixed(1)}%` : '0%'} of gross volume
          </div>
        </AppleCard>

        <AppleCard padding="md" className="border-l-4 border-l-[#34C759]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8E8E93] uppercase">Own Farm Seeds Sales</span>
            <Sprout className="w-4 h-4 text-[#34C759]" />
          </div>
          <div className="text-2xl font-bold text-[#34C759] mt-1">
            {formatTaka(totalOwnProdSales)}
          </div>
          <div className="text-[11px] text-[#636366] mt-0.5">
            {totalGrossSales > 0 ? `${((totalOwnProdSales / totalGrossSales) * 100).toFixed(1)}%` : '0%'} of gross volume
          </div>
        </AppleCard>
      </div>

      {/* Reports Segment Selector (Daily Sell Report vs Monthly Sell Report) */}
      <AppleCard padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <SegmentedControl
            options={[
              { 
                value: 'daily', 
                label: 'Daily Sell Report', 
                icon: <Calendar className="w-3.5 h-3.5 text-[#007AFF]" /> 
              },
              { 
                value: 'monthly', 
                label: 'Monthly Sell Report', 
                icon: <BarChart2 className="w-3.5 h-3.5 text-[#34C759]" /> 
              }
            ]}
            value={reportView}
            onChange={(val) => setReportView(val as typeof reportView)}
          />

          <span className="text-xs text-[#8E8E93] hidden md:inline">
            {reportView === 'daily' ? 'Itemized daily ledger & orders' : 'Consolidated monthly volume & performance'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <AppleButton
            variant="outline"
            size="sm"
            onClick={handleExportReportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export {reportView === 'daily' ? 'Daily' : 'Monthly'} Report
          </AppleButton>
          <AppleButton
            variant="primary"
            size="sm"
            onClick={onOpenNewSale}
            icon={<ShoppingCart className="w-4 h-4" />}
          >
            New Seed Sale
          </AppleButton>
        </div>
      </AppleCard>

      {/* Report Table Card */}
      <AppleCard padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-white/80 backdrop-blur-sm">
          <div>
            <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
              {reportView === 'daily' ? 'Daily Sales Revenue Statements' : 'Monthly Sales Revenue Statements'}
            </h3>
            <p className="text-xs text-[#8E8E93]">
              Breakdown of total volume, order volume, and revenue by seed production origin
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#F9F9FB] text-[#8E8E93] font-semibold">
                <th className="py-3 px-4">{reportView === 'daily' ? 'Sale Date' : 'Billing Month'}</th>
                <th className="py-3 px-4 text-center">Orders Count</th>
                <th className="py-3 px-4 text-right">Imported Seeds Revenue</th>
                <th className="py-3 px-4 text-right">Own Farm Seeds Revenue</th>
                <th className="py-3 px-4 text-right">Total Net Revenue</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {(reportView === 'daily' ? dailyReportList : monthlyReportList).map((row, idx) => {
                const dateLabel = 'date' in row ? row.date : row.month;
                return (
                  <tr key={idx} className="hover:bg-[#F5F5F7]/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-sm text-[#1C1C1E] flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
                      <span>{dateLabel}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-black/5 font-semibold text-xs text-[#1C1C1E]">
                        {row.count} orders
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-[#007AFF]">
                      {formatTaka(row.imported)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-[#34C759]">
                      {formatTaka(row.own)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-sm text-[#1C1C1E]">
                      {formatTaka(row.total)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge variant="green" size="sm">
                        Recorded
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AppleCard>

      {/* Top Selling Seed Varieties Card */}
      <AppleCard padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
              Top-Selling Seed Varieties & Cultivars
            </h3>
            <p className="text-xs text-[#8E8E93]">
              Ranked by total sales revenue generation
            </p>
          </div>
          <span className="text-xs text-[#8E8E93]">{topSellingProducts.length} varieties sold</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {topSellingProducts.map((p, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#F9F9FB] border border-black/[0.05] flex flex-col justify-between space-y-2 hover:bg-[#F2F2F7] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-xs text-[#1C1C1E]">{p.name}</div>
                  <div className="text-[11px] text-[#007AFF] font-medium">{p.sub}</div>
                </div>
                <Badge variant={p.type === 'imported' ? 'blue' : 'green'} size="sm">
                  {p.type === 'imported' ? 'Imported' : 'Own Prod'}
                </Badge>
              </div>

              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs">
                <span className="text-[#8E8E93]">
                  {p.qty.toLocaleString()} {p.unit} sold
                </span>
                <span className="font-bold text-sm text-[#1C1C1E]">
                  {formatTaka(p.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </AppleCard>
    </div>
  );
};
