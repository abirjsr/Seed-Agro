import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { AppleButton } from '../UI/AppleButton';
import { CustomerLead, CustomerType, LeadStatus } from '../../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<CustomerLead, 'id' | 'createdAt' | 'totalOrdersCount' | 'totalSpent'>) => void;
  initialCustomer?: CustomerLead | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCustomer
}) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('IA');
  const [zipCode, setZipCode] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Wholesale Dealer');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('New Lead');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialCustomer) {
      setName(initialCustomer.name);
      setCompanyName(initialCustomer.companyName);
      setPhone(initialCustomer.phone);
      setEmail(initialCustomer.email);
      setAddress(initialCustomer.address);
      setCity(initialCustomer.city);
      setState(initialCustomer.state);
      setZipCode(initialCustomer.zipCode);
      setCustomerType(initialCustomer.customerType);
      setLeadStatus(initialCustomer.leadStatus);
      setNotes(initialCustomer.notes || '');
    } else {
      setName('');
      setCompanyName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCity('Des Moines');
      setState('IA');
      setZipCode('50309');
      setCustomerType('Wholesale Dealer');
      setLeadStatus('New Lead');
      setNotes('');
    }
  }, [initialCustomer, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a Customer or Lead Contact Name.');
      return;
    }

    onSave({
      name: name.trim(),
      companyName: companyName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      customerType,
      leadStatus,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialCustomer ? 'Edit Customer / Lead' : 'Add New Customer or Capture Lead'}
      subtitle="Track customer details, farming operations, and sales lead qualification"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Contact Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jonathan Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Farm / Company Name
            </label>
            <input
              type="text"
              placeholder="e.g. Prairie Gold Ag Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Customer Classification
            </label>
            <select
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value as CustomerType)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            >
              <option value="Wholesale Dealer">Wholesale Dealer (Bulk Seeds)</option>
              <option value="Retail Dealer">Retail Dealer / Agro Mart</option>
              <option value="Commercial Farm">Commercial Farm Producer</option>
              <option value="Individual Farmer">Individual Farmer</option>
              <option value="Prospect Lead">Prospect Lead</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Lead / Account Pipeline Status
            </label>
            <select
              value={leadStatus}
              onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 font-semibold"
            >
              <option value="New Lead">🌱 New Lead (Captured)</option>
              <option value="Contacted">📞 Contacted & Pitched</option>
              <option value="Quotation Sent">📑 Quotation Sent</option>
              <option value="Active Customer">⭐ Active Customer (Regular Buyer)</option>
              <option value="Inactive">⏸️ Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="(515) 555-0192"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="orders@prairiegold.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
            Street Address
          </label>
          <input
            type="text"
            placeholder="742 North Farm Line Road"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">Zip Code</label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
            Notes & Seed Requirements
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Acreage size, preferred hybrid varieties, payment terms..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06]">
          <AppleButton variant="outline" type="button" onClick={onClose}>
            Cancel
          </AppleButton>
          <AppleButton variant="primary" type="submit">
            {initialCustomer ? 'Update Customer' : 'Save Customer & Lead'}
          </AppleButton>
        </div>
      </form>
    </Modal>
  );
};
