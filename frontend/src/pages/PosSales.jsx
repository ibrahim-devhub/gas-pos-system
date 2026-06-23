import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import ProductTile from '../components/ProductTile.jsx';
import { Badge, Card, EmptyState, ErrorState, formatMoney, LoadingState, PageHeader } from '../components/UI.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { createSale, getSales, getStockItems } from '../services/posService.js';
import { printTransactionInvoice } from '../utils/pdfReports.js';

export default function PosSales() {
  const [stock, setStock] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({ stock_id: '', quantity: 1, customer_name: '', payment_method: 'M-Pesa' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { business } = useBusiness();

  const selected = useMemo(() => stock.find((item) => String(item.id) === String(form.stock_id)), [stock, form.stock_id]);
  const total = selected ? Number(form.quantity || 0) * selected.selling_price : 0;

  const loadData = async () => {
    const [stockData, salesData] = await Promise.all([getStockItems(business.id), getSales(business.id)]);
    setStock(stockData);
    setSales(salesData);
    if (!form.stock_id && stockData[0]) {
      setForm((current) => ({ ...current, stock_id: stockData[0].id }));
    }
  };

  useEffect(() => {
    loadData()
      .catch((err) => setError(err.message || 'Unable to load POS data.'))
      .finally(() => setLoading(false));
  }, [business.id]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await createSale(business.id, user.id, selected, form);
      setMessage('Sale saved and stock updated successfully.');
      setForm((current) => ({ ...current, quantity: 1, customer_name: '' }));
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to save sale.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading POS..." />;

  return (
    <>
      <PageHeader title="POS Sales" description="Create gas sales and let the system reduce inventory automatically." />
      {error && <div className="mb-4"><ErrorState message={error} /></div>}
      {message && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}

      <Card className="mb-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Product catalog</h2>
            <p className="text-sm text-slate-500">Tap a stock item to select it for the current sale.</p>
          </div>
          {selected && (
            <p className="text-sm font-semibold text-brand-700">
              Selected: {selected.product_name} ({selected.cylinder_size})
            </p>
          )}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stock.length === 0 ? (
            <div className="sm:col-span-2 xl:col-span-4">
              <EmptyState title="No products available" description="Add stock items first, then they will appear here as POS product cards." />
            </div>
          ) : (
            stock.map((item) => (
              <ProductTile
                key={item.id}
                item={item}
                currency={business.currency}
                selected={String(item.id) === String(form.stock_id)}
                onClick={() => setForm((current) => ({ ...current, stock_id: item.id }))}
              />
            ))
          )}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="text-lg font-bold text-slate-950">New sale</h2>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Gas product</span>
              <select
                value={form.stock_id}
                onChange={(event) => setForm({ ...form, stock_id: event.target.value })}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                required
              >
                {stock.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.product_name} - {item.cylinder_size} ({item.quantity} available)
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Quantity</span>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Payment method</span>
                <select
                  value={form.payment_method}
                  onChange={(event) => setForm({ ...form, payment_method: event.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option>M-Pesa</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Customer name optional</span>
              <input
                value={form.customer_name}
                onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
                placeholder="Walk-in customer"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Unit price</span>
                <span>{formatMoney(selected?.selling_price || 0, business.currency)}</span>
              </div>
              <div className="mt-3 flex justify-between text-lg font-bold text-slate-950">
                <span>Total</span>
                <span>{formatMoney(total, business.currency)}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving || !stock.length}
              className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving sale...' : 'Save sale'}
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Recent transactions</h2>
          <div className="table-scroll mt-4 overflow-x-auto">
            {sales.length === 0 ? (
              <EmptyState title="No sales yet" />
            ) : (
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.slice(0, 10).map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-4 py-3 font-semibold">{sale.product_name} <span className="text-slate-400">({sale.cylinder_size})</span></td>
                      <td className="px-4 py-3">{sale.quantity}</td>
                      <td className="px-4 py-3"><Badge tone="blue">{sale.payment_method}</Badge></td>
                      <td className="px-4 py-3 font-semibold">{formatMoney(sale.total_amount, business.currency)}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(sale.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => printTransactionInvoice({ business, sale })}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
