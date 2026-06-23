import { useEffect, useState } from 'react';
import { Card, ErrorState, LoadingState, PageHeader } from '../components/UI.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { updateBusinessSettings } from '../services/posService.js';

export default function Settings() {
  const { user } = useAuth();
  const { business, profile, refreshBusiness } = useBusiness();
  const [form, setForm] = useState({ business_name: '', currency: 'KES', receipt_footer: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      business_name: business.business_name || '',
      currency: business.currency || 'KES',
      receipt_footer: business.receipt_footer || ''
    });
    setLoading(false);
  }, [business]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const data = await updateBusinessSettings(business.id, form);
      setForm(data);
      await refreshBusiness();
      setMessage('Settings updated successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading settings..." />;

  return (
    <>
      <PageHeader title="Settings" description="Business receipt settings and signed-in user profile." />
      {error && <div className="mb-4"><ErrorState message={error} /></div>}
      {message && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <Card>
          <h2 className="text-lg font-bold text-slate-950">Business settings</h2>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Business name</span>
              <input value={form.business_name} onChange={(event) => setForm({ ...form, business_name: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500" required />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Currency</span>
              <select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500">
                <option>KES</option>
                <option>USD</option>
                <option>UGX</option>
                <option>TZS</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Receipt footer</span>
              <textarea rows="4" value={form.receipt_footer} onChange={(event) => setForm({ ...form, receipt_footer: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
            <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save settings'}
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">User profile</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-slate-500">Name</p>
              <p className="mt-1 font-bold text-slate-950">{user?.name}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-slate-500">Email</p>
              <p className="mt-1 font-bold text-slate-950">{user?.email}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-slate-500">Role</p>
              <p className="mt-1 font-bold capitalize text-slate-950">{profile?.role || user?.role}</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
