import { useEffect, useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import ProductTile from '../components/ProductTile.jsx';
import { Badge, Card, EmptyState, ErrorState, formatMoney, LoadingState, PageHeader } from '../components/UI.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { deleteStockItem, getStockItems, saveStockItem } from '../services/posService.js';

const emptyForm = {
  product_name: '',
  cylinder_size: '',
  quantity: 0,
  buying_price: 0,
  selling_price: 0,
  low_stock_limit: 5
};

export default function Stock() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { business } = useBusiness();

  const loadStock = async () => {
    setItems(await getStockItems(business.id));
  };

  useEffect(() => {
    loadStock()
      .catch((err) => setError(err.message || 'Unable to load stock.'))
      .finally(() => setLoading(false));
  }, [business.id]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await saveStockItem(business.id, form, editingId);
      } else {
        await saveStockItem(business.id, form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadStock();
    } catch (err) {
      setError(err.message || 'Unable to save stock item.');
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setForm({
      product_name: item.product_name,
      cylinder_size: item.cylinder_size,
      quantity: item.quantity,
      buying_price: item.buying_price,
      selling_price: item.selling_price,
      low_stock_limit: item.low_stock_limit
    });
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this stock item?')) return;
    await deleteStockItem(business.id, id);
    await loadStock();
  };

  if (loading) return <LoadingState label="Loading stock..." />;

  return (
    <>
      <PageHeader title="Stock" description="Add, edit, delete, and monitor gas product inventory." />
      {error && <div className="mb-4"><ErrorState message={error} /></div>}

      <Card className="mb-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Product shelf</h2>
            <p className="text-sm text-slate-500">Your gas products displayed like a POS catalog with selling prices at the bottom.</p>
          </div>
          <span className="text-sm font-semibold text-slate-500">{items.length} stock items</span>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.length === 0 ? (
            <div className="sm:col-span-2 xl:col-span-4">
              <EmptyState title="No product cards yet" description="Add your first stock item and it will appear here." />
            </div>
          ) : (
            items.map((item) => (
              <ProductTile key={item.id} item={item} currency={business.currency} onClick={() => editItem(item)} />
            ))
          )}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
            <Plus className="h-5 w-5 text-brand-600" />
            {editingId ? 'Edit stock item' : 'Add stock item'}
          </h2>
          <form onSubmit={submit} className="mt-5 grid gap-4">
            {[
              ['product_name', 'Product name', 'text'],
              ['cylinder_size', 'Cylinder size', 'text'],
              ['quantity', 'Quantity', 'number'],
              ['buying_price', 'Buying price', 'number'],
              ['selling_price', 'Selling price', 'number'],
              ['low_stock_limit', 'Low-stock limit', 'number']
            ].map(([name, label, type]) => (
              <label key={name} className="block">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <input
                  type={type}
                  min={type === 'number' ? '0' : undefined}
                  value={form[name]}
                  onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </label>
            ))}
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
                {saving ? 'Saving...' : editingId ? 'Update item' : 'Add item'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Inventory</h2>
          <div className="table-scroll mt-4 overflow-x-auto">
            {items.length === 0 ? (
              <EmptyState title="No stock items" />
            ) : (
              <table className="w-full min-w-[840px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Buying</th>
                    <th className="px-4 py-3">Selling</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const low = item.quantity <= item.low_stock_limit;
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{item.product_name}</td>
                        <td className="px-4 py-3">{item.cylinder_size}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">{formatMoney(item.buying_price, business.currency)}</td>
                        <td className="px-4 py-3">{formatMoney(item.selling_price, business.currency)}</td>
                        <td className="px-4 py-3"><Badge tone={low ? 'orange' : 'green'}>{low ? 'Low Stock' : 'In Stock'}</Badge></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => editItem(item)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Edit">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => deleteItem(item.id)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50" aria-label="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
