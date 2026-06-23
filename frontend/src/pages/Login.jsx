import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: 'admin@gaspos.com', password: 'admin123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Unable to start Google login.');
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-950 px-4 py-10 md:grid-cols-[1fr_460px] md:px-0 md:py-0">
      <section className="hidden items-center px-10 md:flex lg:px-16">
        <div className="max-w-2xl">
          <Link to="/" className="inline-flex items-center gap-3 text-white">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-flame-500">
              <Flame className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">GasPOS</span>
          </Link>
          <h1 className="mt-10 text-5xl font-bold tracking-tight text-white">Sign in to your LPG sales command center.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Manage point-of-sale transactions, inventory levels, staff access, and revenue analytics from a secure dashboard.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl md:rounded-none md:p-10">
          <Link to="/" className="mb-8 flex items-center gap-3 md:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white">
              <Flame className="h-5 w-5 text-flame-400" />
            </div>
            <span className="text-lg font-bold text-slate-950">GasPOS</span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-950">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Use the seeded admin account or your assigned user login.</p>

          {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white">G</span>
              Continue with Google
            </button>
          </div>

          <details className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <summary className="cursor-pointer font-semibold text-slate-900">Legacy local demo login</summary>
            <p className="mt-2">
              Use this only for the old SQLite demo backend. Real vendor accounts should use Google so their data is stored in Supabase.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email address</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none ring-brand-500 focus:ring-2"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none ring-brand-500 focus:ring-2"
                required
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            </form>
          </details>
        </div>
      </section>
    </div>
  );
}
