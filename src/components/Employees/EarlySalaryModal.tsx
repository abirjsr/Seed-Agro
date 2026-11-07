import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { AppleButton } from '../UI/AppleButton';
import { Employee, EarlySalaryAdvance } from '../../types';
import { formatTaka } from '../../utils/format';

interface EarlySalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onAddAdvance: (advance: Omit<EarlySalaryAdvance, 'id'>) => void;
}

export const EarlySalaryModal: React.FC<EarlySalaryModalProps> = ({
  isOpen,
  onClose,
  employees,
  onAddAdvance
}) => {
  const [employeeId, setEmployeeId] = useState(() => employees[0]?.id || '');
  const [amount, setAmount] = useState<number>(5000);
  const [requestDate, setRequestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deductInMonth, setDeductInMonth] = useState('2026-08');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<EarlySalaryAdvance['status']>('Disbursed');

  const selectedEmp = employees.find(e => e.id === employeeId) || employees[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    if (amount <= 0) {
      alert('Please enter a valid advance amount.');
      return;
    }

    onAddAdvance({
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.name,
      amount: Number(amount),
      requestDate,
      disbursedDate: status === 'Disbursed' ? requestDate : undefined,
      deductInMonth,
      reason: reason.trim() || 'Early salary advance request',
      status
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Early Salary / Advance Withdrawal"
      subtitle="Early salary advances are automatically scheduled for deduction from the employee's monthly payroll"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
            Select Employee *
          </label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] font-medium"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} - {emp.role} (Base: {formatTaka(emp.baseMonthlySalary)}/mo)
              </option>
            ))}
          </select>
        </div>

        {selectedEmp && (
          <div className="p-3 bg-[#F2F2F7] rounded-xl text-xs flex items-center justify-between">
            <span className="text-[#8E8E93]">Monthly Base Salary:</span>
            <span className="font-bold text-[#1C1C1E]">{formatTaka(selectedEmp.baseMonthlySalary)}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Advance Amount (৳) *
            </label>
            <input
              type="number"
              min="500"
              max={selectedEmp?.baseMonthlySalary || 50000}
              step="500"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-base font-bold text-[#FF9500] bg-white border border-black/[0.12] rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Deduct In Payroll Month
            </label>
            <input
              type="month"
              value={deductInMonth}
              onChange={(e) => setDeductInMonth(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Request Date
            </label>
            <input
              type="date"
              value={requestDate}
              onChange={(e) => setRequestDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Disbursement Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EarlySalaryAdvance['status'])}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl font-medium"
            >
              <option value="Disbursed">✅ Disbursed / Paid Out</option>
              <option value="Approved">👍 Approved (Awaiting Payout)</option>
              <option value="Pending">⏳ Pending Approval</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
            Reason / Purpose of Advance *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Emergency vehicle repair, medical, housing..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06]">
          <AppleButton variant="outline" type="button" onClick={onClose}>
            Cancel
          </AppleButton>
          <AppleButton variant="primary" type="submit">
            Confirm Advance Request
          </AppleButton>
        </div>
      </form>
    </Modal>
  );
};
