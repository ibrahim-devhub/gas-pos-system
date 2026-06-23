const express = require('express');
const bcrypt = require('bcryptjs');
const { all, get, run } = require('../database/db');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const users = await all('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { name, email, password, role = 'cashier' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (!['admin', 'cashier'].includes(role)) {
      return res.status(400).json({ message: 'Role must be admin or cashier' });
    }

    const existing = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      return res.status(409).json({ message: 'A user with that email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email.toLowerCase(), hashed, role]
    );
    const user = await get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [result.id]);
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
