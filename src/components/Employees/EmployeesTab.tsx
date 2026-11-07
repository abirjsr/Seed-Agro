import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  DollarSign, 
  Clock, 
  Gift, 
  FileSpreadsheet, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  Download, 
  TrendingUp, 
  AlertCircle,
  Building,
  Mail,
  Phone,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AppleCard } from '../UI/AppleCard';
import { AppleButton } from '../UI/AppleButton';
import { Badge } from '../UI/Badge';
import { SegmentedControl } from '../UI/SegmentedControl';
import { Employee, SalaryPayment, EarlySalaryAdvance, BonusRecord } from '../../types';
import { EmployeeModal } from './EmployeeModal';
import { EarlySalaryModal } from './EarlySalaryModal';
import { BonusModal } from './BonusModal';
import { formatTaka } from '../../utils/format';

interface EmployeesTabProps {
  searchQuery: string;
}

export const EmployeesTab: React.FC<EmployeesTabProps> = ({ searchQuery: externalSearch }) => {
  const { 
    employees, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee,
    salaryPayments,
    generateMonthlyPayroll,
    updateSalaryPaymentStatus,
    earlySalaryAdvances,
    addEarlySalaryAdvance,
    bonuses,
    addBonus
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'payroll' | 'early_salary' | 'bonuses' | 'reports'>('roster');
  const [internalSearch, setInternalSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Modals state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isEarlySalaryModalOpen, setIsEarlySalaryModalOpen] = useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);

  const activeSearch = externalSearch || internalSearch;

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (activeSearch.trim()) {
        const q = activeSearch.toLowerCase();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.role.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [employees, activeSearch]);

  // Overall Employee Stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const totalMonthlyBasePayroll = employees.reduce((sum, e) => sum + (e.status === 'Active' ? e.baseMonthlySalary : 0), 0);
  const totalAdvancesPending = earlySalaryAdvances.filter(a => a.deductInMonth === selectedMonth).reduce((sum, a) => sum + a.amount, 0);
  const totalBonusesThisMonth = bonuses.filter(b => b.date.startsWith(selectedMonth)).reduce((sum, b) => sum + b.amount, 0);

  // Month's computed payroll for active employees
  const currentMonthPayrollList = useMemo(() => {
    return employees.filter(e => e.status === 'Active').map(emp => {
      const existingRecord = salaryPayments.find(p => p.employeeId === emp.id && p.monthYear === selectedMonth);
      const bonusForMonth = bonuses
        .filter(b => b.employeeId === emp.id && b.date.startsWith(selectedMonth))
        .reduce((sum, b) => sum + b.amount, 0);
      const earlyAdvanceForMonth = earlySalaryAdvances
        .filter(a => a.employeeId === emp.id && a.deductInMonth === selectedMonth)
        .reduce((sum, a) => sum + a.amount, 0);

      const baseSalary = emp.baseMonthlySalary;
      const netSalary = baseSalary + bonusForMonth - earlyAdvanceForMonth;

      return {
        id: existingRecord?.id || `payroll-${emp.id}-${selectedMonth}`,
        employee: emp,
        monthYear: selectedMonth,
        baseSalary,
        bonusAmount: bonusForMonth,
        earlySalaryDeduction: earlyAdvanceForMonth,
        netSalary: netSalary > 0 ? netSalary : 0,
        paymentStatus: existingRecord ? existingRecord.status : ('Pending' as const),
        paymentDate: existingRecord?.paymentDate || selectedMonth + '-28'
      };
    });
  }, [employees, salaryPayments, bonuses, earlySalaryAdvances, selectedMonth]);

  const totalPayrollNetForMonth = currentMonthPayrollList.reduce((sum, r) => sum + r.netSalary, 0);

  // Yearly Payroll Aggregation
  const yearlyRecords = useMemo(() => {
    return employees.map(emp => {
      const records = salaryPayments.filter(p => p.employeeId === emp.id && p.monthYear.startsWith(selectedYear));
      const totalPaid = records.reduce((sum, r) => sum + r.netSalary, 0);
      const totalBonus = bonuses.filter(b => b.employeeId === emp.id && b.date.startsWith(selectedYear)).reduce((sum, b) => sum + b.amount, 0);
      const totalAdvances = earlySalaryAdvances.filter(a => a.employeeId === emp.id && a.deductInMonth.startsWith(selectedYear)).reduce((sum, a) => sum + a.amount, 0);

      return {
        employee: emp,
        totalPaid: totalPaid > 0 ? totalPaid : emp.baseMonthlySalary * (records.length || 8),
        totalBonus,
        totalAdvances,
        monthsCount: records.length || 8
      };
    });
  }, [employees, salaryPayments, bonuses, earlySalaryAdvances, selectedYear]);

  // Handler for Employee CRUD
  const handleSaveEmployee = (data: Omit<Employee, 'id'>) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, data);
    } else {
      addEmployee(data);
    }
  };

  const handleDeleteEmployee = (emp: Employee) => {
    if (window.confirm(`Delete employee "${emp.name}"? This will remove their record.`)) {
      deleteEmployee(emp.id);
    }
  };

  // Export Payroll Reports
  const handleExportPayrollReport = () => {
    const headers = ['Employee Name', 'Role', 'Department', 'Month/Year', 'Base Salary (BDT)', 'Bonus (BDT)', 'Early Salary Advance Deducted (BDT)', 'Net Salary (BDT)', 'Status'];
    const rows = currentMonthPayrollList.map(r => [
      `"${r.employee.name}"`,
      `"${r.employee.role}"`,
      `"${r.employee.department}"`,
      selectedMonth,
      r.baseSalary.toFixed(2),
      r.bonusAmount.toFixed(2),
      r.earlySalaryDeduction.toFixed(2),
      r.netSalary.toFixed(2),
      r.paymentStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Seed_Payroll_Report_${selectedMonth}.csv`;
    link.click();
  };

  const handleExportYearlyReport = () => {
    const headers = ['Employee Name', 'Role', 'Department', 'Year', 'Months Processed', 'Total Bonuses (BDT)', 'Total Advances (BDT)', 'Total Net Compensation (BDT)'];
    const rows = yearlyRecords.map(r => [
      `"${r.employee.name}"`,
      `"${r.employee.role}"`,
      `"${r.employee.department}"`,
      selectedYear,
      r.monthsCount,
      r.totalBonus.toFixed(2),
      r.totalAdvances.toFixed(2),
      r.totalPaid.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Seed_Yearly_Payroll_Report_${selectedYear}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <AppleCard padding="md" className="border-l-4 border-l-[#007AFF]">
          <div className="text-xs font-semibold text-[#8E8E93] uppercase">Active Staff Roster</div>
          <div className="text-2xl font-bold text-[#1C1C1E] mt-1">{activeEmployees} Employees</div>
          <div className="text-[11px] text-[#636366] mt-0.5">{totalEmployees} total on record</div>
        </AppleCard>

        <AppleCard padding="md" className="border-l-4 border-l-[#34C759]">
          <div className="text-xs font-semibold text-[#8E8E93] uppercase">Monthly Base Payroll</div>
          <div className="text-2xl font-bold text-[#34C759] mt-1">
            {formatTaka(totalMonthlyBasePayroll)}
          </div>
          <div className="text-[11px] text-[#636366] mt-0.5">Recurring monthly obligation</div>
        </AppleCard>

        <AppleCard padding="md" className="border-l-4 border-l-[#FF9500]">
          <div className="text-xs font-semibold text-[#8E8E93] uppercase">Early Salary Advances</div>
          <div className="text-2xl font-bold text-[#FF9500] mt-1">
            {formatTaka(totalAdvancesPending)}
          </div>
          <div className="text-[11px] text-[#636366] mt-0.5">Deducted in {selectedMonth}</div>
        </AppleCard>

        <AppleCard padding="md" className="border-l-4 border-l-[#AF52DE]">
          <div className="text-xs font-semibold text-[#8E8E93] uppercase">Bonuses Awarded</div>
          <div className="text-2xl font-bold text-[#AF52DE] mt-1">
            {formatTaka(totalBonusesThisMonth)}
          </div>
          <div className="text-[11px] text-[#636366] mt-0.5">Incentives for {selectedMonth}</div>
        </AppleCard>
      </div>

      {/* Sub-Tabs Control */}
      <AppleCard padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SegmentedControl
          options={[
            { 
              value: 'roster', 
              label: 'Staff Directory', 
              count: employees.length,
              icon: <Users className="w-3.5 h-3.5" />
            },
            { 
              value: 'payroll', 
              label: 'Monthly Salary', 
              icon: <DollarSign className="w-3.5 h-3.5 text-[#34C759]" />
            },
            { 
              value: 'early_salary', 
              label: 'Early Salary Advances', 
              count: earlySalaryAdvances.length,
              icon: <Clock className="w-3.5 h-3.5 text-[#FF9500]" />
            },
            { 
              value: 'bonuses', 
              label: 'Bonuses & Incentives', 
              count: bonuses.length,
              icon: <Gift className="w-3.5 h-3.5 text-[#AF52DE]" />
            },
            { 
              value: 'reports', 
              label: 'Salary Reports (Mo/Yr)', 
              icon: <FileSpreadsheet className="w-3.5 h-3.5 text-[#007AFF]" />
            }
          ]}
          value={activeSubTab}
          onChange={(val) => setActiveSubTab(val as typeof activeSubTab)}
        />

        <div className="flex items-center gap-2">
          {activeSubTab === 'roster' && (
            <AppleButton
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingEmployee(null);
                setIsEmployeeModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Employee
            </AppleButton>
          )}

          {activeSubTab === 'early_salary' && (
            <AppleButton
              variant="primary"
              size="sm"
              onClick={() => setIsEarlySalaryModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Request Early Salary
            </AppleButton>
          )}

          {activeSubTab === 'bonuses' && (
            <AppleButton
              variant="primary"
              size="sm"
              onClick={() => setIsBonusModalOpen(true)}
              icon={<Gift className="w-4 h-4" />}
            >
              Award Bonus
            </AppleButton>
          )}

          {activeSubTab === 'payroll' && (
            <AppleButton
              variant="primary"
              size="sm"
              onClick={() => {
                generateMonthlyPayroll(selectedMonth);
                alert(`Monthly Payroll for ${selectedMonth} processed and marked as Paid for all active employees!`);
              }}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Process All Salaries for {selectedMonth}
            </AppleButton>
          )}
        </div>
      </AppleCard>

      {/* SUBTAB 1: STAFF DIRECTORY */}
      {activeSubTab === 'roster' && (
        <AppleCard padding="none" className="overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-white/80 backdrop-blur-sm">
            <div>
              <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
                Employee Information & Staffing Directory ({filteredEmployees.length})
              </h3>
              <p className="text-xs text-[#8E8E93]">
                Manage seed breeders, lab geneticists, field managers, and farm workers
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#F9F9FB] text-[#8E8E93] font-semibold">
                  <th className="py-3 px-4">Employee Name & Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Employment Type</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Base Monthly Salary</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#F5F5F7]/80 transition-colors">
                    {/* Name & Role */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sm text-[#1C1C1E]">{emp.name}</div>
                      <div className="text-[11px] text-[#636366] font-medium mt-0.5">{emp.role}</div>
                      <div className="text-[10px] text-[#8E8E93]">Joined: {emp.joiningDate}</div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold text-[#1C1C1E]">{emp.department}</span>
                    </td>

                    {/* Employment Type */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-black/5 text-[11px] font-medium text-[#1C1C1E]">
                        {emp.employmentType}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-[#1C1C1E] flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#8E8E93]" />
                        <span>{emp.email}</span>
                      </div>
                      <div className="text-[11px] text-[#8E8E93] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#8E8E93]" />
                        <span>{emp.phone}</span>
                      </div>
                    </td>

                    {/* Salary */}
                    <td className="py-3.5 px-4">
                      <div className="text-sm font-bold text-[#007AFF]">
                        {formatTaka(emp.baseMonthlySalary)}
                      </div>
                      <div className="text-[10px] text-[#8E8E93]">
                        {emp.bankAccount}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={emp.status === 'Active' ? 'green' : emp.status === 'On Leave' ? 'orange' : 'red'}
                        size="sm"
                      >
                        {emp.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingEmployee(emp);
                            setIsEmployeeModalOpen(true);
                          }}
                          title="Edit Employee Information"
                          className="p-1.5 rounded-lg bg-black/5 text-[#636366] hover:bg-black/10 hover:text-[#1C1C1E] transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp)}
                          title="Delete Employee Record"
                          className="p-1.5 rounded-lg bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AppleCard>
      )}

      {/* SUBTAB 2: MONTHLY SALARY PROCESSOR */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-black/[0.06] shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#8E8E93] uppercase">Payroll Period:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 text-sm font-bold bg-[#F2F2F7] border border-black/[0.08] rounded-xl text-[#1C1C1E] cursor-pointer"
              />
            </div>
            <div className="text-right">
              <span className="text-xs text-[#8E8E93] block">Total Monthly Net Payroll</span>
              <span className="text-lg font-extrabold text-[#1C1C1E]">
                {formatTaka(totalPayrollNetForMonth)}
              </span>
            </div>
          </div>

          <AppleCard padding="none" className="overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-white/80 backdrop-blur-sm">
              <div>
                <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
                  Monthly Salary Breakdown for {selectedMonth}
                </h3>
                <p className="text-xs text-[#8E8E93]">
                  Formula: Base Monthly Salary + Bonuses - Early Salary Advances = Net Payable
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#F9F9FB] text-[#8E8E93] font-semibold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department & Role</th>
                    <th className="py-3 px-4 text-right">Base Salary (৳)</th>
                    <th className="py-3 px-4 text-right">Bonus (+)</th>
                    <th className="py-3 px-4 text-right">Early Advance (-)</th>
                    <th className="py-3 px-4 text-right">Net Payable (৳)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {currentMonthPayrollList.map((row) => (
                    <tr key={row.employee.id} className="hover:bg-[#F5F5F7]/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-sm text-[#1C1C1E]">
                        {row.employee.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#1C1C1E]">{row.employee.role}</div>
                        <div className="text-[10px] text-[#8E8E93]">{row.employee.department}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-[#1C1C1E]">
                        {formatTaka(row.baseSalary)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-[#34C759]">
                        {row.bonusAmount > 0 ? `+${formatTaka(row.bonusAmount)}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-[#FF9500]">
                        {row.earlySalaryDeduction > 0 ? `-${formatTaka(row.earlySalaryDeduction)}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-sm text-[#007AFF]">
                        {formatTaka(row.netSalary)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={row.paymentStatus === 'Paid' ? 'green' : 'orange'}
                          size="sm"
                        >
                          {row.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            const newSt = row.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
                            updateSalaryPaymentStatus(row.id, newSt);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-black/5 hover:bg-black/10 transition-colors cursor-pointer"
                        >
                          {row.paymentStatus === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AppleCard>
        </div>
      )}

      {/* SUBTAB 3: EARLY SALARY ADVANCES */}
      {activeSubTab === 'early_salary' && (
        <AppleCard padding="none" className="overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-white/80 backdrop-blur-sm">
            <div>
              <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
                Early Salary Advances & Mid-Month Withdrawals ({earlySalaryAdvances.length})
              </h3>
              <p className="text-xs text-[#8E8E93]">
                Tracks emergency salary requests and schedules automatic deductions from payroll
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#F9F9FB] text-[#8E8E93] font-semibold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Advance Amount</th>
                  <th className="py-3 px-4">Request Date</th>
                  <th className="py-3 px-4">Deduction Payroll Month</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4 text-right">Disbursement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {earlySalaryAdvances.map((adv) => (
                  <tr key={adv.id} className="hover:bg-[#F5F5F7]/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-sm text-[#1C1C1E]">
                      {adv.employeeName}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sm text-[#FF9500]">
                      {formatTaka(adv.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-[#636366]">
                      {adv.requestDate}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1C1C1E]">
                      {adv.deductInMonth}
                    </td>
                    <td className="py-3.5 px-4 text-[#636366]">
                      {adv.reason}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge variant={adv.status === 'Disbursed' ? 'green' : 'orange'} size="sm">
                        {adv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AppleCard>
      )}

      {/* SUBTAB 4: BONUSES & INCENTIVES */}
      {activeSubTab === 'bonuses' && (
        <AppleCard padding="none" className="overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-white/80 backdrop-blur-sm">
            <div>
              <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
                Bonus & Harvest Incentive Grants ({bonuses.length})
              </h3>
              <p className="text-xs text-[#8E8E93]">
                Award performance, harvest yield peaks, and sales targets
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#F9F9FB] text-[#8E8E93] font-semibold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Bonus Category</th>
                  <th className="py-3 px-4">Amount (৳)</th>
                  <th className="py-3 px-4">Award Date</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {bonuses.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F5F5F7]/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-sm text-[#1C1C1E]">
                      {b.employeeName}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="purple" size="sm">
                        {b.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sm text-[#34C759]">
                      +{formatTaka(b.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-[#636366]">
                      {b.date}
                    </td>
                    <td className="py-3.5 px-4 text-[#636366]">
                      {b.reason}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge variant={b.status === 'Paid' ? 'green' : 'blue'} size="sm">
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AppleCard>
      )}

      {/* SUBTAB 5: MONTHLY & YEARLY REPORTS */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          {/* Monthly Report Generator Section */}
          <AppleCard padding="lg" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-black/[0.06]">
              <div>
                <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
                  Monthly Payroll & Compensation Report
                </h3>
                <p className="text-xs text-[#8E8E93]">
                  Consolidated monthly disbursement including salaries, bonuses, and advance reconciliations
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-[#F2F2F7] border border-black/[0.08] rounded-xl text-[#1C1C1E]"
                />
                <AppleButton
                  variant="primary"
                  size="sm"
                  onClick={handleExportPayrollReport}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Export Monthly CSV
                </AppleButton>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#F9F9FB] rounded-xl">
                <span className="text-[#8E8E93]">Staff Count:</span>
                <p className="font-bold text-sm text-[#1C1C1E] mt-0.5">{currentMonthPayrollList.length} Active</p>
              </div>
              <div className="p-3 bg-[#F9F9FB] rounded-xl">
                <span className="text-[#8E8E93]">Base Wages:</span>
                <p className="font-bold text-sm text-[#1C1C1E] mt-0.5">{formatTaka(totalMonthlyBasePayroll)}</p>
              </div>
              <div className="p-3 bg-[#F9F9FB] rounded-xl">
                <span className="text-[#8E8E93]">Incentive Bonuses:</span>
                <p className="font-bold text-sm text-[#34C759] mt-0.5">+{formatTaka(totalBonusesThisMonth)}</p>
              </div>
              <div className="p-3 bg-[#F9F9FB] rounded-xl">
                <span className="text-[#8E8E93]">Net Total Disbursed:</span>
                <p className="font-bold text-sm text-[#007AFF] mt-0.5">{formatTaka(totalPayrollNetForMonth)}</p>
              </div>
            </div>
          </AppleCard>

          {/* Yearly Report Generator Section */}
          <AppleCard padding="lg" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-black/[0.06]">
              <div>
                <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
                  Yearly Staff Compensation & Payroll Summary
                </h3>
                <p className="text-xs text-[#8E8E93]">
                  Cumulative annual compensation, tax reporting base, and bonus totals
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-[#F2F2F7] border border-black/[0.08] rounded-xl text-[#1C1C1E]"
                >
                  <option value="2026">Fiscal Year 2026</option>
                  <option value="2025">Fiscal Year 2025</option>
                </select>
                <AppleButton
                  variant="primary"
                  size="sm"
                  onClick={handleExportYearlyReport}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Export Annual CSV
                </AppleButton>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#F9F9FB] text-[#8E8E93] font-semibold">
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-right">Months Paid</th>
                    <th className="py-2.5 px-3 text-right">Annual Bonuses (৳)</th>
                    <th className="py-2.5 px-3 text-right">Annual Advances (৳)</th>
                    <th className="py-2.5 px-3 text-right">Cumulative Net Pay (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {yearlyRecords.map((r) => (
                    <tr key={r.employee.id} className="hover:bg-[#F5F5F7]/80">
                      <td className="py-3 px-3 font-bold text-sm text-[#1C1C1E]">{r.employee.name}</td>
                      <td className="py-3 px-3 text-[#636366]">{r.employee.department}</td>
                      <td className="py-3 px-3 text-right font-medium">{r.monthsCount} mos</td>
                      <td className="py-3 px-3 text-right font-medium text-[#34C759]">{formatTaka(r.totalBonus)}</td>
                      <td className="py-3 px-3 text-right font-medium text-[#FF9500]">{formatTaka(r.totalAdvances)}</td>
                      <td className="py-3 px-3 text-right font-bold text-sm text-[#007AFF]">
                        {formatTaka(r.totalPaid)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AppleCard>
        </div>
      )}

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
        initialEmployee={editingEmployee}
      />

      {/* Early Salary Modal */}
      <EarlySalaryModal
        isOpen={isEarlySalaryModalOpen}
        onClose={() => setIsEarlySalaryModalOpen(false)}
        employees={employees.filter(e => e.status === 'Active')}
        onAddAdvance={addEarlySalaryAdvance}
      />

      {/* Bonus Modal */}
      <BonusModal
        isOpen={isBonusModalOpen}
        onClose={() => setIsBonusModalOpen(false)}
        employees={employees.filter(e => e.status === 'Active')}
        onAddBonus={addBonus}
      />
    </div>
  );
};
