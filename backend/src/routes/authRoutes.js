const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../database/db');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'development-secret',
    { expiresIn: '12h' }
  );
}

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user) {
      return res.status(401).json({ message: 'Invalid login details' });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ message: 'Invalid login details' });
    }

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    return res.json({ token: signToken(safeUser), user: safeUser });
  } catch (error) {
    return next(error);
  }
});

router.post('/register', authMiddleware, adminOnly, async (req, res, next) => {
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
