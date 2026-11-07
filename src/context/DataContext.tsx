import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  SeedProduct, 
  CustomerLead, 
  InvoiceDetails, 
  Employee, 
  SalaryPayment, 
  EarlySalaryAdvance, 
  BonusRecord, 
  CompanyProfile, 
  StockAdjustment
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_INVOICES, 
  INITIAL_EMPLOYEES, 
  INITIAL_SALARY_PAYMENTS, 
  INITIAL_EARLY_SALARIES, 
  INITIAL_BONUSES, 
  INITIAL_STOCK_ADJUSTMENTS,
  DEFAULT_COMPANY
} from '../mockData';

export interface DatabaseStatus {
  connected: boolean;
  dbType: string;
  dbName: string;
  lastSyncedAt?: string;
  errorMessage?: string;
}

interface DataContextType {
  // Products
  products: SeedProduct[];
  addProduct: (product: Omit<SeedProduct, 'id' | 'createdAt' | 'updatedAt'>) => SeedProduct;
  updateProduct: (id: string, updates: Partial<SeedProduct>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, quantityDelta: number, reason: string, type: StockAdjustment['type'], adjustedBy: string) => boolean;
  stockAdjustments: StockAdjustment[];

  // Customers & Leads
  customers: CustomerLead[];
  addCustomer: (customer: Omit<CustomerLead, 'id' | 'createdAt' | 'totalOrdersCount' | 'totalSpent'>) => CustomerLead;
  updateCustomer: (id: string, updates: Partial<CustomerLead>) => void;
  deleteCustomer: (id: string) => void;

  // Invoices & Sales
  invoices: InvoiceDetails[];
  createSaleInvoice: (invoiceData: Omit<InvoiceDetails, 'id' | 'createdAt'>) => { success: boolean; invoice?: InvoiceDetails; error?: string };
  updateInvoiceStatus: (id: string, status: InvoiceDetails['paymentStatus'], paidAmount?: number) => void;
  deleteInvoice: (id: string) => void;

  // Employees & Payroll
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Salary & Compensation
  salaryPayments: SalaryPayment[];
  earlySalaryAdvances: EarlySalaryAdvance[];
  bonuses: BonusRecord[];
  addEarlySalaryAdvance: (advance: Omit<EarlySalaryAdvance, 'id'>) => void;
  updateEarlySalaryStatus: (id: string, status: EarlySalaryAdvance['status'], disbursedDate?: string) => void;
  addBonus: (bonus: Omit<BonusRecord, 'id'>) => void;
  generateMonthlyPayroll: (monthYear: string) => void;
  updateSalaryPaymentStatus: (id: string, status: SalaryPayment['status']) => void;

  // Company Profile
  company: CompanyProfile;
  updateCompany: (updates: Partial<CompanyProfile>) => void;

