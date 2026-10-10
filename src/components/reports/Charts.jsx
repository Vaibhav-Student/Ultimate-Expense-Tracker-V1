import { formatCurrency } from "../../utils/format.js";

// Monochrome editorial charts (no chart lib): CSS donut + bars + trend.
// Every visual has a tabular alternative and accessible description.
const INKS = ["#111111", "#3d3d3d", "#6b6b6b", "#8a8a8a", "#a8a8a8", "#CC0000", "#276749", "#525252"];

export function CategoryDonut({ data, currency }) {
  const total = data.reduce((a, d) => a + d.amountCents, 0);
  if (total <= 0) return <p className="font-body text-sm text-neutral-600">No expense data for this period.</p>;

  const sliced = data.slice(0, 8);
  const cum = sliced.reduce((arr, d) => [...arr, (arr[arr.length - 1] || 0) + d.amountCents], []);
  const stops = sliced.map((d, i) => {
    const from = ((cum[i] - d.amountCents) / total) * 360;
    const to = (cum[i] / total) * 360;
    return `${INKS[i % INKS.length]} ${from}deg ${to}deg`;
  });
  const top = data[0];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div
        className="donut shrink-0"
        role="img"
        aria-label={`Expense distribution. Largest: ${top.label}, ${formatCurrency(top.amountCents, currency)}.`}
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
      >
        <div className="donut-hole">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Total</p>
            <p className="font-mono font-bold text-sm tnum">{formatCurrency(total, currency)}</p>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {data.slice(0, 8).map((d, i) => (
          <li key={d.label} className="flex items-center gap-2 font-mono text-xs">
            <span className="h-3 w-3 border border-ink shrink-0" style={{ background: INKS[i % INKS.length] }} aria-hidden="true" />
            <span className="flex-1 uppercase tracking-widest truncate">{d.label}</span>
            <span className="tnum font-bold">{total ? Math.round((d.amountCents / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CategoryBars({ data, currency }) {
  const max = Math.max(1, ...data.map(d => d.amountCents));
  if (data.length === 0) return <p className="font-body text-sm text-neutral-600">No category spending to compare.</p>;
  return (
    <ul className="space-y-3 sm:space-y-2.5" aria-label="Category spending comparison">
      {data.slice(0, 10).map(d => (
        <li key={d.label} className="sm:grid sm:grid-cols-12 sm:items-center sm:gap-2">
          <div className="flex items-baseline justify-between gap-2 sm:contents">
            <span className="font-sans text-xs font-semibold uppercase tracking-wide truncate min-w-0 sm:order-1 sm:col-span-4">{d.label}</span>
            <span className="font-mono text-xs tnum shrink-0 sm:order-3 sm:col-span-2 sm:text-right">{formatCurrency(d.amountCents, currency)}</span>
          </div>
          <span className="block mt-1.5 sm:mt-0 h-5 border border-ink bg-paper relative overflow-hidden sm:order-2 sm:col-span-6" role="img" aria-label={`${d.label}: ${formatCurrency(d.amountCents, currency)}`}>
            <span className="absolute inset-y-0 left-0 bg-ink" style={{ width: `${(d.amountCents / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function CashflowTrend({ points, currency }) {
  // points: [{key,label,income,expenses}]
  const max = Math.max(1, ...points.flatMap(p => [p.income, p.expenses]));
  return (
    <div role="img" aria-label={`Cash flow trend across ${points.length} months.`} className="space-y-3">
      {points.map(p => (
        <div key={p.key}>
          <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
            <span>{p.label}</span>
            <span className="tnum">IN {formatCurrency(p.income, currency)} · OUT {formatCurrency(p.expenses, currency)}</span>
          </div>
          <div className="mt-1 space-y-1">
            <div className="h-3 border border-ink relative overflow-hidden" title={`Income ${formatCurrency(p.income, currency)}`}>
              <div className="absolute inset-y-0 left-0 bg-pine" style={{ width: `${(p.income / max) * 100}%` }} />
            </div>
            <div className="h-3 border border-ink relative overflow-hidden" title={`Expenses ${formatCurrency(p.expenses, currency)}`}>
              <div className="absolute inset-y-0 left-0 bg-ink" style={{ width: `${(p.expenses / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
      <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
        <span className="inline-block h-2.5 w-2.5 bg-pine border border-ink mr-1" /> Income
        <span className="inline-block h-2.5 w-2.5 bg-ink ml-4 mr-1" /> Expenses
      </p>
    </div>
  );
}
