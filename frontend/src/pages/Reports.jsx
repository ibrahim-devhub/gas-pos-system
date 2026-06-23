import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download } from 'lucide-react';
import { Badge, Card, EmptyState, ErrorState, formatMoney, LoadingState, PageHeader } from '../components/UI.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { getSalesReport } from '../services/posService.js';
import { printDailySalesReport, printTransactionInvoice, toDateKey } from '../utils/pdfReports.js';

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportDate, setReportDate] = useState(toDateKey(new Date()));
  const { business } = useBusiness();

  useEffect(() => {
    getSalesReport(business.id)
      .then(setData)
      .catch((err) => setError(err.message || 'Unable to load reports.'))
      .finally(() => setLoading(false));
  }, [business.id]);

  if (loading) return <LoadingState label="Loading reports..." />;
  if (error) return <ErrorState message={error} />;

  const salesForDate = data.sales.filter((sale) => toDateKey(sale.created_at) === reportDate);

  return (
    <>
      <PageHeader title="Reports" description="Sales summary, revenue performance, top products, and recent transactions." />
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-slate-500">Revenue</p><p className="mt-2 text-2xl font-bold">{formatMoney(data.summary.revenue, business.currency)}</p></Card>
        <Card><p className="text-sm text-slate-500">Units sold</p><p className="mt-2 text-2xl font-bold">{data.summary.units_sold}</p></Card>
        <Card><p className="text-sm text-slate-500">Transactions</p><p className="mt-2 text-2xl font-bold">{data.summary.transactions}</p></Card>
        <Card><p className="text-sm text-slate-500">Average sale</p><p className="mt-2 text-2xl font-bold">{formatMoney(data.summary.average_sale, business.currency)}</p></Card>
      </div>

      <Card className="mt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-950">PDF documents</h2>
            <p className="mt-1 text-sm text-slate-500">Generate a clean invoice-style PDF for any day of sales.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Sales date</span>
              <input
                type="date"
                value={reportDate}
                onChange={(event) => setReportDate(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 sm:w-48"
              />
            </label>
            <button
              type="button"
              onClick={() => printDailySalesReport({ business, date: reportDate, sales: data.sales })}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
            >
              <Download className="h-4 w-4" />
              Generate daily PDF
            </button>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          {salesForDate.length} transaction{salesForDate.length === 1 ? '' : 's'} found for the selected day.
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="font-bold text-slate-950">Revenue chart</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatMoney(value, business.currency)} />
                <Line dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-slate-950">Top-selling gas products</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="cylinder_size" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="units" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-bold text-slate-950">Recent transactions</h2>
        <div className="table-scroll mt-4 overflow-x-auto">
          {data.recentTransactions.length === 0 ? (
            <EmptyState title="No transactions found" />
          ) : (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Sold by</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentTransactions.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-4 py-3 font-semibold">{sale.product_name} <span className="text-slate-400">({sale.cylinder_size})</span></td>
                    <td className="px-4 py-3">{sale.quantity}</td>
                    <td className="px-4 py-3"><Badge tone="blue">{sale.payment_method}</Badge></td>
                    <td className="px-4 py-3">{sale.sold_by || 'Unknown'}</td>
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
    </>
  );
}
