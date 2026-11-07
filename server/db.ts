import pg from 'pg';
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
} from '../src/mockData';

const { Pool } = pg;

const NEON_DEFAULT_URL = "postgresql://neondb_owner:npg_rFcAe69SMGpI@ep-muddy-morning-a5nat1k9-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const DATABASE_URL = process.env.DATABASE_URL || NEON_DEFAULT_URL;

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function initDatabase() {
  console.log('[Neon PostgreSQL] Connecting to database...');
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT NOW() as db_time, current_database() as db_name');
    console.log(`[Neon PostgreSQL] Connected successfully to "${res.rows[0].db_name}" at ${res.rows[0].db_time}`);

    // Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sub_product_name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        origin_or_supplier VARCHAR(255) NOT NULL,
        batch_number VARCHAR(100) NOT NULL,
        stock_quantity NUMERIC NOT NULL DEFAULT 0,
        unit VARCHAR(50) NOT NULL DEFAULT 'kg',
        cost_price NUMERIC NOT NULL DEFAULT 0,
        selling_price NUMERIC NOT NULL DEFAULT 0,
        germination_rate NUMERIC NOT NULL DEFAULT 0,
        purity_rate NUMERIC NOT NULL DEFAULT 0,
        min_stock_alert NUMERIC NOT NULL DEFAULT 100,
        expiry_date VARCHAR(50) NOT NULL,
        production_date VARCHAR(50),
        import_date VARCHAR(50),
        description TEXT,
        created_at VARCHAR(50),
        updated_at VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS stock_adjustments (
        id VARCHAR(64) PRIMARY KEY,
        product_id VARCHAR(64) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        sub_product_name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        quantity NUMERIC NOT NULL DEFAULT 0,
        previous_stock NUMERIC NOT NULL DEFAULT 0,
        new_stock NUMERIC NOT NULL DEFAULT 0,
        reason TEXT,
        date VARCHAR(50) NOT NULL,
        adjusted_by VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(50),
        customer_type VARCHAR(100) NOT NULL,
        lead_status VARCHAR(100) NOT NULL,
        total_orders_count INTEGER NOT NULL DEFAULT 0,
        total_spent NUMERIC NOT NULL DEFAULT 0,
        notes TEXT,
        created_at VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(64) PRIMARY KEY,
        invoice_number VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        due_date VARCHAR(50) NOT NULL,
        customer_id VARCHAR(64),
        customer_name VARCHAR(255) NOT NULL,
        customer_company VARCHAR(255),
        customer_address TEXT,
        customer_city_state_zip VARCHAR(255),
        customer_phone VARCHAR(50),
        ship_to_name VARCHAR(255),
        ship_to_company VARCHAR(255),
        ship_to_address TEXT,
        ship_to_city_state_zip VARCHAR(255),
        ship_to_phone VARCHAR(50),
        salesperson VARCHAR(100),
        ship_via VARCHAR(100),
        ship_date VARCHAR(50),
        terms VARCHAR(100),
        items_json JSONB NOT NULL DEFAULT '[]',
        subtotal NUMERIC NOT NULL DEFAULT 0,
        tax_rate NUMERIC NOT NULL DEFAULT 0,
        sales_tax NUMERIC NOT NULL DEFAULT 0,
        shipping_handling NUMERIC NOT NULL DEFAULT 0,
        discount NUMERIC NOT NULL DEFAULT 0,
        total NUMERIC NOT NULL DEFAULT 0,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        paid_amount NUMERIC NOT NULL DEFAULT 0,
        notes TEXT,
        created_at VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        department VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        joining_date VARCHAR(50),
        employment_type VARCHAR(50),
        base_monthly_salary NUMERIC NOT NULL DEFAULT 0,
        bank_account VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'Active',
        avatar_color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS salary_payments (
        id VARCHAR(64) PRIMARY KEY,
        employee_id VARCHAR(64) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        department VARCHAR(100) NOT NULL,
        month_year VARCHAR(50) NOT NULL,
        base_salary NUMERIC NOT NULL DEFAULT 0,
        early_salary_advance NUMERIC NOT NULL DEFAULT 0,
        bonus_amount NUMERIC NOT NULL DEFAULT 0,
        bonus_reason TEXT,
        deductions NUMERIC NOT NULL DEFAULT 0,
        net_salary NUMERIC NOT NULL DEFAULT 0,
        payment_date VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'Processing',
        payment_method VARCHAR(100),
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS early_salary_advances (
        id VARCHAR(64) PRIMARY KEY,
        employee_id VARCHAR(64) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        amount NUMERIC NOT NULL DEFAULT 0,
        request_date VARCHAR(50),
        disbursed_date VARCHAR(50),
        deduct_in_month VARCHAR(50) NOT NULL,
        reason TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending'
      );

      CREATE TABLE IF NOT EXISTS bonuses (
        id VARCHAR(64) PRIMARY KEY,
        employee_id VARCHAR(64) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        amount NUMERIC NOT NULL DEFAULT 0,
        date VARCHAR(50) NOT NULL,
        type VARCHAR(100) NOT NULL,
        reason TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Approved'
      );

      CREATE TABLE IF NOT EXISTS company_profile (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tagline VARCHAR(255),
        street_address TEXT,
        city_state_zip VARCHAR(255),
        phone VARCHAR(50),
        fax VARCHAR(50),
        email VARCHAR(255),
        website VARCHAR(255),
        tax_id VARCHAR(100),
        bank_name VARCHAR(255),
        bank_account VARCHAR(255),
        routing_number VARCHAR(100)
      );
    `);

    // Check if initial seeding is needed or old mock data needs replacement
    const countCheck = await client.query('SELECT COUNT(*) as count FROM products');
    const oldMockCheck = await client.query("SELECT COUNT(*) as count FROM products WHERE id LIKE 'prod-%'");
    
    if (parseInt(countCheck.rows[0].count, 10) === 0 || parseInt(oldMockCheck.rows[0].count, 10) > 0) {
      console.log('[Neon PostgreSQL] Populating real seed catalog records in database...');
      await seedDatabase(client);
    } else {
      console.log(`[Neon PostgreSQL] Database populated with ${countCheck.rows[0].count} real seed products.`);
    }

  } finally {
    client.release();
  }
}

export async function seedDatabase(client?: pg.PoolClient) {
  const c = client || (await pool.connect());
  const release = !client;
  try {
    // Clear existing
    await c.query('TRUNCATE products, stock_adjustments, customers, invoices, employees, salary_payments, early_salary_advances, bonuses, company_profile CASCADE;');

    // Insert Products
    for (const p of INITIAL_PRODUCTS) {
      await c.query(`
        INSERT INTO products (
          id, name, sub_product_name, type, category, origin_or_supplier, batch_number,
          stock_quantity, unit, cost_price, selling_price, germination_rate, purity_rate,
          min_stock_alert, expiry_date, production_date, import_date, description, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      `, [
        p.id, p.name, p.subProductName, p.type, p.category, p.originOrSupplier, p.batchNumber,
        p.stockQuantity, p.unit, p.costPrice, p.sellingPrice, p.germinationRate, p.purityRate,
        p.minStockAlert, p.expiryDate, p.productionDate || null, p.importDate || null, p.description || null,
        p.createdAt, p.updatedAt
      ]);
    }

    // Insert Stock Adjustments
    for (const a of INITIAL_STOCK_ADJUSTMENTS) {
      await c.query(`
        INSERT INTO stock_adjustments (
          id, product_id, product_name, sub_product_name, type, quantity, previous_stock, new_stock, reason, date, adjusted_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        a.id, a.productId, a.productName, a.subProductName, a.type, a.quantity, a.previousStock, a.newStock, a.reason, a.date, a.adjustedBy
      ]);
    }

    // Insert Customers
    for (const cust of INITIAL_CUSTOMERS) {
      await c.query(`
        INSERT INTO customers (
          id, name, company_name, phone, email, address, city, state, zip_code, customer_type, lead_status, total_orders_count, total_spent, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        cust.id, cust.name, cust.companyName, cust.phone, cust.email, cust.address, cust.city, cust.state, cust.zipCode,
        cust.customerType, cust.leadStatus, cust.totalOrdersCount, cust.totalSpent, cust.notes || null, cust.createdAt
      ]);
    }

    // Insert Invoices
    for (const inv of INITIAL_INVOICES) {
      await c.query(`
        INSERT INTO invoices (
          id, invoice_number, date, due_date, customer_id, customer_name, customer_company, customer_address, customer_city_state_zip,
          customer_phone, ship_to_name, ship_to_company, ship_to_address, ship_to_city_state_zip, ship_to_phone, salesperson,
          ship_via, ship_date, terms, items_json, subtotal, tax_rate, sales_tax, shipping_handling, discount, total, payment_status,
          paid_amount, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
      `, [
        inv.id, inv.invoiceNumber, inv.date, inv.dueDate, inv.customerId, inv.customerName, inv.customerCompany, inv.customerAddress,
        inv.customerCityStateZip, inv.customerPhone, inv.shipToName || null, inv.shipToCompany || null, inv.shipToAddress || null,
        inv.shipToCityStateZip || null, inv.shipToPhone || null, inv.salesperson, inv.shipVia, inv.shipDate, inv.terms,
        JSON.stringify(inv.items), inv.subtotal, inv.taxRate, inv.salesTax, inv.shippingHandling, inv.discount, inv.total,
        inv.paymentStatus, inv.paidAmount, inv.notes || null, inv.createdAt
      ]);
    }

    // Insert Employees
    for (const emp of INITIAL_EMPLOYEES) {
      await c.query(`
        INSERT INTO employees (
          id, name, role, department, email, phone, address, joining_date, employment_type, base_monthly_salary, bank_account, status, avatar_color
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        emp.id, emp.name, emp.role, emp.department, emp.email, emp.phone, emp.address, emp.joiningDate, emp.employmentType,
        emp.baseMonthlySalary, emp.bankAccount, emp.status, emp.avatarColor || 'bg-blue-600'
      ]);
    }

    // Insert Salary Payments
    for (const sal of INITIAL_SALARY_PAYMENTS) {
      await c.query(`
        INSERT INTO salary_payments (
          id, employee_id, employee_name, department, month_year, base_salary, early_salary_advance, bonus_amount, bonus_reason,
          deductions, net_salary, payment_date, status, payment_method, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        sal.id, sal.employeeId, sal.employeeName, sal.department, sal.monthYear, sal.baseSalary, sal.earlySalaryAdvance,
        sal.bonusAmount, sal.bonusReason || null, sal.deductions, sal.netSalary, sal.paymentDate, sal.status, sal.paymentMethod, sal.notes || null
      ]);
    }

    // Insert Early Salaries
    for (const adv of INITIAL_EARLY_SALARIES) {
      await c.query(`
        INSERT INTO early_salary_advances (
          id, employee_id, employee_name, amount, request_date, disbursed_date, deduct_in_month, reason, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        adv.id, adv.employeeId, adv.employeeName, adv.amount, adv.requestDate, adv.disbursedDate || null, adv.deductInMonth, adv.reason, adv.status
      ]);
    }

    // Insert Bonuses
    for (const bon of INITIAL_BONUSES) {
      await c.query(`
        INSERT INTO bonuses (
          id, employee_id, employee_name, amount, date, type, reason, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        bon.id, bon.employeeId, bon.employeeName, bon.amount, bon.date, bon.type, bon.reason, bon.status
      ]);
    }

    // Insert Company
    await c.query(`
      INSERT INTO company_profile (
        id, name, tagline, street_address, city_state_zip, phone, fax, email, website, tax_id, bank_name, bank_account, routing_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      'company-main', DEFAULT_COMPANY.name, DEFAULT_COMPANY.tagline, DEFAULT_COMPANY.streetAddress, DEFAULT_COMPANY.cityStateZip,
      DEFAULT_COMPANY.phone, DEFAULT_COMPANY.fax, DEFAULT_COMPANY.email, DEFAULT_COMPANY.website, DEFAULT_COMPANY.taxId,
      DEFAULT_COMPANY.bankName, DEFAULT_COMPANY.bankAccount, DEFAULT_COMPANY.routingNumber
    ]);

    console.log('[Neon PostgreSQL] Seeding completed successfully.');
  } finally {
    if (release) c.release();
  }
}
