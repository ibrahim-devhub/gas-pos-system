# Supabase Setup

Use this when you do not want a local SQLite database.

## 1. Create a Supabase project

1. Go to `https://supabase.com/dashboard`.
2. Create a new project.
3. Open **Project Settings > API**.
4. Copy:
   - Project URL
   - anon public key

## 2. Configure the frontend

Create `frontend/.env`:

```text
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Restart Vite after changing `.env`.

## 3. Enable Google login

In Supabase:

1. Go to **Authentication > Providers**.
2. Enable **Google**.
3. Add your Google OAuth Client ID and Client Secret.
4. In **Authentication > URL Configuration**, set:

```text
Site URL: http://localhost:5173
Redirect URLs:
http://localhost:5173/**
```

For production, add your deployed domain too.

## 4. Create hosted database tables

Open **SQL Editor** in Supabase and run:

```sql
-- paste the contents of supabase/schema.sql here
```

## 5. Install and run frontend

```powershell
cd C:\Users\mohai\Noel\frontend
npm.cmd install
npm.cmd run dev
```

Google login will work once the Supabase project keys and Google provider are configured.

## 6. Optional: keep the existing backend available

The frontend now stores POS data directly in Supabase. The Express backend can remain available for the legacy local demo login or future server-only features such as staff invitation emails.

Create `backend/.env`:

```powershell
cd C:\Users\mohai\Noel\backend
copy .env.example .env
```

Then add your Supabase project URL:

```text
PORT=5000
JWT_SECRET=change-this-secret-before-production
SUPABASE_URL=https://your-project-ref.supabase.co
DB_PATH=./src/database/gaspos.sqlite
```

Use the same project URL that you added to `frontend/.env`. You do not need the database password here. Your project uses modern ECC signing keys, so the backend verifies tokens from Supabase's public JWKS endpoint automatically.

Restart the backend after changing `backend/.env`:

```powershell
npm.cmd run dev
```

## Current migration status

The frontend supports Supabase Google authentication, first-time business setup, vendor-scoped stock, sales, reports, settings, and staff profile listing. Each vendor's records are isolated by `business_id` and Supabase row-level security.

Creating cashier accounts for a business needs a secure invite endpoint that uses a Supabase service-role key on the server. Do not put a service-role key in the frontend.
