import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Printer, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Download, 
  Plus, 
  ShoppingCart,
  Building2,
  Calendar
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AppleCard } from '../UI/AppleCard';
import { AppleButton } from '../UI/AppleButton';
import { Badge } from '../UI/Badge';
import { SegmentedControl } from '../UI/SegmentedControl';
import { InvoiceDetails } from '../../types';
import { formatTaka } from '../../utils/format';

interface InvoicesTabProps {
  onOpenNewSale: () => void;
  onViewInvoice: (invoice: InvoiceDetails) => void;
  searchQuery: string;
}

export const InvoicesTab: React.FC<InvoicesTabProps> = ({
  onOpenNewSale,
  onViewInvoice,
  searchQuery: externalSearch
}) => {
  const { invoices, updateInvoiceStatus, deleteInvoice } = useData();

  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Pending' | 'Partial'>('all');
  const [internalSearch, setInternalSearch] = useState('');

  const activeSearch = externalSearch || internalSearch;

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (statusFilter !== 'all' && inv.paymentStatus !== statusFilter) return false;

      if (activeSearch.trim()) {
        const q = activeSearch.toLowerCase();
        const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
        const matchCust = inv.customerName.toLowerCase().includes(q);
        const matchComp = inv.customerCompany.toLowerCase().includes(q);
        const matchSales = inv.salesperson.toLowerCase().includes(q);
        const matchItem = inv.items.some(it => 
          it.productName.toLowerCase().includes(q) || 
          it.subProductName.toLowerCase().includes(q)
        );
        return matchNum || matchCust || matchComp || matchSales || matchItem;
      }
      return true;
    });
  }, [invoices, statusFilter, activeSearch]);

  // Financial summaries
  const totalBilled = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalOutstanding = totalBilled - totalPaid;

  const paidCount = invoices.filter(i => i.paymentStatus === 'Paid').length;
  const pendingCount = invoices.filter(i => i.paymentStatus === 'Pending').length;

  const handleDelete = (inv: InvoiceDetails) => {
    if (window.confirm(`Delete Invoice #${inv.invoiceNumber}? This cannot be undone.`)) {
      deleteInvoice(inv.id);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Invoice #', 'Date', 'Due Date', 'Customer', 'Company', 'Salesperson', 'Terms', 'Items Count', 'Subtotal', 'Tax', 'Total', 'Payment Status'];
    const rows = filteredInvoices.map(inv => [
      inv.invoiceNumber,
      inv.date,
      inv.dueDate,
      `"${inv.customerName}"`,
      `"${inv.customerCompany}"`,
      `"${inv.salesperson}"`,
      `"${inv.terms}"`,
      inv.items.length,
      inv.subtotal.toFixed(2),
      inv.salesTax.toFixed(2),
      inv.total.toFixed(2),
      inv.paymentStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Seed_Invoices_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AppleCard padding="md" className="border-l-4 border-l-[#007AFF]">
          <div className="text-xs font-semibold text-[#8E8E93] uppercase tracking-tight">Total Invoiced Volume</div>
          <div className="text-2xl font-bold text-[#1C1C1E] mt-1">
            {formatTaka(totalBilled)}
          </div>
          <div className="text-[11px] text-[#636366] mt-0.5">{invoices.length} invoices generated</div>
        </AppleCard>

        <AppleCard padding="md" className="border-l-4 border-l-[#34C759]">
          <div className="text-xs font-semibold text-[#8E8E93] uppercase tracking-tight">Collected Payments</div>
          <div className="text-2xl font-bold text-[#34C759] mt-1">
            {formatTaka(totalPaid)}
          </div>
          <div className="text-[11px] text-[#636366] mt-0.5">{paidCount} paid in full</div>
        </AppleCard>

        <AppleCard padding="md" className="border-l-4 border-l-[#FF9500]">
          <div className="text-xs font-semibold text-[#8E8E93] uppercase tracking-tight">Outstanding Receivables</div>
          <div className="text-2xl font-bold text-[#FF9500] mt-1">
            {formatTaka(totalOutstanding)}
          </div>
          <div className="text-[11px] text-[#636366] mt-0.5">{pendingCount} pending / terms due</div>
        </AppleCard>
      </div>

      {/* Filter & Actions Bar */}
      <AppleCard padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SegmentedControl
          options={[
            { value: 'all', label: 'All Invoices', count: invoices.length },
            { 
              value: 'Paid', 
              label: 'Paid', 
              count: paidCount,
              icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
            },
            { 
              value: 'Pending', 
              label: 'Pending / Due', 
              count: pendingCount,
              icon: <Clock className="w-3.5 h-3.5 text-[#FF9500]" />
            }
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as typeof statusFilter)}
        />

        <div className="flex items-center gap-2">
          <AppleButton
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </AppleButton>
          <AppleButton
            variant="primary"
            size="sm"
            onClick={onOpenNewSale}
            icon={<Plus className="w-4 h-4" />}
          >
            Create New Invoice
          </AppleButton>
        </div>
      </AppleCard>

      {/* Invoices List Table */}
      <AppleCard padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-white/80 backdrop-blur-sm">
          <div>
            <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
              Seed Invoices & Billing Register ({filteredInvoices.length})
            </h3>
            <p className="text-xs text-[#8E8E93]">
              Click any invoice to view and print the Apple-styled template matching the demo
            </p>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-[#8E8E93] mx-auto mb-3 opacity-60" />
            <h4 className="text-sm font-semibold text-[#1C1C1E]">No invoices match your filter</h4>
            <p className="text-xs text-[#8E8E93] mt-1">Generate a new sale to produce an invoice.</p>
            <AppleButton
              variant="primary"
              size="sm"
              onClick={onOpenNewSale}
              className="mt-4"
            >
              + Create Sale & Invoice
            </AppleButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#F9F9FB] text-[#8E8E93] font-semibold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date & Due Date</th>
                  <th className="py-3 px-4">Customer & Farm Company</th>
                  <th className="py-3 px-4">Seed Items Summary</th>
                  <th className="py-3 px-4">Salesperson & Terms</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {filteredInvoices.map((inv) => {
                  return (
                    <tr 
                      key={inv.id} 
                      className="hover:bg-[#F5F5F7]/80 transition-colors group cursor-pointer"
                      onClick={() => onViewInvoice(inv)}
                    >
                      {/* Invoice # */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-[#007AFF] flex items-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          <span>#{inv.invoiceNumber}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-[#1C1C1E]">{inv.date}</div>
                        <div className="text-[10px] text-[#8E8E93]">Due: {inv.dueDate}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-[#1C1C1E]">{inv.customerName}</div>
                        {inv.customerCompany && (
                          <div className="text-[11px] text-[#636366] font-medium flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-[#8E8E93]" />
                            <span>{inv.customerCompany}</span>
                          </div>
                        )}
                      </td>

                      {/* Seed Items summary */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-xs text-[#1C1C1E] font-medium block truncate">
                          {inv.items.map(i => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                        </span>
                        <span className="text-[10px] text-[#8E8E93]">
                          {inv.items.length} line items itemized
                        </span>
                      </td>

                      {/* Salesperson & Terms */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-[#1C1C1E]">{inv.salesperson}</div>
                        <div className="text-[10px] text-[#8E8E93]">Terms: {inv.terms}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            inv.paymentStatus === 'Paid' ? 'green' :
                            inv.paymentStatus === 'Partial' ? 'orange' :
                            inv.paymentStatus === 'Overdue' ? 'red' : 'blue'
                          }
                          size="sm"
                          dot={inv.paymentStatus === 'Pending'}
                        >
                          {inv.paymentStatus}
                        </Badge>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="text-sm font-bold text-[#1C1C1E]">
                          {formatTaka(inv.total)}
                        </div>
                        <div className="text-[10px] text-[#8E8E93]">
                          Tax: {formatTaka(inv.salesTax)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewInvoice(inv)}
                            title="View & Print Invoice (Demo Layout)"
                            className="p-1.5 rounded-lg bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const newStatus = inv.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
                              updateInvoiceStatus(inv.id, newStatus);
                            }}
                            title={inv.paymentStatus === 'Paid' ? 'Mark as Pending' : 'Mark as Paid'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              inv.paymentStatus === 'Paid'
                                ? 'bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759] hover:text-white'
                                : 'bg-[#FF9500]/10 text-[#FF9500] hover:bg-[#FF9500] hover:text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(inv)}
                            title="Delete Invoice"
                            className="p-1.5 rounded-lg bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AppleCard>
    </div>
  );
};
