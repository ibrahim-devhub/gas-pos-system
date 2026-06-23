import { Link } from 'react-router-dom';
import { BarChart3, Boxes, CheckCircle2, Flame, Receipt, ShieldCheck, Smartphone } from 'lucide-react';

const features = [
  { icon: Receipt, title: 'Fast POS checkout', text: 'Record cylinder sales, customer names, and payment methods from one clean workflow.' },
  { icon: Boxes, title: 'Live stock control', text: 'Stock drops automatically after each sale with low-stock warnings for refill planning.' },
  { icon: BarChart3, title: 'Sales analytics', text: 'Track revenue trends, top-selling products, and recent transactions in real time.' },
  { icon: ShieldCheck, title: 'Role-based access', text: 'JWT authentication with admin and cashier roles keeps key operations protected.' }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white">
              <Flame className="h-5 w-5 text-flame-400" />
            </div>
            <span className="text-lg font-bold text-slate-950">GasPOS</span>
          </Link>
          <Link to="/login" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Sign in
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.22),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(37,99,235,0.22),transparent_30%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
                <Smartphone className="h-4 w-4 text-flame-400" />
                Built for LPG retailers and delivery desks
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">
                Run gas sales, stock, and reports from one POS dashboard.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                GasPOS gives LPG businesses a modern sales counter, inventory tracker, user control, and revenue reporting system that is ready for daily operations.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/login" className="rounded-lg bg-flame-500 px-5 py-3 text-center text-sm font-bold text-white hover:bg-flame-600">
                  Open dashboard
                </Link>
                <a href="#features" className="rounded-lg border border-white/15 px-5 py-3 text-center text-sm font-bold text-white hover:bg-white/10">
                  Explore features
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <div className="rounded-xl bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Today&apos;s revenue</p>
                    <p className="mt-1 text-3xl font-bold text-slate-950">KES 48,900</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">+18%</span>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {['6kg', '13kg', '50kg'].map((item, index) => (
                    <div key={item} className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-600">{item} cylinders</p>
                      <p className="mt-3 text-2xl font-bold text-slate-950">{[42, 30, 12][index]}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-3">
                  {['M-Pesa payment recorded', 'Stock reduced automatically', 'Receipt ready for customer'].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-950">Everything your LPG counter needs</h2>
            <p className="mt-3 text-slate-500">Designed for fast transactions, accurate inventory, and clear daily business visibility.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-bold text-slate-950">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
