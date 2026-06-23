const express = require('express');
const { all, get } = require('../database/db');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', authMiddleware, async (req, res, next) => {
  try {
    const totals = await get(`
      SELECT
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(COUNT(*), 0) as transaction_count
      FROM sales
    `);
    const stock = await get(`
      SELECT
        COALESCE(SUM(quantity * selling_price), 0) as stock_value,
        COALESCE(SUM(quantity), 0) as cylinders_available,
        COALESCE(SUM(CASE WHEN quantity <= low_stock_limit THEN 1 ELSE 0 END), 0) as low_stock_items
      FROM stock
    `);
    const latestSales = await all(`
      SELECT sales.*, users.name as sold_by_name
      FROM sales
      LEFT JOIN users ON users.id = sales.sold_by
      ORDER BY sales.created_at DESC
      LIMIT 8
    `);
    const salesTrend = await all(`
      SELECT date(created_at) as date, COALESCE(SUM(total_amount), 0) as revenue
      FROM sales
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
      LIMIT 14
    `);
    const stockSummary = await all(`
      SELECT product_name, cylinder_size, quantity
      FROM stock
      ORDER BY quantity DESC
    `);

    return res.json({
      cards: {
        totalSales: totals.total_sales,
        transactionCount: totals.transaction_count,
        stockValue: stock.stock_value,
        cylindersAvailable: stock.cylinders_available,
        lowStockItems: stock.low_stock_items
      },
      latestSales,
      salesTrend,
      stockSummary
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
