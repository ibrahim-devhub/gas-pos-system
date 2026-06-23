import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Building2, Flame } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext.jsx';

export default function SetupBusiness() {
  const { hasBusiness, loading, setupBusiness } = useBusiness();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    business_name: '',
    currency: 'KES',
    receipt_footer: 'Thank you for choosing us.',
    seed_stock: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!loading && hasBusiness) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await setupBusiness(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to create business workspace.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto flex max-w-5xl items-center gap-3 text-white">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-flame-500">
          <Flame className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-bold">GasPOS</p>
          <p className="text-xs text-slate-400">Business setup</p>
        </div>
      </div>

      <main className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
            <Building2 className="h-4 w-4 text-flame-400" />
            First-time vendor setup
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">Make this POS yours.</h1>
          <p className="mt-4 text-slate-300">
            Create your gas business workspace. Your products, prices, sales, settings, and reports will be stored under this business only.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-950">Business details</h2>
          {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Business name</span>
              <input
                value={form.business_name}
                onChange={(event) => setForm({ ...form, business_name: event.target.value })}
                placeholder="Example: Noel Gas Supplies"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Currency</span>
              <select
                value={form.currency}
                onChange={(event) => setForm({ ...form, currency: event.target.value })}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option>KES</option>
                <option>USD</option>
                <option>UGX</option>
                <option>TZS</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Receipt footer</span>
              <textarea
                rows="3"
                value={form.receipt_footer}
                onChange={(event) => setForm({ ...form, receipt_footer: event.target.value })}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
              <input
                type="checkbox"
                checked={form.seed_stock}
                onChange={(event) => setForm({ ...form, seed_stock: event.target.checked })}
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800">Add starter gas products</span>
                <span className="text-sm text-slate-500">Creates common LPG items with zero quantity so you can enter your real prices and stock.</span>
              </span>
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? 'Creating workspace...' : 'Create business workspace'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
