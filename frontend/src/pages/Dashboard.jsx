import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Boxes, CircleDollarSign, PackageCheck } from 'lucide-react';
import { Badge, Card, EmptyState, ErrorState, formatMoney, LoadingState, PageHeader } from '../components/UI.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { getDashboardSummary } from '../services/posService.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { business } = useBusiness();

  useEffect(() => {
    getDashboardSummary(business.id)
      .then(setData)
      .catch((err) => setError(err.message || 'Unable to load dashboard summary.'))
      .finally(() => setLoading(false));
  }, [business.id]);

  if (loading) return <LoadingState label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} />;

  const cards = [
    { title: 'Total sales', value: formatMoney(data.cards.totalSales, business.currency), icon: CircleDollarSign, tone: 'bg-emerald-50 text-emerald-600' },
    { title: 'Stock value', value: formatMoney(data.cards.stockValue, business.currency), icon: Boxes, tone: 'bg-blue-50 text-blue-600' },
    { title: 'Items available', value: data.cards.cylindersAvailable, icon: PackageCheck, tone: 'bg-orange-50 text-orange-600' },
    { title: 'Low-stock items', value: data.cards.lowStockItems, icon: AlertTriangle, tone: 'bg-red-50 text-red-600' }
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Live sales, stock health, and recent LPG transactions." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{card.value}</p>
                </div>
                <div className={`grid h-12 w-12 place-items-center rounded-xl ${card.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <h2 className="font-bold text-slate-950">Sales trend</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesTrend}>
                <defs>
                  <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatMoney(value, business.currency)} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#sales)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-slate-950">Stock summary</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stockSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="cylinder_size" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-bold text-slate-950">Latest sales</h2>
        <div className="table-scroll mt-4 overflow-x-auto">
          {data.latestSales.length === 0 ? (
            <EmptyState title="No sales recorded" />
          ) : (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.latestSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{sale.product_name} <span className="text-slate-400">({sale.cylinder_size})</span></td>
                    <td className="px-4 py-3">{sale.quantity}</td>
                    <td className="px-4 py-3"><Badge tone="blue">{sale.payment_method}</Badge></td>
                    <td className="px-4 py-3">{sale.customer_name || 'Walk-in'}</td>
                    <td className="px-4 py-3 font-semibold">{formatMoney(sale.total_amount, business.currency)}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(sale.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </>
  );
}
