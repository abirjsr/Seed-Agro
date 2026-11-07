import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { AppleButton } from '../UI/AppleButton';
import { Badge } from '../UI/Badge';
import { useData } from '../../context/DataContext';
import { 
  CustomerLead, 
  SeedProduct, 
  SaleItem, 
  InvoiceDetails 
} from '../../types';
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle, 
  UserPlus, 
  Receipt,
  Truck,
  Calendar,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedProduct?: SeedProduct | null;
  preSelectedCustomer?: CustomerLead | null;
  onSuccessInvoice: (invoice: InvoiceDetails) => void;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  preSelectedProduct,
  preSelectedCustomer,
  onSuccessInvoice
}) => {
  const { products, customers, createSaleInvoice, invoices } = useData();

  // Customer selection or quick add
  const [isNewCustomerMode, setIsNewCustomerMode] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustCityStateZip, setNewCustCityStateZip] = useState('');

  // Sales Order Metadata
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [salesDate, setSalesDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [shipDate, setShipDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [salesperson, setSalesperson] = useState('Sales Officer');
  const [shipVia, setShipVia] = useState('Direct Delivery / Courier');
  const [terms, setTerms] = useState('Net 30');

  // Ship To Address (defaults to Bill To)
  const [sameAsBillTo, setSameAsBillTo] = useState(true);
  const [shipToName, setShipToName] = useState('');
  const [shipToCompany, setShipToCompany] = useState('');
  const [shipToAddress, setShipToAddress] = useState('');
  const [shipToCityStateZip, setShipToCityStateZip] = useState('');
  const [shipToPhone, setShipToPhone] = useState('');

  // Line items
  const [items, setItems] = useState<Array<{
    productId: string;
    productName: string;
    subProductName: string;
    productType: SeedProduct['type'];
    quantity: number;
    unit: string;
    unitPrice: number;
    lineTotal: number;
    availableStock: number;
  }>>([]);

  // Financial fields matching demo invoice
  const [taxRate, setTaxRate] = useState<number>(6.50);
  const [shippingHandling, setShippingHandling] = useState<number>(0.00);
  const [discount, setDiscount] = useState<number>(0.00);
  const [paymentStatus, setPaymentStatus] = useState<InvoiceDetails['paymentStatus']>('Paid');
  const [notes, setNotes] = useState('Make all checks payable to AGROSEED BIO-GENOMICS & SEED CO. Thank you for your business!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (isOpen) {
      // Auto increment next invoice number
      const nextNum = (invoices.length > 0 ? Math.max(...invoices.map(i => parseInt(i.invoiceNumber) || 100)) + 1 : 103).toString();
      setInvoiceNumber(nextNum);
      setErrorMessage(null);

      if (preSelectedCustomer) {
        setSelectedCustomerId(preSelectedCustomer.id);
        setIsNewCustomerMode(false);
      } else if (customers.length > 0) {
        setSelectedCustomerId(customers[0].id);
        setIsNewCustomerMode(false);
      } else {
        setIsNewCustomerMode(true);
      }

      if (preSelectedProduct) {
        setItems([
          {
            productId: preSelectedProduct.id,
            productName: preSelectedProduct.name,
            subProductName: preSelectedProduct.subProductName,
            productType: preSelectedProduct.type,
            quantity: 10,
            unit: preSelectedProduct.unit,
            unitPrice: preSelectedProduct.sellingPrice,
            lineTotal: Number((10 * preSelectedProduct.sellingPrice).toFixed(2)),
            availableStock: preSelectedProduct.stockQuantity
          }
        ]);
      } else if (products.length > 0) {
        const p1 = products[0];
        setItems([
          {
            productId: p1.id,
            productName: p1.name,
            subProductName: p1.subProductName,
            productType: p1.type,
            quantity: 10,
            unit: p1.unit,
            unitPrice: p1.sellingPrice,
            lineTotal: Number((10 * p1.sellingPrice).toFixed(2)),
            availableStock: p1.stockQuantity
          }
        ]);
      }
    }
  }, [isOpen, preSelectedProduct, preSelectedCustomer]);

  // Add Item row
  const handleAddItem = () => {
    if (products.length === 0) return;
    const prod = products.find(p => !items.some(it => it.productId === p.id)) || products[0];
    setItems(prev => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        subProductName: prod.subProductName,
        productType: prod.type,
        quantity: 5,
        unit: prod.unit,
        unitPrice: prod.sellingPrice,
        lineTotal: Number((5 * prod.sellingPrice).toFixed(2)),
        availableStock: prod.stockQuantity
      }
    ]);
  };

  // Change product in row
  const handleProductChange = (index: number, newProdId: string) => {
    const prod = products.find(p => p.id === newProdId);
    if (!prod) return;
    setItems(prev => {
      const next = [...prev];
      const qty = next[index].quantity;
      next[index] = {
        productId: prod.id,
        productName: prod.name,
        subProductName: prod.subProductName,
        productType: prod.type,
        quantity: qty,
        unit: prod.unit,
        unitPrice: prod.sellingPrice,
        lineTotal: Number((qty * prod.sellingPrice).toFixed(2)),
        availableStock: prod.stockQuantity
      };
      return next;
    });
  };

  // Change quantity or unit price in row
  const handleItemUpdate = (index: number, field: 'quantity' | 'unitPrice', val: number) => {
    setItems(prev => {
      const next = [...prev];
      const current = next[index];
      const qty = field === 'quantity' ? val : current.quantity;
      const price = field === 'unitPrice' ? val : current.unitPrice;
      next[index] = {
        ...current,
        [field]: val,
        lineTotal: Number((qty * price).toFixed(2))
      };
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Subtotal & Financials Calculations
  const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
  const salesTax = Number(((subtotal * taxRate) / 100).toFixed(2));
  const grandTotal = Number((subtotal + salesTax + shippingHandling - discount).toFixed(2));

  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Please add at least one seed product to this sale.');
      return;
    }

    // Determine customer info
    let targetCustomerId = selectedCustomerId;
    let targetCustName = '';
    let targetCustCompany = '';
    let targetCustPhone = '';
    let targetCustEmail = '';
    let targetCustAddress = '';
    let targetCustCityStateZip = '';

    if (isNewCustomerMode) {
      if (!newCustName.trim()) {
        setErrorMessage('Please enter Customer Contact Name for this sale.');
        return;
      }
      targetCustomerId = `cust-${Date.now()}`;
      targetCustName = newCustName.trim();
      targetCustCompany = newCustCompany.trim();
      targetCustPhone = newCustPhone.trim();
      targetCustEmail = newCustEmail.trim();
      targetCustAddress = newCustAddress.trim();
      targetCustCityStateZip = newCustCityStateZip.trim();
    } else {
      const cust = customers.find(c => c.id === selectedCustomerId);
      if (!cust) {
        setErrorMessage('Please select a valid customer.');
        return;
      }
      targetCustomerId = cust.id;
      targetCustName = cust.name;
      targetCustCompany = cust.companyName;
      targetCustPhone = cust.phone;
      targetCustEmail = cust.email;
      targetCustAddress = cust.address;
      targetCustCityStateZip = `${cust.city}, ${cust.state} ${cust.zipCode}`;
    }

    // Format Sale Items
    const saleItems: SaleItem[] = items.map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      productId: it.productId,
      productName: it.productName,
      subProductName: it.subProductName,
      productType: it.productType,
      quantity: it.quantity,
      unit: it.unit,
      unitPrice: it.unitPrice,
      lineTotal: it.lineTotal
    }));

    const result = createSaleInvoice({
      invoiceNumber: invoiceNumber.trim() || `${Date.now()}`,
      date: salesDate,
      dueDate,
      customerId: targetCustomerId,
      customerName: targetCustName,
      customerCompany: targetCustCompany,
      customerAddress: targetCustAddress,
      customerCityStateZip: targetCustCityStateZip,
      customerPhone: targetCustPhone,
      shipToName: sameAsBillTo ? targetCustName : shipToName || targetCustName,
      shipToCompany: sameAsBillTo ? targetCustCompany : shipToCompany || targetCustCompany,
      shipToAddress: sameAsBillTo ? targetCustAddress : shipToAddress || targetCustAddress,
      shipToCityStateZip: sameAsBillTo ? targetCustCityStateZip : shipToCityStateZip || targetCustCityStateZip,
      shipToPhone: sameAsBillTo ? targetCustPhone : shipToPhone || targetCustPhone,
      salesperson,
      shipVia,
      shipDate,
      terms,
      items: saleItems,
      subtotal,
      taxRate,
      salesTax,
      shippingHandling,
      discount,
      total: grandTotal,
      paymentStatus,
      paidAmount: paymentStatus === 'Paid' ? grandTotal : 0,
      notes
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to process sale.');
      return;
    }

    // Confetti animation on successful seed sale!
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    if (result.invoice) {
      onSuccessInvoice(result.invoice);
    }
    onClose();
  };

  const selectedCust = customers.find(c => c.id === selectedCustomerId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Seed Sale & Generate Invoice"
      subtitle="Complete order details, apply payment terms, and automatically deduct warehouse stock"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmitSale} className="space-y-6">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#DC2626] text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Customer / Lead Selection */}
        <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-black/[0.05] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-[#007AFF]" />
              <span>1. Customer & Bill-To Information</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsNewCustomerMode(prev => !prev)}
              className="text-xs text-[#007AFF] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isNewCustomerMode ? 'Select Existing Customer' : '+ Quick Add New Customer / Lead'}</span>
            </button>
          </div>

          {!isNewCustomerMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                  Select Existing Customer or Farm Account *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.customerType} [{c.city}, {c.state}]
                    </option>
                  ))}
                </select>
              </div>

              {selectedCust && (
                <div className="p-2.5 bg-white rounded-xl border border-black/[0.06] text-xs">
                  <div className="text-[11px] text-[#8E8E93]">Billing Address Preview:</div>
                  <div className="font-semibold text-[#1C1C1E] truncate">{selectedCust.name}</div>
                  <div className="text-[11px] text-[#636366] truncate">{selectedCust.companyName}</div>
                  <div className="text-[10px] text-[#8E8E93] truncate">{selectedCust.address}, {selectedCust.city}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">Customer / Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jonathan Vance"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">Farm / Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Prairie Gold Ag Corp"
                    value={newCustCompany}
                    onChange={(e) => setNewCustCompany(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="(515) 555-0192"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="orders@prairiegold.com"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">Address & City</label>
                  <input
                    type="text"
                    placeholder="742 North Farm Line Road"
                    value={newCustAddress}
                    onChange={(e) => setNewCustAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Invoice Metadata Matching Demo Template */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-[#F9F9FB] border border-black/[0.05]">
          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1">Invoice #</label>
            <input
              type="text"
              required
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-black/[0.12] rounded-lg text-[#1C1C1E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1">Salesperson</label>
            <input
              type="text"
              value={salesperson}
              onChange={(e) => setSalesperson(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-black/[0.12] rounded-lg text-[#1C1C1E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1">Ship Via</label>
            <input
              type="text"
              value={shipVia}
              onChange={(e) => setShipVia(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-black/[0.12] rounded-lg text-[#1C1C1E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1">Payment Terms</label>
            <select
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-white border border-black/[0.12] rounded-lg text-[#1C1C1E] font-medium"
            >
              <option value="Net 30">Net 30</option>
              <option value="Net 15">Net 15</option>
              <option value="Due on Receipt">Due on Receipt</option>
              <option value="Cash / COD">Cash on Delivery</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-white border border-black/[0.12] rounded-lg text-[#1C1C1E]"
            />
          </div>
        </div>

        {/* Section 3: Seed Line Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-[#34C759]" />
              <span>2. Seed Products Line Items</span>
            </h4>
            <AppleButton
              variant="secondary"
              size="sm"
              type="button"
              onClick={handleAddItem}
              icon={<Plus className="w-3.5 h-3.5 text-[#007AFF]" />}
              className="bg-white border border-black/[0.08]"
            >
              + Add Another Seed
            </AppleButton>
          </div>

          <div className="border border-black/[0.08] rounded-2xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#F9F9FB] text-[#8E8E93] font-semibold">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3 min-w-[220px]">Seed Product & Sub-Product Variety</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit Price (৳)</th>
                    <th className="py-2.5 px-3 text-right">Line Total (৳)</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {items.map((it, idx) => {
                    const isExceedingStock = it.quantity > it.availableStock;
                    return (
                      <tr key={idx} className="hover:bg-[#F9F9FB]/80">
                        <td className="py-2.5 px-3 font-semibold text-[#8E8E93]">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <select
                            value={it.productId}
                            onChange={(e) => handleProductChange(idx, e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-black/[0.12] rounded-lg text-[#1C1C1E] font-semibold focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} - {p.subProductName} (Avail: {p.stockQuantity} {p.unit})
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2 mt-1 text-[10px]">
                            <span className={isExceedingStock ? 'text-[#FF3B30] font-bold' : 'text-[#8E8E93]'}>
                              Available In Stock: {it.availableStock} {it.unit}
                            </span>
                            {isExceedingStock && (
                              <span className="text-[#FF3B30] font-semibold flex items-center gap-0.5">
                                <AlertTriangle className="w-3 h-3" /> Insufficient Stock!
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant={it.productType === 'imported' ? 'blue' : 'green'} size="sm">
                            {it.productType === 'imported' ? 'Imported' : 'Own Prod'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              min="1"
                              step="any"
                              required
                              value={it.quantity}
                              onChange={(e) => handleItemUpdate(idx, 'quantity', parseFloat(e.target.value) || 0)}
                              className={`w-20 px-2 py-1.5 text-xs text-right font-bold bg-white border rounded-lg focus:outline-none ${
                                isExceedingStock ? 'border-[#FF3B30] text-[#FF3B30]' : 'border-black/[0.12] text-[#1C1C1E]'
                              }`}
                            />
                            <span className="text-[11px] text-[#8E8E93] w-12 text-left truncate">{it.unit}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={it.unitPrice}
                            onChange={(e) => handleItemUpdate(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1.5 text-xs text-right bg-white border border-black/[0.12] rounded-lg text-[#1C1C1E] font-medium focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-sm text-[#1C1C1E]">
                          ৳{it.lineTotal.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 rounded text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 4: Totals & Tax Calculation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Notes & Payment Status */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as InvoiceDetails['paymentStatus'])}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E]"
              >
                <option value="Paid">✅ Paid in Full (Settled)</option>
                <option value="Pending">⏳ Pending Payment (Credit / Terms)</option>
                <option value="Partial">🟡 Partial Payment Received</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                Invoice Footer / Payment Terms Note
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E]"
              />
            </div>
          </div>

          {/* Subtotal, Tax Rate, Sales Tax, Total */}
          <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-black/[0.06] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#636366]">
              <span>SUBTOTAL:</span>
              <span className="font-semibold text-[#1C1C1E] text-sm">৳{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#636366]">TAX / VAT RATE (%):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-xs text-right bg-white border border-black/[0.12] rounded-lg"
                />
                <span className="text-[#8E8E93]">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[#636366]">
              <span>SALES TAX / VAT:</span>
              <span className="font-semibold text-[#1C1C1E]">৳{salesTax.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#636366]">SHIPPING & HANDLING:</span>
              <div className="flex items-center gap-1">
                <span className="text-[#8E8E93]">৳</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingHandling}
                  onChange={(e) => setShippingHandling(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-xs text-right bg-white border border-black/[0.12] rounded-lg"
                />
              </div>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-[#34C759]">
                <span>DISCOUNT:</span>
                <span>-৳{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-black/[0.08] flex items-center justify-between font-bold text-base text-[#1C1C1E]">
              <span>TOTAL:</span>
              <span className="text-lg text-[#007AFF]">৳{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06]">
          <AppleButton variant="outline" type="button" onClick={onClose}>
            Cancel
          </AppleButton>
          <AppleButton variant="primary" type="submit" icon={<Sparkles className="w-4 h-4" />}>
            Generate Invoice & Complete Sale
          </AppleButton>
        </div>
      </form>
    </Modal>
  );
};