  // Neon PostgreSQL Database State & Sync
  dbStatus: DatabaseStatus;
  isSyncing: boolean;
  refreshFromDb: () => Promise<void>;
  resetToDefaultData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'seed_agro_crm_real_catalog_v2';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<SeedProduct[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_adjustments`);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_ADJUSTMENTS;
  });

  const [customers, setCustomers] = useState<CustomerLead[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [invoices, setInvoices] = useState<InvoiceDetails[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_employees`);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_salaries`);
    return saved ? JSON.parse(saved) : INITIAL_SALARY_PAYMENTS;
  });

  const [earlySalaryAdvances, setEarlySalaryAdvances] = useState<EarlySalaryAdvance[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_early_salaries`);
    return saved ? JSON.parse(saved) : INITIAL_EARLY_SALARIES;
  });

  const [bonuses, setBonuses] = useState<BonusRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_bonuses`);
    return saved ? JSON.parse(saved) : INITIAL_BONUSES;
  });

  const [company, setCompany] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_company`);
    return saved ? JSON.parse(saved) : DEFAULT_COMPANY;
  });

  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    connected: false,
    dbType: 'Neon PostgreSQL',
    dbName: 'neondb'
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync with Neon Backend API
  const refreshFromDb = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync');
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        if (data.data.products?.length) setProducts(data.data.products);
        if (data.data.stockAdjustments) setStockAdjustments(data.data.stockAdjustments);
        if (data.data.customers?.length) setCustomers(data.data.customers);
        if (data.data.invoices?.length) setInvoices(data.data.invoices);
        if (data.data.employees?.length) setEmployees(data.data.employees);
        if (data.data.salaryPayments?.length) setSalaryPayments(data.data.salaryPayments);
        if (data.data.earlySalaryAdvances?.length) setEarlySalaryAdvances(data.data.earlySalaryAdvances);
        if (data.data.bonuses?.length) setBonuses(data.data.bonuses);
        if (data.data.company) setCompany(data.data.company);

        setDbStatus({
          connected: true,
          dbType: 'Neon PostgreSQL',
          dbName: 'neondb (aws:us-east-2)',
          lastSyncedAt: new Date().toLocaleTimeString()
        });
      }
    } catch (err: any) {
      console.warn('[DataContext] Neon DB sync notice:', err.message);
      setDbStatus(prev => ({
        ...prev,
        connected: false,
        errorMessage: err.message
      }));
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial load from Neon
  useEffect(() => {
    refreshFromDb();
  }, [refreshFromDb]);

  // Sync to local storage for offline resilience
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_adjustments`, JSON.stringify(stockAdjustments));
  }, [stockAdjustments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_employees`, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_salaries`, JSON.stringify(salaryPayments));
  }, [salaryPayments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_early_salaries`, JSON.stringify(earlySalaryAdvances));
  }, [earlySalaryAdvances]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_bonuses`, JSON.stringify(bonuses));
  }, [bonuses]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_company`, JSON.stringify(company));
  }, [company]);

  // Product CRUD
  const addProduct = (productData: Omit<SeedProduct, 'id' | 'createdAt' | 'updatedAt'>): SeedProduct => {
    const now = new Date().toISOString().split('T')[0];
    const newProduct: SeedProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    setProducts(prev => [newProduct, ...prev]);

    if (productData.stockQuantity > 0) {
      const adjustment: StockAdjustment = {
        id: `adj-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        subProductName: newProduct.subProductName,
        type: productData.type === 'imported' ? 'import_arrival' : 'harvest_yield',
        quantity: productData.stockQuantity,
        previousStock: 0,
        newStock: productData.stockQuantity,
        reason: 'Initial seed batch inventory registration',
        date: now,
        adjustedBy: 'Inventory Admin'
      };
      setStockAdjustments(prev => [adjustment, ...prev]);
    }

    // Persist to Neon DB
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    }).catch(err => console.error('[Neon DB Error]:', err));

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<SeedProduct>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));

    // Persist to Neon DB
    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(err => console.error('[Neon DB Error]:', err));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));

    // Persist to Neon DB
    fetch(`/api/products/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('[Neon DB Error]:', err));
  };

  const adjustStock = (productId: string, quantityDelta: number, reason: string, type: StockAdjustment['type'], adjustedBy: string): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    const previousStock = product.stockQuantity;
    const newStock = Math.max(0, previousStock + quantityDelta);

    updateProduct(productId, { stockQuantity: newStock });

    const adjustment: StockAdjustment = {
      id: `adj-${Date.now()}`,
      productId,
      productName: product.name,
      subProductName: product.subProductName,
      type,
      quantity: Math.abs(quantityDelta),
      previousStock,
      newStock,
      reason,
      date: new Date().toISOString().split('T')[0],
      adjustedBy: adjustedBy || 'Warehouse Manager'
    };

    setStockAdjustments(prev => [adjustment, ...prev]);

    // Persist to Neon DB
    fetch(`/api/products/${productId}/adjust-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantityDelta, reason, type, adjustedBy })
    }).catch(err => console.error('[Neon DB Error]:', err));

    return true;
  };

  // Customer CRUD
  const addCustomer = (customerData: Omit<CustomerLead, 'id' | 'createdAt' | 'totalOrdersCount' | 'totalSpent'>): CustomerLead => {
    const newCustomer: CustomerLead = {
      ...customerData,
      id: `cust-${Date.now()}`,
      totalOrdersCount: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCustomer, ...prev]);

    // Persist to Neon DB
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    }).catch(err => console.error('[Neon DB Error]:', err));

    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<CustomerLead>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    // Persist to Neon DB
    fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(err => console.error('[Neon DB Error]:', err));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));

    // Persist to Neon DB
    fetch(`/api/customers/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('[Neon DB Error]:', err));
  };

  // Sales & Invoices
  const createSaleInvoice = (invoiceData: Omit<InvoiceDetails, 'id' | 'createdAt'>) => {
    // Validate stock for all items
    for (const item of invoiceData.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return { success: false, error: `Product not found: ${item.productName}` };
      }
      if (product.stockQuantity < item.quantity) {
        return { 
          success: false, 
          error: `Insufficient stock for "${product.name} (${product.subProductName})". Requested: ${item.quantity} ${item.unit}, Available: ${product.stockQuantity} ${item.unit}` 
        };
      }
    }

    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // Deduct stock
    invoiceData.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const prevStock = prod.stockQuantity;
        const newStock = prevStock - item.quantity;
        
        setProducts(curr => curr.map(p => p.id === prod.id ? { ...p, stockQuantity: newStock, updatedAt: today } : p));

        const adjustment: StockAdjustment = {
          id: `adj-sale-${Date.now()}-${item.productId}`,
          productId: prod.id,
          productName: prod.name,
          subProductName: prod.subProductName,
          type: 'stock_out',
          quantity: item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          reason: `Sale Invoice #${invoiceData.invoiceNumber} to ${invoiceData.customerName}`,
          date: today,
          adjustedBy: invoiceData.salesperson || 'Sales Desk'
        };
        setStockAdjustments(prev => [adjustment, ...prev]);
      }
    });

    // Create Invoice
    const newInvoice: InvoiceDetails = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      createdAt: now
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Update Customer stats
    setCustomers(prev => prev.map(c => {
      if (c.id === invoiceData.customerId) {
        return {
          ...c,
          totalOrdersCount: c.totalOrdersCount + 1,
          totalSpent: c.totalSpent + invoiceData.total,
          leadStatus: 'Active Customer'
        };
      }
      return c;
    }));

    // Persist to Neon DB
    fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInvoice)
    }).catch(err => console.error('[Neon DB Error]:', err));

    return { success: true, invoice: newInvoice };
  };

  const updateInvoiceStatus = (id: string, status: InvoiceDetails['paymentStatus'], paidAmount?: number) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const newPaid = paidAmount !== undefined ? paidAmount : (status === 'Paid' ? inv.total : inv.paidAmount);
        return {
          ...inv,
          paymentStatus: status,
          paidAmount: newPaid
        };
      }
      return inv;
    }));

    // Persist to Neon DB
    fetch(`/api/invoices/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paidAmount })
    }).catch(err => console.error('[Neon DB Error]:', err));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));

    // Persist to Neon DB
    fetch(`/api/invoices/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('[Neon DB Error]:', err));
  };

  // Employee CRUD
  const addEmployee = (empData: Omit<Employee, 'id'>): Employee => {
    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600', 'bg-teal-600', 'bg-indigo-600'];
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      avatarColor: colors[Math.floor(Math.random() * colors.length)]
    };
    setEmployees(prev => [newEmp, ...prev]);

    // Persist to Neon DB
    fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmp)
    }).catch(err => console.error('[Neon DB Error]:', err));

    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));

    // Persist to Neon DB
    fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(err => console.error('[Neon DB Error]:', err));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));

    // Persist to Neon DB
    fetch(`/api/employees/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('[Neon DB Error]:', err));
  };

  // Early Salary & Bonus
  const addEarlySalaryAdvance = (advData: Omit<EarlySalaryAdvance, 'id'>) => {
    const newAdv: EarlySalaryAdvance = {
      ...advData,
      id: `adv-${Date.now()}`
    };
    setEarlySalaryAdvances(prev => [newAdv, ...prev]);

    // Persist to Neon DB
    fetch('/api/early-salary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAdv)
    }).catch(err => console.error('[Neon DB Error]:', err));
  };

  const updateEarlySalaryStatus = (id: string, status: EarlySalaryAdvance['status'], disbursedDate?: string) => {
    setEarlySalaryAdvances(prev => prev.map(a => a.id === id ? {
      ...a,
      status,
      disbursedDate: disbursedDate || a.disbursedDate || (status === 'Disbursed' ? new Date().toISOString().split('T')[0] : undefined)
    } : a));

    // Persist to Neon DB
    fetch(`/api/early-salary/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, disbursedDate })
    }).catch(err => console.error('[Neon DB Error]:', err));
  };

  const addBonus = (bonusData: Omit<BonusRecord, 'id'>) => {
    const newBonus: BonusRecord = {
      ...bonusData,
      id: `bon-${Date.now()}`
    };
    setBonuses(prev => [newBonus, ...prev]);

    // Persist to Neon DB
    fetch('/api/bonuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBonus)
    }).catch(err => console.error('[Neon DB Error]:', err));
  };

  // Payroll
  const generateMonthlyPayroll = (monthYear: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newPayments: SalaryPayment[] = employees.filter(e => e.status === 'Active').map(emp => {
      const advances = earlySalaryAdvances.filter(a => 
        a.employeeId === emp.id && 
        a.deductInMonth === monthYear && 
        (a.status === 'Disbursed' || a.status === 'Approved')
      );
      const totalAdvance = advances.reduce((sum, a) => sum + a.amount, 0);

      const empBonuses = bonuses.filter(b => 
        b.employeeId === emp.id && 
        b.date.startsWith(monthYear)
      );
      const totalBonus = empBonuses.reduce((sum, b) => sum + b.amount, 0);
      const bonusReason = empBonuses.map(b => b.reason).join('; ') || undefined;

      const deductions = Math.round(emp.baseMonthlySalary * 0.05);
      const netSalary = Math.max(0, emp.baseMonthlySalary + totalBonus - totalAdvance - deductions);

      return {
        id: `sal-${monthYear}-${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        monthYear,
        baseSalary: emp.baseMonthlySalary,
        earlySalaryAdvance: totalAdvance,
        bonusAmount: totalBonus,
        bonusReason,
        deductions,
        netSalary,
        paymentDate: today,
        status: 'Processing',
        paymentMethod: 'Direct Bank Transfer'
      };
    });

    setSalaryPayments(prev => {
      const filtered = prev.filter(p => p.monthYear !== monthYear);
      return [...newPayments, ...filtered];
    });
  };

  const updateSalaryPaymentStatus = (id: string, status: SalaryPayment['status']) => {
    setSalaryPayments(prev => prev.map(s => s.id === id ? { ...s, status } : s));

    fetch(`/api/payroll/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(err => console.error('[Neon DB Error]:', err));
  };

  const updateCompany = (updates: Partial<CompanyProfile>) => {
    setCompany(prev => ({ ...prev, ...updates }));

    fetch('/api/company', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(err => console.error('[Neon DB Error]:', err));
  };

  const resetToDefaultData = async () => {
    try {
      await fetch('/api/reset-data', { method: 'POST' });
    } catch (e) {
      console.warn('Backend reset call:', e);
    }
    setProducts(INITIAL_PRODUCTS);
    setStockAdjustments(INITIAL_STOCK_ADJUSTMENTS);
    setCustomers(INITIAL_CUSTOMERS);
    setInvoices(INITIAL_INVOICES);
    setEmployees(INITIAL_EMPLOYEES);
    setSalaryPayments(INITIAL_SALARY_PAYMENTS);
    setEarlySalaryAdvances(INITIAL_EARLY_SALARIES);
    setBonuses(INITIAL_BONUSES);
    setCompany(DEFAULT_COMPANY);
  };

  return (
    <DataContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      stockAdjustments,
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      invoices,
      createSaleInvoice,
      updateInvoiceStatus,
      deleteInvoice,
      employees,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      salaryPayments,
      earlySalaryAdvances,
      bonuses,
      addEarlySalaryAdvance,
      updateEarlySalaryStatus,
      addBonus,
      generateMonthlyPayroll,
      updateSalaryPaymentStatus,
      company,
      updateCompany,
      dbStatus,
      isSyncing,
      refreshFromDb,
      resetToDefaultData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
