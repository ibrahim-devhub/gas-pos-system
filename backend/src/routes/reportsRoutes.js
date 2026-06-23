const express = require('express');
const { all, get } = require('../database/db');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/sales', authMiddleware, async (req, res, next) => {
  try {
    const summary = await get(`
      SELECT
        COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(SUM(quantity), 0) as units_sold,
        COALESCE(COUNT(*), 0) as transactions,
        COALESCE(AVG(total_amount), 0) as average_sale
      FROM sales
    `);
    const revenueChart = await all(`
      SELECT date(created_at) as date, COALESCE(SUM(total_amount), 0) as revenue
      FROM sales
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
      LIMIT 30
    `);
    const topProducts = await all(`
      SELECT product_name, cylinder_size, SUM(quantity) as units, SUM(total_amount) as revenue
      FROM sales
      GROUP BY product_name, cylinder_size
      ORDER BY units DESC
      LIMIT 5
    `);
    const recentTransactions = await all(`
      SELECT sales.*, users.name as sold_by_name
      FROM sales
      LEFT JOIN users ON users.id = sales.sold_by
      ORDER BY sales.created_at DESC
      LIMIT 10
    `);

    return res.json({ summary, revenueChart, topProducts, recentTransactions });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
