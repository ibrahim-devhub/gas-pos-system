const express = require('express');
const { get, run } = require('../database/db');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const settings = await get('SELECT * FROM settings WHERE id = 1');
    return res.json(settings);
  } catch (error) {
    return next(error);
  }
});

router.put('/', authMiddleware, async (req, res, next) => {
  try {
    const { business_name, currency, receipt_footer } = req.body;
    if (!business_name || !currency) {
      return res.status(400).json({ message: 'Business name and currency are required' });
    }

    await run(
      `UPDATE settings
       SET business_name = ?, currency = ?, receipt_footer = ?
       WHERE id = 1`,
      [business_name, currency, receipt_footer || '']
    );
    const settings = await get('SELECT * FROM settings WHERE id = 1');
    return res.json(settings);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
