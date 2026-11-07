export type ProductOriginType = 'imported' | 'own_production';

export type ProductCategory = 
  | 'Vegetable Seeds' 
  | 'Grain & Cereal' 
  | 'Fruit Seeds' 
  | 'Flower Seeds' 
  | 'Legumes & Pulses' 
  | 'Oilseeds & Spices'
  | string;

export interface SeedProduct {
  id: string;
  name: string; // Product Name (e.g. Hybrid Tomato, Golden Corn)
  subProductName: string; // Sub-product / Variety (e.g. F1-Apex, Super 99)
  type: ProductOriginType; // imported or own_production
  category: ProductCategory;
  originOrSupplier: string; // e.g. "Royal Sluis (Netherlands)" or "Block 4 Research Farm"
  batchNumber: string;
  stockQuantity: number;
  unit: 'kg' | 'packet' | 'bag' | 'metric_ton' | 'gram';
  costPrice: number;
  sellingPrice: number;
  germinationRate: number; // Percentage e.g. 96
  purityRate: number; // Percentage e.g. 99.5
  minStockAlert: number;
  expiryDate: string;
  productionDate?: string;
  importDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  subProductName: string;
  type: 'stock_in' | 'stock_out' | 'damaged' | 'harvest_yield' | 'import_arrival' | 'correction';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  date: string;
  adjustedBy: string;
}

export type CustomerType = 'Wholesale Dealer' | 'Retail Dealer' | 'Commercial Farm' | 'Individual Farmer' | 'Prospect Lead';
export type LeadStatus = 'New Lead' | 'Contacted' | 'Quotation Sent' | 'Active Customer' | 'Inactive';

export interface CustomerLead {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  customerType: CustomerType;
  leadStatus: LeadStatus;
  totalOrdersCount: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  subProductName: string;
  productType: ProductOriginType;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoiceDetails {
  id: string;
  invoiceNumber: string; // e.g. "INV-100"
  date: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerAddress: string;
  customerCityStateZip: string;
  customerPhone: string;
  shipToName?: string;
  shipToCompany?: string;
  shipToAddress?: string;
  shipToCityStateZip?: string;
  shipToPhone?: string;
  salesperson: string;
  shipVia: string;
  shipDate: string;
  terms: string; // e.g. "Net 30", "Net 15", "Due on Receipt", "Cash on Delivery"
  items: SaleItem[];
  subtotal: number;
  taxRate: number; // e.g. 6.5
  salesTax: number;
  shippingHandling: number;
  discount: number;
  total: number;
  paymentStatus: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  paidAmount: number;
  notes?: string;
  createdAt: string;
}

export type DepartmentType = 'Production & Farm' | 'R&D & Quality' | 'Sales & Marketing' | 'Warehouse & Logistics' | 'Administration & Finance';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Seasonal Contract';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: DepartmentType;
  email: string;
  phone: string;
  address: string;
  joiningDate: string;
  employmentType: EmploymentType;
  baseMonthlySalary: number;
  bankAccount: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  avatarColor?: string;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: DepartmentType;
  monthYear: string; // e.g. "2026-08"
  baseSalary: number;
  earlySalaryAdvance: number;
  bonusAmount: number;
  bonusReason?: string;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  status: 'Paid' | 'Pending' | 'Processing';
  paymentMethod: 'Direct Bank Transfer' | 'Check' | 'Cash';
  notes?: string;
}

export interface EarlySalaryAdvance {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  requestDate: string;
  disbursedDate?: string;
  deductInMonth: string; // e.g. "2026-08"
  reason: string;
  status: 'Pending' | 'Approved' | 'Disbursed' | 'Settled';
}

export interface BonusRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  type: 'Harvest Season' | 'Performance' | 'Annual Festival' | 'Target Achievement' | 'Special';
  reason: string;
  status: 'Approved' | 'Paid';
}

export interface CompanyProfile {
  name: string;
  tagline: string;
  streetAddress: string;
  cityStateZip: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
  taxId: string;
  bankName: string;
  bankAccount: string;
  routingNumber: string;
}
