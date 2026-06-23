const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH
  ? path.resolve(process.cwd(), process.env.DB_PATH)
  : path.join(__dirname, 'gaspos.sqlite');

const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

async function createTables() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'cashier')) DEFAULT 'cashier',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      cylinder_size TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      buying_price REAL NOT NULL DEFAULT 0,
      selling_price REAL NOT NULL DEFAULT 0,
      low_stock_limit INTEGER NOT NULL DEFAULT 5,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stock_id INTEGER,
      product_name TEXT NOT NULL,
      cylinder_size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      customer_name TEXT,
      sold_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(stock_id) REFERENCES stock(id),
      FOREIGN KEY(sold_by) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      business_name TEXT NOT NULL,
      currency TEXT NOT NULL,
      receipt_footer TEXT NOT NULL
    )
  `);
}

async function seedDatabase() {
  const admin = await get('SELECT id FROM users WHERE email = ?', ['admin@gaspos.com']);
  if (!admin) {
    const password = await bcrypt.hash('admin123', 10);
    await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['System Admin', 'admin@gaspos.com', password, 'admin']
    );
    await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Front Desk Cashier', 'cashier@gaspos.com', await bcrypt.hash('cashier123', 10), 'cashier']
    );
  }

  const stockCount = await get('SELECT COUNT(*) as total FROM stock');
  if (!stockCount.total) {
    const products = [
      ['6kg Gas Cylinder', '6kg', 42, 1800, 2600, 8],
      ['13kg Gas Cylinder', '13kg', 30, 3600, 5200, 6],
      ['50kg Gas Cylinder', '50kg', 12, 13200, 18500, 3],
      ['Gas Regulator', 'Accessory', 18, 850, 1400, 5],
      ['Gas Burner', 'Accessory', 24, 600, 1100, 5]
    ];

    for (const product of products) {
      await run(
        `INSERT INTO stock
          (product_name, cylinder_size, quantity, buying_price, selling_price, low_stock_limit)
         VALUES (?, ?, ?, ?, ?, ?)`,
        product
      );
    }
  }

  const settings = await get('SELECT id FROM settings WHERE id = 1');
  if (!settings) {
    await run(
      'INSERT INTO settings (id, business_name, currency, receipt_footer) VALUES (1, ?, ?, ?)',
      ['Noel Gas POS', 'KES', 'Thank you for choosing Noel Gas.']
    );
  }

  const salesCount = await get('SELECT COUNT(*) as total FROM sales');
  if (!salesCount.total) {
    const user = await get('SELECT id FROM users WHERE email = ?', ['admin@gaspos.com']);
    const items = await all('SELECT * FROM stock ORDER BY id ASC');
    const sales = [
      [items[0], 2, 'Cash', 'Mary Wanjiku', '-6 days'],
      [items[1], 1, 'M-Pesa', 'James Otieno', '-5 days'],
      [items[3], 3, 'Card', 'Walk-in', '-4 days'],
      [items[2], 1, 'Bank Transfer', 'Green Cafe', '-3 days'],
      [items[0], 4, 'M-Pesa', 'Apartment Block B', '-2 days'],
      [items[4], 2, 'Cash', 'Walk-in', '-1 days'],
      [items[1], 2, 'M-Pesa', 'Jane Njeri', '+0 days']
    ];

    for (const [item, quantity, payment, customer, offset] of sales) {
      await run(
        `INSERT INTO sales
          (stock_id, product_name, cylinder_size, quantity, unit_price, total_amount, payment_method, customer_name, sold_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`,
        [
          item.id,
          item.product_name,
          item.cylinder_size,
          quantity,
          item.selling_price,
          quantity * item.selling_price,
          payment,
          customer,
          user.id,
          offset
        ]
      );
    }
  }
}

async function initializeDatabase() {
  await createTables();
  await seedDatabase();
}

module.exports = {
  db,
  run,
  get,
  all,
  initializeDatabase
};
