import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { AppleButton } from '../UI/AppleButton';
import { Employee, BonusRecord } from '../../types';

interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onAddBonus: (bonus: Omit<BonusRecord, 'id'>) => void;
}

export const BonusModal: React.FC<BonusModalProps> = ({
  isOpen,
  onClose,
  employees,
  onAddBonus
}) => {
  const [employeeId, setEmployeeId] = useState(() => employees[0]?.id || '');
  const [amount, setAmount] = useState<number>(1000);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<BonusRecord['type']>('Harvest Season');
  const [reason, setReason] = useState('');

  const selectedEmp = employees.find(e => e.id === employeeId) || employees[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    if (amount <= 0) {
      alert('Please enter a valid bonus amount.');
      return;
    }

    onAddBonus({
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.name,
      amount: Number(amount),
      date,
      type,
      reason: reason.trim() || `${type} bonus reward`,
      status: 'Approved'
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Award Employee Bonus & Incentive"
      subtitle="Bonuses will be aggregated and credited during monthly salary payout"
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
                {emp.name} - {emp.role} ({emp.department})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Bonus Amount (৳) *
            </label>
            <input
              type="number"
              min="500"
              step="500"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-base font-bold text-[#34C759] bg-white border border-black/[0.12] rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Bonus Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as BonusRecord['type'])}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl font-medium"
            >
              <option value="Harvest Season">🌾 Harvest Season Peak</option>
              <option value="Performance">⭐ Performance Review</option>
              <option value="Target Achievement">🎯 Sales Target Achievement</option>
              <option value="Annual Festival">🎁 Annual Festival</option>
              <option value="Special">💡 Special Grant</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
            Award Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
            Reason / Achievement Description
          </label>
          <input
            type="text"
            placeholder="e.g. Yield target exceeded by 18%, outstanding seed genetics test"
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
            Award Bonus
          </AppleButton>
        </div>
      </form>
    </Modal>
  );
};
