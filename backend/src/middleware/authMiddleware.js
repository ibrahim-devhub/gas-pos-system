const jwt = require('jsonwebtoken');
const { get, run } = require('../database/db');

let supabaseJwks;

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  try {
    const localUser = jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
    req.user = localUser;
    return next();
  } catch (localError) {
    try {
      const supabaseUser = await verifySupabaseToken(token);
      req.user = supabaseUser;
      return next();
    } catch (supabaseError) {
      return res.status(401).json({
        message: process.env.SUPABASE_URL
          ? 'Invalid or expired token'
          : 'Supabase URL is missing on the backend'
      });
    }
  }
}

async function verifySupabaseToken(token) {
  if (!process.env.SUPABASE_URL) {
    throw new Error('Missing SUPABASE_URL');
  }

  const { createRemoteJWKSet, jwtVerify } = await import('jose');
  const issuer = `${process.env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1`;

  if (!supabaseJwks) {
    supabaseJwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  }

  const { payload: claims } = await jwtVerify(token, supabaseJwks, {
    issuer,
    audience: 'authenticated'
  });

  const email = claims.email;
  if (!email) {
    throw new Error('Supabase token does not include an email');
  }

  const name = claims.user_metadata?.full_name || claims.user_metadata?.name || email;
  let user = await get('SELECT id, name, email, role FROM users WHERE email = ?', [email.toLowerCase()]);

  if (!user) {
    const result = await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email.toLowerCase(), 'supabase-google-auth', 'admin']
    );
    user = await get('SELECT id, name, email, role FROM users WHERE id = ?', [result.id]);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    provider: 'supabase',
    supabase_id: claims.sub
  };
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  return next();
}

module.exports = {
  authMiddleware,
  adminOnly
};
