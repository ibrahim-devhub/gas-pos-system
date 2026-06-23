const express = require('express');
const { all, get, run } = require('../database/db');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const rows = await all(`
      SELECT *,
        CASE WHEN quantity <= low_stock_limit THEN 'Low Stock' ELSE 'In Stock' END as status
      FROM stock
      ORDER BY created_at DESC
    `);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { product_name, cylinder_size, quantity, buying_price, selling_price, low_stock_limit } = req.body;
    if (!product_name || !cylinder_size) {
      return res.status(400).json({ message: 'Product name and cylinder size are required' });
    }

    const result = await run(
      `INSERT INTO stock
        (product_name, cylinder_size, quantity, buying_price, selling_price, low_stock_limit)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        product_name,
        cylinder_size,
        Number(quantity || 0),
        Number(buying_price || 0),
        Number(selling_price || 0),
        Number(low_stock_limit || 5)
      ]
    );
    const item = await get('SELECT * FROM stock WHERE id = ?', [result.id]);
    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { product_name, cylinder_size, quantity, buying_price, selling_price, low_stock_limit } = req.body;
    const existing = await get('SELECT * FROM stock WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    await run(
      `UPDATE stock
       SET product_name = ?, cylinder_size = ?, quantity = ?, buying_price = ?, selling_price = ?, low_stock_limit = ?
       WHERE id = ?`,
      [
        product_name,
        cylinder_size,
        Number(quantity),
        Number(buying_price),
        Number(selling_price),
        Number(low_stock_limit),
        req.params.id
      ]
    );
    const item = await get('SELECT * FROM stock WHERE id = ?', [req.params.id]);
    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const existing = await get('SELECT * FROM stock WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    await run('DELETE FROM stock WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Stock item deleted' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
