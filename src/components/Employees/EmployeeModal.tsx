import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { AppleButton } from '../UI/AppleButton';
import { Employee, DepartmentType, EmploymentType } from '../../types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'id'>) => void;
  initialEmployee?: Employee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEmployee
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<DepartmentType>('Production & Farm');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
  const [baseMonthlySalary, setBaseMonthlySalary] = useState<number>(5000);
  const [bankAccount, setBankAccount] = useState('');
  const [status, setStatus] = useState<Employee['status']>('Active');

  useEffect(() => {
    if (initialEmployee) {
      setName(initialEmployee.name);
      setRole(initialEmployee.role);
      setDepartment(initialEmployee.department);
      setEmail(initialEmployee.email);
      setPhone(initialEmployee.phone);
      setAddress(initialEmployee.address);
      setJoiningDate(initialEmployee.joiningDate);
      setEmploymentType(initialEmployee.employmentType);
      setBaseMonthlySalary(initialEmployee.baseMonthlySalary);
      setBankAccount(initialEmployee.bankAccount);
      setStatus(initialEmployee.status);
    } else {
      setName('');
      setRole('');
      setDepartment('Production & Farm');
      setEmail('');
      setPhone('');
      setAddress('Des Moines, IA');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setEmploymentType('Full-time');
      setBaseMonthlySalary(4800);
      setBankAccount('Chase Bank (Acct ...1234)');
      setStatus('Active');
    }
  }, [initialEmployee, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      alert('Please fill in Employee Name and Role/Designation.');
      return;
    }

    onSave({
      name: name.trim(),
      role: role.trim(),
      department,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@agroseedbiogen.com`,
      phone: phone.trim(),
      address: address.trim(),
      joiningDate,
      employmentType,
      baseMonthlySalary: Number(baseMonthlySalary) || 0,
      bankAccount: bankAccount.trim() || 'Direct Deposit on file',
      status
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialEmployee ? 'Edit Employee Information' : 'Add New Employee'}
      subtitle="Manage staffing, job designations, departmental assignments, and monthly salary baseline"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Evelyn Ross"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Job Title / Designation *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chief Seed Breeder / Farm Mgr"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as DepartmentType)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            >
              <option value="Production & Farm">Production & Farm Operations</option>
              <option value="R&D & Quality">R&D, Genetics & Quality Lab</option>
              <option value="Sales & Marketing">Sales & Seed Distribution</option>
              <option value="Warehouse & Logistics">Warehouse & Seed Logistics</option>
              <option value="Administration & Finance">Administration & Finance</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Employment Type
            </label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            >
              <option value="Full-time">Full-time Regular</option>
              <option value="Part-time">Part-time</option>
              <option value="Seasonal Contract">Seasonal Harvest Contract</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Base Monthly Salary (৳) *
            </label>
            <input
              type="number"
              min="0"
              step="50"
              required
              value={baseMonthlySalary}
              onChange={(e) => setBaseMonthlySalary(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-base font-bold text-[#007AFF] bg-white border border-black/[0.12] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Bank Account / Direct Deposit
            </label>
            <input
              type="text"
              placeholder="e.g. Wells Fargo (...4401)"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="employee@agroseedbiogen.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="(515) 555-8821"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Joining Date
            </label>
            <input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Employee['status'])}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] font-semibold"
            >
              <option value="Active">🟢 Active Employee</option>
              <option value="On Leave">🟡 On Leave</option>
              <option value="Terminated">🔴 Terminated</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
            Residential Address
          </label>
          <input
            type="text"
            placeholder="Street address, City, State"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06]">
          <AppleButton variant="outline" type="button" onClick={onClose}>
            Cancel
          </AppleButton>
          <AppleButton variant="primary" type="submit">
            {initialEmployee ? 'Update Employee' : 'Save Employee'}
          </AppleButton>
        </div>
      </form>
    </Modal>
  );
};
