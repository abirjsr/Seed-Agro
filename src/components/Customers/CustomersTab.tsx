import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Trash2, 
  ShoppingCart, 
  Sparkles, 
  Building2, 
  UserCheck, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AppleCard } from '../UI/AppleCard';
import { AppleButton } from '../UI/AppleButton';
import { Badge } from '../UI/Badge';
import { SegmentedControl } from '../UI/SegmentedControl';
import { CustomerLead, CustomerType, LeadStatus } from '../../types';
import { CustomerModal } from './CustomerModal';
import { formatTaka } from '../../utils/format';

interface CustomersTabProps {
  onOpenNewSaleForCustomer: (customer: CustomerLead) => void;
  searchQuery: string;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  onOpenNewSaleForCustomer,
  searchQuery: externalSearch
}) => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, invoices } = useData();

  const [segment, setSegment] = useState<'all' | 'active' | 'leads'>('all');
  const [internalSearch, setInternalSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerLead | null>(null);

  const activeSearch = externalSearch || internalSearch;

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (segment === 'active' && c.leadStatus !== 'Active Customer') return false;
      if (segment === 'leads' && (c.leadStatus === 'Active Customer' || c.leadStatus === 'Inactive')) return false;

      if (activeSearch.trim()) {
        const q = activeSearch.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchCompany = c.companyName.toLowerCase().includes(q);
        const matchPhone = c.phone.toLowerCase().includes(q);
        const matchEmail = c.email.toLowerCase().includes(q);
        const matchCity = c.city.toLowerCase().includes(q);
        return matchName || matchCompany || matchPhone || matchEmail || matchCity;
      }
      return true;
    });
  }, [customers, segment, activeSearch]);

  const activeCount = customers.filter(c => c.leadStatus === 'Active Customer').length;
  const leadsCount = customers.filter(c => c.leadStatus !== 'Active Customer' && c.leadStatus !== 'Inactive').length;

  const handleSave = (data: Omit<CustomerLead, 'id' | 'createdAt' | 'totalOrdersCount' | 'totalSpent'>) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, data);
    } else {
      addCustomer(data);
    }
  };

  const handleDelete = (customer: CustomerLead) => {
    if (window.confirm(`Delete customer "${customer.name} (${customer.companyName})"? This will remove their record.`)) {
      deleteCustomer(customer.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Control Card */}
      <AppleCard padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SegmentedControl
          options={[
            { value: 'all', label: 'All Contacts', count: customers.length },
            { 
              value: 'active', 
              label: 'Active Buyers', 
              count: activeCount,
              icon: <UserCheck className="w-3.5 h-3.5 text-[#34C759]" />
            },
            { 
              value: 'leads', 
              label: 'Lead Pipeline', 
              count: leadsCount,
              icon: <Clock className="w-3.5 h-3.5 text-[#5856D6]" />
            }
          ]}
          value={segment}
          onChange={(val) => setSegment(val as typeof segment)}
        />

        <AppleButton
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Customer / Capture Lead
        </AppleButton>
      </AppleCard>

      {/* Customer / Leads Table */}
      <AppleCard padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-white/80 backdrop-blur-sm">
          <div>
            <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
              Customer Directory & Lead Pipeline ({filteredCustomers.length})
            </h3>
            <p className="text-xs text-[#8E8E93]">
              Manage wholesale buyers, retail dealers, and inbound farming leads
            </p>
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-[#8E8E93] mx-auto mb-3 opacity-60" />
            <h4 className="text-sm font-semibold text-[#1C1C1E]">No contacts match your query</h4>
            <p className="text-xs text-[#8E8E93] mt-1">Capture a new lead or change search filters.</p>
            <AppleButton
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingCustomer(null);
                setIsModalOpen(true);
              }}
              className="mt-4"
            >
              + Add Contact
            </AppleButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#F9F9FB] text-[#8E8E93] font-semibold">
                  <th className="py-3 px-4">Customer Name & Company</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Pipeline Status</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Orders / Spend</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {filteredCustomers.map((cust) => {
                  return (
                    <tr 
                      key={cust.id} 
                      className="hover:bg-[#F5F5F7]/80 transition-colors group"
                    >
                      {/* Name & Company */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-[#1C1C1E]">{cust.name}</div>
                        {cust.companyName && (
                          <div className="text-[11px] text-[#636366] font-medium flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-[#8E8E93]" />
                            <span>{cust.companyName}</span>
                          </div>
                        )}
                        {cust.notes && (
                          <p className="text-[10px] text-[#8E8E93] truncate max-w-xs mt-0.5">
                            {cust.notes}
                          </p>
                        )}
                      </td>

                      {/* Customer Type */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold text-[#1C1C1E] block">
                          {cust.customerType}
                        </span>
                      </td>

                      {/* Lead Status */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            cust.leadStatus === 'Active Customer' ? 'green' :
                            cust.leadStatus === 'Quotation Sent' ? 'blue' :
                            cust.leadStatus === 'Contacted' ? 'purple' :
                            cust.leadStatus === 'New Lead' ? 'orange' : 'gray'
                          }
                          size="sm"
                          dot={cust.leadStatus === 'New Lead'}
                        >
                          {cust.leadStatus}
                        </Badge>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        {cust.phone && (
                          <div className="text-xs text-[#1C1C1E] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#8E8E93]" />
                            <span>{cust.phone}</span>
                          </div>
                        )}
                        {cust.email && (
                          <div className="text-[11px] text-[#8E8E93] flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-[#8E8E93]" />
                            <span className="truncate max-w-[150px]">{cust.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-[#3A3A3C] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#8E8E93]" />
                          <span>{cust.city}, {cust.state}</span>
                        </div>
                        <span className="text-[10px] text-[#8E8E93] block ml-4">
                          {cust.zipCode}
                        </span>
                      </td>

                      {/* Orders Count & Spend */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="text-sm font-bold text-[#1C1C1E]">
                          {formatTaka(cust.totalSpent)}
                        </div>
                        <div className="text-[10px] text-[#8E8E93]">
                          {cust.totalOrdersCount} orders placed
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenNewSaleForCustomer(cust)}
                            title="Create new seed sale for this customer"
                            className="p-1.5 rounded-lg bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-colors cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCustomer(cust);
                              setIsModalOpen(true);
                            }}
                            title="Edit customer details"
                            className="p-1.5 rounded-lg bg-black/5 text-[#636366] hover:bg-black/10 hover:text-[#1C1C1E] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cust)}
                            title="Delete customer record"
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

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialCustomer={editingCustomer}
      />
    </div>
  );
};
