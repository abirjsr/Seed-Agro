import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, initDatabase, seedDatabase } from './server/db';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as db_time, current_database() as db_name, version() as version');
    res.json({
      status: 'ok',
      database: 'Neon PostgreSQL (Connected)',
      dbName: result.rows[0].db_name,
      time: result.rows[0].db_time,
      version: result.rows[0].version
    });
  } catch (error: any) {
    console.error('[Health Check Error]:', error);
    res.status(500).json({
      status: 'error',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Full Sync endpoint (fetches all entities)
app.get('/api/sync', async (req, res) => {
  try {
    const [
      productsRes,
      adjustmentsRes,
      customersRes,
      invoicesRes,
      employeesRes,
      salariesRes,
      earlySalaryRes,
      bonusesRes,
      companyRes
    ] = await Promise.all([
      pool.query('SELECT * FROM products ORDER BY created_at DESC'),
      pool.query('SELECT * FROM stock_adjustments ORDER BY created_at DESC'),
      pool.query('SELECT * FROM customers ORDER BY created_at DESC'),
      pool.query('SELECT * FROM invoices ORDER BY created_at DESC'),
      pool.query('SELECT * FROM employees ORDER BY created_at DESC'),
      pool.query('SELECT * FROM salary_payments ORDER BY month_year DESC, employee_name ASC'),
      pool.query('SELECT * FROM early_salary_advances ORDER BY request_date DESC'),
      pool.query('SELECT * FROM bonuses ORDER BY date DESC'),
      pool.query('SELECT * FROM company_profile LIMIT 1')
    ]);

    // Map snake_case to camelCase
    const products = productsRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      subProductName: r.sub_product_name,
      type: r.type,
      category: r.category,
      originOrSupplier: r.origin_or_supplier,
      batchNumber: r.batch_number,
      stockQuantity: parseFloat(r.stock_quantity),
      unit: r.unit,
      costPrice: parseFloat(r.cost_price),
      sellingPrice: parseFloat(r.selling_price),
      germinationRate: parseFloat(r.germination_rate),
      purityRate: parseFloat(r.purity_rate),
      minStockAlert: parseFloat(r.min_stock_alert),
      expiryDate: r.expiry_date,
      productionDate: r.production_date || undefined,
      importDate: r.import_date || undefined,
      description: r.description || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    const stockAdjustments = adjustmentsRes.rows.map(r => ({
      id: r.id,
      productId: r.product_id,
      productName: r.product_name,
      subProductName: r.sub_product_name,
      type: r.type,
      quantity: parseFloat(r.quantity),
      previousStock: parseFloat(r.previous_stock),
      newStock: parseFloat(r.new_stock),
      reason: r.reason,
      date: r.date,
      adjustedBy: r.adjusted_by
    }));

    const customers = customersRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      companyName: r.company_name || '',
      phone: r.phone || '',
      email: r.email || '',
      address: r.address || '',
      city: r.city || '',
      state: r.state || '',
      zipCode: r.zip_code || '',
      customerType: r.customer_type,
      leadStatus: r.lead_status,
      totalOrdersCount: parseInt(r.total_orders_count, 10) || 0,
      totalSpent: parseFloat(r.total_spent) || 0,
      notes: r.notes || undefined,
      createdAt: r.created_at
    }));

    const invoices = invoicesRes.rows.map(r => ({
      id: r.id,
      invoiceNumber: r.invoice_number,
      date: r.date,
      dueDate: r.due_date,
      customerId: r.customer_id,
      customerName: r.customer_name,
      customerCompany: r.customer_company || '',
      customerAddress: r.customer_address || '',
      customerCityStateZip: r.customer_city_state_zip || '',
      customerPhone: r.customer_phone || '',
      shipToName: r.ship_to_name || undefined,
      shipToCompany: r.ship_to_company || undefined,
      shipToAddress: r.ship_to_address || undefined,
      shipToCityStateZip: r.ship_to_city_state_zip || undefined,
      shipToPhone: r.ship_to_phone || undefined,
      salesperson: r.salesperson || '',
      shipVia: r.ship_via || '',
      shipDate: r.ship_date || '',
      terms: r.terms || '',
      items: typeof r.items_json === 'string' ? JSON.parse(r.items_json) : r.items_json,
      subtotal: parseFloat(r.subtotal),
      taxRate: parseFloat(r.tax_rate),
      salesTax: parseFloat(r.sales_tax),
      shippingHandling: parseFloat(r.shipping_handling),
      discount: parseFloat(r.discount),
      total: parseFloat(r.total),
      paymentStatus: r.payment_status,
      paidAmount: parseFloat(r.paid_amount),
      notes: r.notes || undefined,
      createdAt: r.created_at
    }));

    const employees = employeesRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      role: r.role,
      department: r.department,
      email: r.email || '',
      phone: r.phone || '',
      address: r.address || '',
      joiningDate: r.joining_date || '',
      employmentType: r.employment_type,
      baseMonthlySalary: parseFloat(r.base_monthly_salary),
      bankAccount: r.bank_account || '',
      status: r.status,
      avatarColor: r.avatar_color || 'bg-blue-600'
    }));

    const salaryPayments = salariesRes.rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      department: r.department,
      monthYear: r.month_year,
      baseSalary: parseFloat(r.base_salary),
      earlySalaryAdvance: parseFloat(r.early_salary_advance),
      bonusAmount: parseFloat(r.bonus_amount),
      bonusReason: r.bonus_reason || undefined,
      deductions: parseFloat(r.deductions),
      netSalary: parseFloat(r.net_salary),
      paymentDate: r.payment_date,
      status: r.status,
      paymentMethod: r.payment_method,
      notes: r.notes || undefined
    }));

    const earlySalaryAdvances = earlySalaryRes.rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      amount: parseFloat(r.amount),
      requestDate: r.request_date,
      disbursedDate: r.disbursed_date || undefined,
      deductInMonth: r.deduct_in_month,
      reason: r.reason,
      status: r.status
    }));

    const bonuses = bonusesRes.rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      amount: parseFloat(r.amount),
      date: r.date,
      type: r.type,
      reason: r.reason,
      status: r.status
    }));

    const compRow = companyRes.rows[0];
    const company = compRow ? {
      name: compRow.name,
      tagline: compRow.tagline || '',
      streetAddress: compRow.street_address || '',
      cityStateZip: compRow.city_state_zip || '',
      phone: compRow.phone || '',
      fax: compRow.fax || '',
      email: compRow.email || '',
      website: compRow.website || '',
      taxId: compRow.tax_id || '',
      bankName: compRow.bank_name || '',
      bankAccount: compRow.bank_account || '',
      routingNumber: compRow.routing_number || ''
    } : null;

    res.json({
      success: true,
      database: 'Neon PostgreSQL',
      data: {
        products,
        stockAdjustments,
        customers,
        invoices,
        employees,
        salaryPayments,
        earlySalaryAdvances,
        bonuses,
        company
      }
    });
  } catch (error: any) {
    console.error('[API Sync Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Products CRUD
app.post('/api/products', async (req, res) => {
  const p = req.body;
  const now = new Date().toISOString().split('T')[0];
  const id = p.id || `prod-${Date.now()}`;
  try {
    await pool.query(`
      INSERT INTO products (
        id, name, sub_product_name, type, category, origin_or_supplier, batch_number,
        stock_quantity, unit, cost_price, selling_price, germination_rate, purity_rate,
        min_stock_alert, expiry_date, production_date, import_date, description, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    `, [
      id, p.name, p.subProductName, p.type, p.category, p.originOrSupplier, p.batchNumber,
      p.stockQuantity || 0, p.unit || 'kg', p.costPrice || 0, p.sellingPrice || 0,
      p.germinationRate || 95, p.purityRate || 99, p.minStockAlert || 100, p.expiryDate,
      p.productionDate || null, p.importDate || null, p.description || null,
      p.createdAt || now, now
    ]);

    if (p.stockQuantity > 0) {
      const adjId = `adj-${Date.now()}`;
      await pool.query(`
        INSERT INTO stock_adjustments (
          id, product_id, product_name, sub_product_name, type, quantity, previous_stock, new_stock, reason, date, adjusted_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        adjId, id, p.name, p.subProductName,
        p.type === 'imported' ? 'import_arrival' : 'harvest_yield',
        p.stockQuantity, 0, p.stockQuantity,
        'Initial seed batch inventory registration', now, 'Inventory Admin'
      ]);
    }

    res.json({ success: true, id });
  } catch (err: any) {
    console.error('[Create Product Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const now = new Date().toISOString().split('T')[0];
  try {
    // Get current product
    const current = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (current.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const curr = current.rows[0];

    await pool.query(`
      UPDATE products SET
        name = $1,
        sub_product_name = $2,
        type = $3,
        category = $4,
        origin_or_supplier = $5,
        batch_number = $6,
        stock_quantity = $7,
        unit = $8,
        cost_price = $9,
        selling_price = $10,
        germination_rate = $11,
        purity_rate = $12,
        min_stock_alert = $13,
        expiry_date = $14,
        production_date = $15,
        import_date = $16,
        description = $17,
        updated_at = $18
      WHERE id = $19
    `, [
      updates.name ?? curr.name,
      updates.subProductName ?? curr.sub_product_name,
      updates.type ?? curr.type,
      updates.category ?? curr.category,
      updates.originOrSupplier ?? curr.origin_or_supplier,
      updates.batchNumber ?? curr.batch_number,
      updates.stockQuantity ?? curr.stock_quantity,
      updates.unit ?? curr.unit,
      updates.costPrice ?? curr.cost_price,
      updates.sellingPrice ?? curr.selling_price,
      updates.germinationRate ?? curr.germination_rate,
      updates.purityRate ?? curr.purity_rate,
      updates.minStockAlert ?? curr.min_stock_alert,
      updates.expiryDate ?? curr.expiry_date,
      updates.productionDate !== undefined ? updates.productionDate : curr.production_date,
      updates.importDate !== undefined ? updates.importDate : curr.import_date,
      updates.description !== undefined ? updates.description : curr.description,
      now,
      id
    ]);

    res.json({ success: true });
  } catch (err: any) {
    console.error('[Update Product Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Delete Product Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Adjust stock endpoint
app.post('/api/products/:id/adjust-stock', async (req, res) => {
  const { id } = req.params;
  const { quantityDelta, reason, type, adjustedBy } = req.body;
  const now = new Date().toISOString().split('T')[0];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const pRes = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [id]);
    if (pRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const p = pRes.rows[0];
    const prevStock = parseFloat(p.stock_quantity);
    const newStock = Math.max(0, prevStock + quantityDelta);

    await client.query('UPDATE products SET stock_quantity = $1, updated_at = $2 WHERE id = $3', [newStock, now, id]);

    const adjId = `adj-${Date.now()}`;
    await client.query(`
      INSERT INTO stock_adjustments (
        id, product_id, product_name, sub_product_name, type, quantity, previous_stock, new_stock, reason, date, adjusted_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      adjId, id, p.name, p.sub_product_name, type, Math.abs(quantityDelta), prevStock, newStock, reason, now, adjustedBy || 'Warehouse Manager'
    ]);

    await client.query('COMMIT');
    res.json({ success: true, newStock, adjustmentId: adjId });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Adjust Stock Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// Customer Endpoints
app.post('/api/customers', async (req, res) => {
  const c = req.body;
  const id = c.id || `cust-${Date.now()}`;
  const now = new Date().toISOString().split('T')[0];
  try {
    await pool.query(`
      INSERT INTO customers (
        id, name, company_name, phone, email, address, city, state, zip_code, customer_type, lead_status, total_orders_count, total_spent, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      id, c.name, c.companyName || '', c.phone || '', c.email || '', c.address || '',
      c.city || '', c.state || '', c.zipCode || '', c.customerType || 'Prospect Lead',
      c.leadStatus || 'New Lead', c.totalOrdersCount || 0, c.totalSpent || 0, c.notes || null, c.createdAt || now
    ]);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('[Create Customer Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const current = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (current.rowCount === 0) return res.status(404).json({ success: false, error: 'Customer not found' });
    const curr = current.rows[0];

    await pool.query(`
      UPDATE customers SET
        name = $1,
        company_name = $2,
        phone = $3,
        email = $4,
        address = $5,
        city = $6,
        state = $7,
        zip_code = $8,
        customer_type = $9,
        lead_status = $10,
        total_orders_count = $11,
        total_spent = $12,
        notes = $13
      WHERE id = $14
    `, [
      updates.name ?? curr.name,
      updates.companyName ?? curr.company_name,
      updates.phone ?? curr.phone,
      updates.email ?? curr.email,
      updates.address ?? curr.address,
      updates.city ?? curr.city,
      updates.state ?? curr.state,
      updates.zipCode ?? curr.zip_code,
      updates.customerType ?? curr.customer_type,
      updates.leadStatus ?? curr.lead_status,
      updates.totalOrdersCount ?? curr.total_orders_count,
      updates.totalSpent ?? curr.total_spent,
      updates.notes !== undefined ? updates.notes : curr.notes,
      id
    ]);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Update Customer Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Delete Customer Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Invoices & Sales
app.post('/api/invoices', async (req, res) => {
  const inv = req.body;
  const now = new Date().toISOString();
  const today = now.split('T')[0];
  const id = inv.id || `inv-${Date.now()}`;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Stock validation and update
    for (const item of inv.items) {
      const prodRes = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [item.productId]);
      if (prodRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: `Product not found: ${item.productName}` });
      }
      const prod = prodRes.rows[0];
      const stock = parseFloat(prod.stock_quantity);
      if (stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for "${prod.name} (${prod.sub_product_name})". Requested: ${item.quantity} ${item.unit}, Available: ${stock} ${item.unit}`
        });
      }

      const newStock = stock - item.quantity;
      await client.query('UPDATE products SET stock_quantity = $1, updated_at = $2 WHERE id = $3', [newStock, today, prod.id]);

      // Stock adjustment record
      const adjId = `adj-sale-${Date.now()}-${item.productId}`;
      await client.query(`
        INSERT INTO stock_adjustments (
          id, product_id, product_name, sub_product_name, type, quantity, previous_stock, new_stock, reason, date, adjusted_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        adjId, prod.id, prod.name, prod.sub_product_name, 'stock_out', item.quantity, stock, newStock,
        `Sale Invoice #${inv.invoiceNumber} to ${inv.customerName}`, today, inv.salesperson || 'Sales Desk'
      ]);
    }

    // 2. Insert invoice
    await client.query(`
      INSERT INTO invoices (
        id, invoice_number, date, due_date, customer_id, customer_name, customer_company, customer_address,
        customer_city_state_zip, customer_phone, ship_to_name, ship_to_company, ship_to_address,
        ship_to_city_state_zip, ship_to_phone, salesperson, ship_via, ship_date, terms, items_json,
        subtotal, tax_rate, sales_tax, shipping_handling, discount, total, payment_status, paid_amount, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
    `, [
      id, inv.invoiceNumber, inv.date, inv.dueDate, inv.customerId, inv.customerName, inv.customerCompany || '',
      inv.customerAddress || '', inv.customerCityStateZip || '', inv.customerPhone || '',
      inv.shipToName || null, inv.shipToCompany || null, inv.shipToAddress || null, inv.shipToCityStateZip || null,
      inv.shipToPhone || null, inv.salesperson || '', inv.shipVia || '', inv.shipDate || '', inv.terms || '',
      JSON.stringify(inv.items), inv.subtotal || 0, inv.taxRate || 0, inv.salesTax || 0, inv.shippingHandling || 0,
      inv.discount || 0, inv.total || 0, inv.paymentStatus || 'Pending', inv.paidAmount || 0, inv.notes || null, now
    ]);

    // 3. Update customer spend & promotion
    if (inv.customerId) {
      await client.query(`
        UPDATE customers SET
          total_orders_count = total_orders_count + 1,
          total_spent = total_spent + $1,
          lead_status = 'Active Customer'
        WHERE id = $2
      `, [inv.total || 0, inv.customerId]);
    }

    await client.query('COMMIT');
    res.json({ success: true, id, invoice: { ...inv, id, createdAt: now } });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Create Invoice Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

app.put('/api/invoices/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, paidAmount } = req.body;
  try {
    const invRes = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (invRes.rowCount === 0) return res.status(404).json({ success: false, error: 'Invoice not found' });
    const inv = invRes.rows[0];

    const newPaid = paidAmount !== undefined ? paidAmount : (status === 'Paid' ? parseFloat(inv.total) : parseFloat(inv.paid_amount));
    await pool.query('UPDATE invoices SET payment_status = $1, paid_amount = $2 WHERE id = $3', [status, newPaid, id]);

    res.json({ success: true, paymentStatus: status, paidAmount: newPaid });
  } catch (err: any) {
    console.error('[Update Invoice Status Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM invoices WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Delete Invoice Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Employee & HR
app.post('/api/employees', async (req, res) => {
  const emp = req.body;
  const id = emp.id || `emp-${Date.now()}`;
  try {
    await pool.query(`
      INSERT INTO employees (
        id, name, role, department, email, phone, address, joining_date, employment_type, base_monthly_salary, bank_account, status, avatar_color
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      id, emp.name, emp.role, emp.department, emp.email || '', emp.phone || '', emp.address || '',
      emp.joiningDate || '', emp.employmentType || 'Full-time', emp.baseMonthlySalary || 0,
      emp.bankAccount || '', emp.status || 'Active', emp.avatarColor || 'bg-blue-600'
    ]);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('[Create Employee Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const current = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
    if (current.rowCount === 0) return res.status(404).json({ success: false, error: 'Employee not found' });
    const curr = current.rows[0];

    await pool.query(`
      UPDATE employees SET
        name = $1,
        role = $2,
        department = $3,
        email = $4,
        phone = $5,
        address = $6,
        joining_date = $7,
        employment_type = $8,
        base_monthly_salary = $9,
        bank_account = $10,
        status = $11,
        avatar_color = $12
      WHERE id = $13
    `, [
      updates.name ?? curr.name,
      updates.role ?? curr.role,
      updates.department ?? curr.department,
      updates.email ?? curr.email,
      updates.phone ?? curr.phone,
      updates.address ?? curr.address,
      updates.joiningDate ?? curr.joining_date,
      updates.employmentType ?? curr.employment_type,
      updates.baseMonthlySalary ?? curr.base_monthly_salary,
      updates.bankAccount ?? curr.bank_account,
      updates.status ?? curr.status,
      updates.avatarColor ?? curr.avatar_color,
      id
    ]);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Update Employee Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM employees WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Delete Employee Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Early Salary Advance & Bonus
app.post('/api/early-salary', async (req, res) => {
  const adv = req.body;
  const id = adv.id || `adv-${Date.now()}`;
  try {
    await pool.query(`
      INSERT INTO early_salary_advances (
        id, employee_id, employee_name, amount, request_date, disbursed_date, deduct_in_month, reason, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      id, adv.employeeId, adv.employeeName, adv.amount || 0, adv.requestDate || '',
      adv.disbursedDate || null, adv.deductInMonth, adv.reason || '', adv.status || 'Pending'
    ]);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('[Create Early Salary Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/early-salary/:id', async (req, res) => {
  const { id } = req.params;
  const { status, disbursedDate } = req.body;
  const today = new Date().toISOString().split('T')[0];
  try {
    await pool.query(`
      UPDATE early_salary_advances SET
        status = $1,
        disbursed_date = COALESCE($2, disbursed_date, CASE WHEN $1 = 'Disbursed' THEN $3 ELSE NULL END)
      WHERE id = $4
    `, [status, disbursedDate || null, today, id]);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Update Early Salary Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/bonuses', async (req, res) => {
  const bon = req.body;
  const id = bon.id || `bon-${Date.now()}`;
  try {
    await pool.query(`
      INSERT INTO bonuses (
        id, employee_id, employee_name, amount, date, type, reason, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      id, bon.employeeId, bon.employeeName, bon.amount || 0, bon.date, bon.type || 'Performance', bon.reason || '', bon.status || 'Approved'
    ]);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('[Create Bonus Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/payroll/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE salary_payments SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Update Payroll Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/company', async (req, res) => {
  const updates = req.body;
  try {
    await pool.query(`
      UPDATE company_profile SET
        name = $1, tagline = $2, street_address = $3, city_state_zip = $4,
        phone = $5, fax = $6, email = $7, website = $8, tax_id = $9,
        bank_name = $10, bank_account = $11, routing_number = $12
      WHERE id = 'company-main'
    `, [
      updates.name, updates.tagline, updates.streetAddress, updates.cityStateZip,
      updates.phone, updates.fax, updates.email, updates.website, updates.taxId,
      updates.bankName, updates.bankAccount, updates.routingNumber
    ]);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Update Company Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/reset-data', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database reset to default seeds.' });
  } catch (err: any) {
    console.error('[Reset Data Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server and Vite Middleware
async function startServer() {
  // Initialize Database
  try {
    await initDatabase();
  } catch (err) {
    console.error('[Neon PostgreSQL] Failed to initialize DB:', err);
  }

  // Setup Vite / Static Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Neon Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
