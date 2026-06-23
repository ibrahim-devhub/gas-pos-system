import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  Gauge,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Users,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: Gauge },
  { label: 'POS Sales', path: '/sales', icon: Receipt },
  { label: 'Stock', path: '/stock', icon: Boxes },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Users', path: '/users', icon: Users },
  { label: 'Settings', path: '/settings', icon: Settings }
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { business, profile } = useBusiness();

  const sidebar = (
    <aside className="flex h-full w-72 flex-col bg-slate-950 p-5 text-white">
      <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-flame-500">
          <Receipt className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-bold">{business?.business_name || 'GasPOS'}</p>
          <p className="text-xs text-slate-400">LPG retail command center</p>
        </div>
      </Link>

      <nav className="mt-9 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl bg-slate-900 p-4">
        <p className="text-sm font-semibold">{user?.name}</p>
        <p className="mt-1 text-xs capitalize text-slate-400">{profile?.role || user?.role}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex">{sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}

      <main className="min-w-0 flex-1 lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg border border-slate-200 p-2 text-slate-700"
            aria-label="Open menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-bold text-slate-950">GasPOS</span>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
