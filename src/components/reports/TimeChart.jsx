import { useMemo, useState } from "react";
import { formatCurrency, monthKeyOf } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

const VIEWS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function mondayOf(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const shift = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - shift);
  return x;
}

function buildBuckets(transactions, view) {
  const now = new Date();
  const buckets = [];
  if (view === "daily") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      buckets.push({ key: toISO(d), label: String(d.getDate()), full: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) });
    }
  } else if (view === "weekly") {
    const thisMon = mondayOf(now);
    for (let i = 11; i >= 0; i--) {
      const mon = new Date(thisMon.getFullYear(), thisMon.getMonth(), thisMon.getDate() - i * 7);
      const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
      buckets.push({
        key: toISO(mon),
        label: `${mon.getDate()}/${mon.getMonth() + 1}`,
        full: `Week of ${mon.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`,
        from: toISO(mon),
        to: toISO(sun),
      });
    }
  } else if (view === "monthly") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.push({
        key,
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        full: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      });
    }
  } else {
    const years = [...new Set(transactions.map(t => t.date.slice(0, 4)))].sort();
    const list = years.length > 0 ? years : [String(now.getFullYear())];
    for (const y of list) buckets.push({ key: y, label: y, full: `Year ${y}` });
  }

  return buckets.map(b => {
    let income = 0, expenses = 0;
    for (const t of transactions) {
      const hit = b.from
        ? t.date >= b.from && t.date <= b.to
        : view === "monthly" ? monthKeyOf(t.date) === b.key
        : view === "yearly" ? t.date.slice(0, 4) === b.key
        : t.date === b.key;
      if (!hit) continue;
      if (t.type === "income") income += t.amountCents;
      else if (t.type === "expense") expenses += t.amountCents;
    }
    return { ...b, income, expenses };
  });
}

// Grouped income/expense bars with a Daily/Weekly/Monthly/Yearly switch.
// CSS-only, Newsprint styling, tabular alternative included.
export function TimeChart({ transactions, currency }) {
  const [view, setView] = useState("monthly");
  const buckets = useMemo(() => buildBuckets(transactions, view), [transactions, view]);
  const max = Math.max(1, ...buckets.flatMap(b => [b.income, b.expenses]));
  const totIn = buckets.reduce((a, b) => a + b.income, 0);
  const totOut = buckets.reduce((a, b) => a + b.expenses, 0);

  return (
    <div>
      <div className="grid grid-cols-4 border border-ink" role="tablist" aria-label="Chart granularity">
        {VIEWS.map(v => (
          <button
            key={v.id}
            role="tab"
            aria-selected={view === v.id}
            onClick={() => setView(v.id)}
            className={cn(
              "py-2.5 min-h-[44px] font-sans text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-colors",
              view === v.id ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-neutral-100"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 mt-3" aria-live="polite">
        In <span className="text-pine font-bold">{formatCurrency(totIn, currency)}</span>
        {" · "}Out <span className="text-editorial font-bold">{formatCurrency(totOut, currency)}</span>
      </p>

      {buckets.every(b => b.income === 0 && b.expenses === 0) ? (
        <p className="font-body text-sm text-neutral-600 border border-ink p-5 mt-3 text-center">Nothing filed in this window yet.</p>
      ) : (
        <div className="overflow-x-auto mt-2">
          <div
            role="img"
            aria-label={`${view} bar chart. Income total ${formatCurrency(totIn, currency)}, expense total ${formatCurrency(totOut, currency)}.`}
            className="flex items-end gap-1.5 h-48 min-w-[520px] border border-ink bg-paper p-3 pt-5"
          >
            {buckets.map(b => (
              <div key={b.key} className="flex-1 min-w-0 flex flex-col items-center gap-1 h-full justify-end" title={`${b.full}: in ${formatCurrency(b.income, currency)}, out ${formatCurrency(b.expenses, currency)}`}>
                <div className="flex items-end justify-center gap-[3px] h-full w-full">
                  <span
                    className="w-2 sm:w-3 bg-pine border border-ink"
                    style={{ height: `${b.income > 0 ? Math.max(4, (b.income / max) * 100) : 0}%` }}
                    aria-hidden="true"
                  />
                  <span
                    className="w-2 sm:w-3 bg-ink"
                    style={{ height: `${b.expenses > 0 ? Math.max(4, (b.expenses / max) * 100) : 0}%` }}
                    aria-hidden="true"
                  />
                </div>
                <span className="font-mono text-[9px] sm:text-[10px] text-neutral-500 truncate max-w-full">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 mt-2">
        <span className="inline-block h-2.5 w-2.5 bg-pine border border-ink mr-1.5" aria-hidden="true" />Income
        <span className="inline-block h-2.5 w-2.5 bg-ink ml-4 mr-1.5" aria-hidden="true" />Expenses
      </p>

      <details className="mt-3 border border-ink bg-paper no-print">
        <summary className="cursor-pointer px-4 py-3 font-sans text-xs font-bold uppercase tracking-widest min-h-[44px]">View chart data as table</summary>
        <div className="border-t border-ink px-4 py-2 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <caption className="sr-only">{view} income and expenses, tabular</caption>
            <thead><tr className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 text-left">
              <th className="py-1 pr-4 font-medium">Period</th>
              <th className="py-1 pr-4 font-medium text-right">Income</th>
              <th className="py-1 font-medium text-right">Expenses</th>
            </tr></thead>
            <tbody className="font-mono tnum">
              {buckets.map(b => (
                <tr key={b.key} className="border-t border-divider">
                  <td className="py-1.5 pr-4">{b.full}</td>
                  <td className="py-1.5 pr-4 text-right text-pine">{formatCurrency(b.income, currency)}</td>
                  <td className="py-1.5 text-right">{formatCurrency(b.expenses, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
