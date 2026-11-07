import React from 'react';
import { Modal } from '../UI/Modal';
import { AppleButton } from '../UI/AppleButton';
import { InvoiceDetails } from '../../types';
import { useData } from '../../context/DataContext';
import { Printer, Download, Share2, CheckCircle2, Clock, Sprout, ArrowLeft } from 'lucide-react';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceDetails | null;
  onUpdateStatus?: (status: InvoiceDetails['paymentStatus']) => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onUpdateStatus
}) => {
  const { company } = useData();

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice #${invoice.invoiceNumber}`}
      subtitle={`Generated for ${invoice.customerCompany || invoice.customerName} on ${invoice.date}`}
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Top Control Bar for preview / print / status update */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F2F2F7] border border-black/[0.05] print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#8E8E93]">Status:</span>
            <select
              value={invoice.paymentStatus}
              onChange={(e) => onUpdateStatus && onUpdateStatus(e.target.value as InvoiceDetails['paymentStatus'])}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-black/[0.1] text-[#1C1C1E] shadow-xs cursor-pointer"
            >
              <option value="Paid">✅ Paid in Full</option>
              <option value="Pending">⏳ Pending Payment</option>
              <option value="Partial">🟡 Partial Payment</option>
              <option value="Overdue">❌ Overdue</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <AppleButton
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              icon={<Printer className="w-4 h-4 text-[#007AFF]" />}
              className="bg-white border border-black/[0.08]"
            >
              Print Invoice
            </AppleButton>
            <AppleButton
              variant="primary"
              size="sm"
              onClick={handlePrint}
              icon={<Download className="w-4 h-4" />}
            >
              Save as PDF / Print
            </AppleButton>
          </div>
        </div>

        {/* The Printable Invoice Sheet (Faithfully structured to user's demo invoice in image.png) */}
        <div 
          id="printable-invoice-sheet" 
          className="bg-white p-8 sm:p-12 rounded-2xl border border-black/[0.1] shadow-[0_4px_24px_rgba(0,0,0,0.06)] print:shadow-none print:border-none print:p-0 max-w-4xl mx-auto font-sans text-[#1C1C1E]"
        >
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6">
            {/* Left: Company Logo & Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#007AFF] flex items-center justify-center text-white shadow-sm shrink-0">
                  <Sprout className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#007AFF] tracking-tight uppercase">
                    {company.name}
                  </h2>
                  <p className="text-[10px] text-[#636366] font-medium tracking-wider uppercase">
                    {company.tagline}
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#3A3A3C] leading-relaxed pt-1">
                <p>{company.streetAddress}</p>
                <p>{company.cityStateZip}</p>
                <p>Phone: {company.phone} &nbsp; Fax: {company.fax}</p>
                <p>Email: {company.email}</p>
              </div>
            </div>

            {/* Right: INVOICE Title, Date, Invoice Number */}
            <div className="text-left sm:text-right space-y-1 sm:self-start">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#007AFF] tracking-tight">
                INVOICE
              </h1>
              <div className="pt-2 text-xs space-y-1">
                <div className="flex justify-between sm:justify-end gap-4">
                  <span className="font-bold text-[#1C1C1E] uppercase text-[11px]">DATE:</span>
                  <span className="text-[#3A3A3C]">{invoice.date}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-4">
                  <span className="font-bold text-[#1C1C1E] uppercase text-[11px]">INVOICE:</span>
                  <span className="text-[#3A3A3C] font-semibold">{invoice.invoiceNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Solid Accent Line from demo image */}
          <div className="h-1 bg-[#007AFF] w-full mb-6" />

          {/* Bill To & Ship To Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6 text-xs">
            {/* Bill To */}
            <div className="space-y-1">
              <h4 className="font-bold text-[#007AFF] text-xs uppercase mb-1">Bill To:</h4>
              <p className="font-semibold text-sm text-[#1C1C1E]">{invoice.customerName}</p>
              {invoice.customerCompany && (
                <p className="font-medium text-[#3A3A3C]">{invoice.customerCompany}</p>
              )}
              {invoice.customerAddress && <p className="text-[#636366]">{invoice.customerAddress}</p>}
              <p className="text-[#636366]">{invoice.customerCityStateZip}</p>
              {invoice.customerPhone && <p className="text-[#636366]">Phone: {invoice.customerPhone}</p>}
            </div>

            {/* Ship To */}
            <div className="space-y-1">
              <h4 className="font-bold text-[#007AFF] text-xs uppercase mb-1">Ship To:</h4>
              <p className="font-semibold text-sm text-[#1C1C1E]">
                {invoice.shipToName || invoice.customerName}
              </p>
              <p className="font-medium text-[#3A3A3C]">
                {invoice.shipToCompany || invoice.customerCompany}
              </p>
              <p className="text-[#636366]">
                {invoice.shipToAddress || invoice.customerAddress}
              </p>
              <p className="text-[#636366]">
                {invoice.shipToCityStateZip || invoice.customerCityStateZip}
              </p>
              <p className="text-[#636366]">
                Phone: {invoice.shipToPhone || invoice.customerPhone}
              </p>
            </div>
          </div>

          {/* Salesperson, Ship Via, Ship Date, Terms, Due Date Table */}
          <div className="border border-[#1C1C1E]/20 mb-6 overflow-hidden">
            <div className="grid grid-cols-5 bg-[#F9F9FB] border-b border-[#1C1C1E]/20 text-[10px] sm:text-[11px] font-bold text-[#1C1C1E] text-center uppercase tracking-wider py-1.5">
              <div className="border-r border-[#1C1C1E]/20 px-1">SALESPERSON</div>
              <div className="border-r border-[#1C1C1E]/20 px-1">SHIP VIA</div>
              <div className="border-r border-[#1C1C1E]/20 px-1">SHIP DATE</div>
              <div className="border-r border-[#1C1C1E]/20 px-1">TERMS</div>
              <div className="px-1">DUE DATE</div>
            </div>
            <div className="grid grid-cols-5 text-center text-xs py-2 text-[#3A3A3C]">
              <div className="border-r border-[#1C1C1E]/20 px-1 truncate">{invoice.salesperson}</div>
              <div className="border-r border-[#1C1C1E]/20 px-1 truncate">{invoice.shipVia}</div>
              <div className="border-r border-[#1C1C1E]/20 px-1">{invoice.shipDate}</div>
              <div className="border-r border-[#1C1C1E]/20 px-1 font-medium">{invoice.terms}</div>
              <div className="px-1 font-medium">{invoice.dueDate}</div>
            </div>
          </div>

          {/* Itemized Seed Items Table (Matching structure from image) */}
          <div className="border border-[#1C1C1E]/20 mb-6 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F9F9FB] border-b border-[#1C1C1E]/20 text-[11px] font-bold text-[#1C1C1E] uppercase">
                  <th className="py-2 px-3 border-r border-[#1C1C1E]/20 w-12 text-center">ID</th>
                  <th className="py-2 px-3 border-r border-[#1C1C1E]/20">DESCRIPTION</th>
                  <th className="py-2 px-3 border-r border-[#1C1C1E]/20 text-center w-24">QUANTITY</th>
                  <th className="py-2 px-3 border-r border-[#1C1C1E]/20 text-right w-28">UNIT PRICE (৳)</th>
                  <th className="py-2 px-3 text-right w-28">LINE TOTAL (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1E]/15">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2 px-3 border-r border-[#1C1C1E]/20 text-center font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-[#1C1C1E]/20">
                      <div className="font-semibold text-[#1C1C1E]">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-[#636366]">
                        Variety: {item.subProductName} • ({item.productType === 'imported' ? 'Imported Hybrid' : 'Own Production'})
                      </div>
                    </td>
                    <td className="py-2 px-3 border-r border-[#1C1C1E]/20 text-center font-medium">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2 px-3 border-r border-[#1C1C1E]/20 text-right">
                      {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      ৳ {item.lineTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}

                {/* Aesthetic filler rows if fewer items to match official invoice template */}
                {invoice.items.length < 4 && Array.from({ length: 4 - invoice.items.length }).map((_, i) => (
                  <tr key={`empty-${i}`} className="h-8">
                    <td className="border-r border-[#1C1C1E]/20"></td>
                    <td className="border-r border-[#1C1C1E]/20"></td>
                    <td className="border-r border-[#1C1C1E]/20"></td>
                    <td className="border-r border-[#1C1C1E]/20 text-right text-[#8E8E93] px-3">৳</td>
                    <td className="text-right text-[#8E8E93] px-3">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Financials & Notes Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start text-xs">
            {/* Left Terms & Payment Instructions */}
            <div className="sm:col-span-7 space-y-3">
              <div className="text-xs text-[#3A3A3C] leading-relaxed">
                <p className="font-semibold">Make all checks payable to <span className="font-bold text-[#1C1C1E]">{company.name}</span></p>
                <p className="text-[11px] text-[#636366] mt-0.5">
                  If you have any questions concerning this invoice, contact {company.phone}, {company.email}
                </p>
                <p className="text-[11px] text-[#8E8E93] mt-1">
                  Bank Routing: {company.routingNumber} | Acct: {company.bankAccount} ({company.bankName})
                </p>
              </div>

              <div className="pt-3 font-extrabold text-sm text-[#1C1C1E] uppercase tracking-wide">
                THANK YOU FOR YOUR BUSINESS!
              </div>

              {invoice.notes && (
                <div className="p-2.5 rounded bg-[#F9F9FB] border border-[#1C1C1E]/10 text-[11px] text-[#636366]">
                  <strong>Special Instructions:</strong> {invoice.notes}
                </div>
              )}
            </div>

            {/* Right Financials Calculations */}
            <div className="sm:col-span-5 border border-[#1C1C1E]/20">
              <div className="divide-y divide-[#1C1C1E]/15">
                <div className="grid grid-cols-2 py-1.5 px-3">
                  <span className="font-bold text-[11px] uppercase text-[#636366]">SUBTOTAL</span>
                  <span className="text-right font-semibold text-[#1C1C1E]">৳ {invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 py-1.5 px-3">
                  <span className="font-bold text-[11px] uppercase text-[#636366]">TAX / VAT RATE</span>
                  <span className="text-right text-[#1C1C1E]">{invoice.taxRate.toFixed(2)}%</span>
                </div>
                <div className="grid grid-cols-2 py-1.5 px-3">
                  <span className="font-bold text-[11px] uppercase text-[#636366]">SALES TAX / VAT</span>
                  <span className="text-right text-[#1C1C1E]">৳ {invoice.salesTax.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 py-1.5 px-3">
                  <span className="font-bold text-[11px] uppercase text-[#636366]">SHIPPING & HANDLING</span>
                  <span className="text-right text-[#1C1C1E]">
                    {invoice.shippingHandling > 0 ? `৳ ${invoice.shippingHandling.toFixed(2)}` : '-'}
                  </span>
                </div>
                {invoice.discount > 0 && (
                  <div className="grid grid-cols-2 py-1.5 px-3 text-[#34C759]">
                    <span className="font-bold text-[11px] uppercase">DISCOUNT</span>
                    <span className="text-right">-৳ {invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 py-2.5 px-3 bg-[#F9F9FB] border-t-2 border-[#1C1C1E]">
                  <span className="font-extrabold text-sm uppercase text-[#1C1C1E]">TOTAL</span>
                  <span className="text-right font-extrabold text-base text-[#007AFF]">
                    ৳ {invoice.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
