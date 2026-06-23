-- Run this in Supabase SQL Editor.
-- It creates a hosted multi-vendor Gas POS database with row-level security.

create extension if not exists "pgcrypto";

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  currency text not null default 'KES',
  receipt_footer text not null default 'Thank you for choosing us.',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  name text,
  email text,
  role text not null default 'admin' check (role in ('admin', 'cashier')),
  created_at timestamptz not null default now()
);

create table if not exists public.stock (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_name text not null,
  cylinder_size text not null,
  quantity integer not null default 0 check (quantity >= 0),
  buying_price numeric(12, 2) not null default 0 check (buying_price >= 0),
  selling_price numeric(12, 2) not null default 0 check (selling_price >= 0),
  low_stock_limit integer not null default 5 check (low_stock_limit >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  stock_id uuid references public.stock(id) on delete set null,
  product_name text not null,
  cylinder_size text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  payment_method text not null,
  customer_name text,
  sold_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select business_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_business_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

alter table public.businesses enable row level security;
alter table public.profiles enable row level security;
alter table public.stock enable row level security;
alter table public.sales enable row level security;

drop policy if exists "Users can view their business" on public.businesses;
drop policy if exists "Users can create their own business" on public.businesses;
drop policy if exists "Owners can update their business" on public.businesses;
drop policy if exists "Users can view profiles in their business" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Business members can view stock" on public.stock;
drop policy if exists "Business members can insert stock" on public.stock;
drop policy if exists "Business members can update stock" on public.stock;
drop policy if exists "Business members can delete stock" on public.stock;
drop policy if exists "Business members can view sales" on public.sales;
drop policy if exists "Business members can insert sales" on public.sales;

create policy "Users can view their business"
on public.businesses for select
using (owner_id = auth.uid() or id = public.current_business_id());

create policy "Users can create their own business"
on public.businesses for insert
with check (owner_id = auth.uid());

create policy "Owners can update their business"
on public.businesses for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Users can view profiles in their business"
on public.profiles for select
using (id = auth.uid() or business_id = public.current_business_id());

create policy "Users can create their own profile"
on public.profiles for insert
with check (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Business members can view stock"
on public.stock for select
using (business_id = public.current_business_id());

create policy "Business members can insert stock"
on public.stock for insert
with check (business_id = public.current_business_id());

create policy "Business members can update stock"
on public.stock for update
using (business_id = public.current_business_id())
with check (business_id = public.current_business_id());

create policy "Business members can delete stock"
on public.stock for delete
using (business_id = public.current_business_id());

create policy "Business members can view sales"
on public.sales for select
using (business_id = public.current_business_id());

create policy "Business members can insert sales"
on public.sales for insert
with check (business_id = public.current_business_id());
