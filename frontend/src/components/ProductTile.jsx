import { Badge, formatMoney } from './UI.jsx';

export default function ProductTile({ item, currency = 'KES', selected = false, onClick }) {
  const low = Number(item.quantity) <= Number(item.low_stock_limit);
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group flex min-h-[300px] w-full flex-col overflow-hidden rounded-xl border bg-white text-left shadow-soft transition ${
        selected ? 'border-brand-600 ring-2 ring-brand-100' : 'border-slate-200 hover:-translate-y-0.5 hover:border-brand-200'
      }`}
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-orange-50">
        <div className="absolute left-4 top-4">
          <Badge tone={low ? 'orange' : 'green'}>{low ? 'Low Stock' : 'In Stock'}</Badge>
        </div>
        <ProductVisual item={item} />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-2 font-bold leading-5 text-slate-950">{item.product_name}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{item.cylinder_size}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
            {item.quantity} left
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
          <div className="rounded-lg bg-slate-50 p-2">
            <p>Buy price</p>
            <p className="mt-1 font-bold text-slate-800">{formatMoney(item.buying_price, currency)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <p>Limit</p>
            <p className="mt-1 font-bold text-slate-800">{item.low_stock_limit}</p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="rounded-xl bg-slate-950 px-4 py-3 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Selling price</p>
            <p className="mt-1 text-xl font-black">{formatMoney(item.selling_price, currency)}</p>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

function ProductVisual({ item }) {
  const name = `${item.product_name} ${item.cylinder_size}`.toLowerCase();
  if (name.includes('regulator')) return <RegulatorVisual />;
  if (name.includes('burner')) return <BurnerVisual />;
  return <CylinderVisual label={item.cylinder_size} />;
}

function CylinderVisual({ label }) {
  return (
    <div className="relative h-32 w-24">
      <div className="absolute left-1/2 top-0 h-7 w-14 -translate-x-1/2 rounded-t-2xl border-4 border-slate-800 bg-slate-900 shadow-lg" />
      <div className="absolute left-1/2 top-5 h-5 w-8 -translate-x-1/2 rounded-md bg-slate-800" />
      <div className="absolute inset-x-2 bottom-2 top-8 rounded-[28px] bg-gradient-to-r from-orange-700 via-orange-500 to-orange-300 shadow-2xl">
        <div className="absolute inset-x-2 top-3 h-8 rounded-full bg-white/20" />
        <div className="absolute left-3 top-10 h-16 w-4 rounded-full bg-white/25 blur-[1px]" />
        <div className="absolute inset-x-4 bottom-5 rounded-lg bg-slate-950/90 px-2 py-1 text-center text-xs font-black text-white">
          {label}
        </div>
      </div>
      <div className="absolute bottom-0 left-4 h-4 w-16 rounded-full bg-slate-900/20 blur-sm" />
    </div>
  );
}

function RegulatorVisual() {
  return (
    <div className="relative h-28 w-36">
      <div className="absolute left-2 top-9 h-11 w-20 rounded-full bg-gradient-to-r from-slate-700 via-slate-400 to-slate-200 shadow-xl" />
      <div className="absolute left-16 top-11 h-7 w-16 rounded-r-full bg-gradient-to-r from-orange-500 to-orange-300 shadow-lg" />
      <div className="absolute left-8 top-5 h-10 w-10 rounded-full border-4 border-slate-800 bg-slate-100 shadow-md" />
      <div className="absolute bottom-3 left-5 h-4 w-28 rounded-full bg-slate-900/20 blur-sm" />
    </div>
  );
}

function BurnerVisual() {
  return (
    <div className="relative h-28 w-36">
      <div className="absolute left-5 top-14 h-12 w-28 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-600 to-slate-400 shadow-xl" />
      <div className="absolute left-11 top-5 h-16 w-16 rounded-full border-[10px] border-slate-900 bg-orange-300 shadow-lg" />
      <div className="absolute left-[58px] top-12 h-7 w-7 rounded-full bg-slate-950" />
      <div className="absolute bottom-0 left-4 h-4 w-28 rounded-full bg-slate-900/20 blur-sm" />
    </div>
  );
}
