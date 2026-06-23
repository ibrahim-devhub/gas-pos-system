const express = require('express');
const { all, get, run } = require('../database/db');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const rows = await all(`
      SELECT sales.*, users.name as sold_by_name
      FROM sales
      LEFT JOIN users ON users.id = sales.sold_by
      ORDER BY sales.created_at DESC
    `);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { stock_id, quantity, payment_method, customer_name } = req.body;
    const saleQuantity = Number(quantity || 0);
    if (!stock_id || saleQuantity <= 0 || !payment_method) {
      return res.status(400).json({ message: 'Product, quantity and payment method are required' });
    }

    const item = await get('SELECT * FROM stock WHERE id = ?', [stock_id]);
    if (!item) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    if (item.quantity < saleQuantity) {
      return res.status(400).json({ message: 'Insufficient stock for this sale' });
    }

    const total = saleQuantity * item.selling_price;
    const result = await run(
      `INSERT INTO sales
        (stock_id, product_name, cylinder_size, quantity, unit_price, total_amount, payment_method, customer_name, sold_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.product_name,
        item.cylinder_size,
        saleQuantity,
        item.selling_price,
        total,
        payment_method,
        customer_name || '',
        req.user.id
      ]
    );
    await run('UPDATE stock SET quantity = quantity - ? WHERE id = ?', [saleQuantity, item.id]);
    const sale = await get('SELECT * FROM sales WHERE id = ?', [result.id]);
    return res.status(201).json(sale);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
