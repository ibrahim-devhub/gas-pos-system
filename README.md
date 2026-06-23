# Gas POS System

A modern LPG/gas point-of-sale system built with React, Vite, Tailwind CSS, Lucide React, Recharts, Supabase Auth, and Supabase Postgres. The Express/SQLite backend remains available for the legacy local demo path.

## Project Structure

```text
frontend/   React + Vite client
backend/    Express + SQLite API
```

## Default Login

```text
Email: admin@gaspos.com
Password: admin123
```

The backend also seeds a sample cashier:

```text
Email: cashier@gaspos.com
Password: cashier123
```

## Backend Setup

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

The API runs on `http://localhost:5000` by default. SQLite tables and seed data are created automatically when the server starts.

Useful backend scripts:

```bash
npm start
npm run seed
```

## Frontend Setup

Open a second terminal:

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

The Vite app runs on `http://localhost:5173` by default.

## Main Features

- Landing page for an LPG business POS product
- Supabase Google login for hosted vendor authentication
- First-time business setup for each vendor
- Vendor-scoped stock, sales, reports, settings, and staff profiles
- Protected dashboard, POS, stock, reports, users, and settings routes
- Admin and cashier roles
- Dashboard cards, sales trend chart, stock chart, and latest sales table
- POS sale creation with automatic stock reduction
- Stock CRUD with low-stock status badges
- Sales reports with revenue chart, top-selling products, and recent transactions
- Business settings for name, currency, and receipt footer

## API Routes

```text
POST   /api/auth/login
POST   /api/auth/register
GET    /api/dashboard/summary
GET    /api/stock
POST   /api/stock
PUT    /api/stock/:id
DELETE /api/stock/:id
GET    /api/sales
POST   /api/sales
GET    /api/reports/sales
GET    /api/settings
PUT    /api/settings
GET    /api/users
POST   /api/users
```

## Notes

- Change `JWT_SECRET` in `backend/.env` before using this beyond local development.
- For Google login, add `SUPABASE_URL` to `backend/.env` so the API accepts Supabase access tokens.
- The frontend stores auth session data in browser storage for this implementation.
- If you change the backend port, update `frontend/.env` so `VITE_API_URL` points to the correct API URL.
- For hosted Google login and hosted database setup, see `supabase/README.md` and run the SQL in `supabase/schema.sql`.

## Deploy Frontend To Netlify

The root `netlify.toml` is already configured for the Vite app in `frontend/`.

Netlify settings:

```text
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

Environment variables:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

After Netlify gives you a site URL, add it in Supabase:

```text
Authentication > URL Configuration
Site URL: https://your-netlify-site.netlify.app
Redirect URLs:
https://your-netlify-site.netlify.app/**
```

Also add the same Netlify domain in Google Cloud OAuth authorized JavaScript origins.
