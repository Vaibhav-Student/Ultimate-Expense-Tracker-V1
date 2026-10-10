import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useFinance } from "../store/finance.jsx";
import { formatCurrency, monthLabel, shiftMonth } from "../utils/format.js";
import { CategoryDonut, CategoryBars, CashflowTrend } from "../components/reports/Charts.jsx";
import { BudgetCard } from "../components/budgets/BudgetPanels.jsx";
import { TransactionTable } from "../components/transactions/TransactionTable.jsx";
import { displayShort } from "../utils/format.js";
import { cn } from "../utils/cn.js";

function MonthSelector() {
  const { month, setMonth } = useFinance();
  return (
    <div className="flex items-center border border-ink bg-paper no-print" role="group" aria-label="Reporting period">
      <button onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month" className="min-h-[44px] min-w-[44px] flex items-center justify-center border-r border-ink hover:bg-ink hover:text-paper transition-colors">
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
      </button>
      <span className="px-4 font-mono text-xs uppercase tracking-widest whitespace-nowrap" aria-live="polite">{monthLabel(month)}</span>
      <button onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month" className="min-h-[44px] min-w-[44px] flex items-center justify-center border-l border-ink hover:bg-ink hover:text-paper transition-colors">
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

export function OverviewPage({ onAdd, onEdit, onDelete, onNav }) {
  const f = useFinance();
  const { month } = f;
  const list = f.monthTx(month);
  const s = f.sums(list);
  const prev = f.sums(f.monthTx(shiftMonth(month, -1)));
  const balance = f.balance;
  const savingsRate = s.income > 0 ? ((s.income - s.expenses) / s.income) * 100 : 0;

  const pctChange = (cur, old) => {
    if (old === 0) return cur > 0 ? "+ new" : "—";
    const r = ((cur - old) / old) * 100;
    return `${r >= 0 ? "+" : ""}${r.toFixed(1)}%`;
  };

  const cats = f.byCategory(list);
  const monthBudgets = f.budgets.filter(b => b.month === month);
  const spentByCat = {};
  for (const t of list) if (t.type === "expense") spentByCat[t.category] = (spentByCat[t.category] || 0) + t.amountCents;

  // 6-month trend
  const trend = [];
  for (let i = 5; i >= 0; i--) {
    const k = shiftMonth(month, -i);
    const ss = f.sums(f.monthTx(k));
    trend.push({ key: k, label: k.slice(5), income: ss.income, expenses: ss.expenses });
  }

  // Insights (derived only)
  const insights = [];
  if (cats.length > 0) {
    const top = cats[0];
    insights.push({ h: "Heaviest column", b: `${top.label} drew ${formatCurrency(top.amountCents, f.settings.currency)} — the largest desk this month.` });
  }
  const biggest = [...list].filter(t => t.type === "expense").sort((a, b) => b.amountCents - a.amountCents)[0];
  if (biggest) insights.push({ h: "Largest single entry", b: `${biggest.description} — ${formatCurrency(biggest.amountCents, f.settings.currency)} on ${displayShort(biggest.date)}.` });
  insights.push({ h: "Month over month", b: `Spending ${pctChange(s.expenses, prev.expenses)} vs ${monthLabel(shiftMonth(month, -1))}; income ${pctChange(s.income, prev.income)}.` });
  if (monthBudgets.length > 0) {
    const left = monthBudgets.reduce((a, b) => a + Math.max(0, b.limitCents - (spentByCat[b.category] || 0)), 0);
    insights.push({ h: "Budget headroom", b: `${formatCurrency(left, f.settings.currency)} remains across ${monthBudgets.length} capped desks.` });
  }
  insights.push({ h: "Savings rate", b: `${savingsRate.toFixed(1)}% of income retained${s.income ? "" : " (no income filed)"}.` });

  const recent = [...list].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);

  const panels = [
    { no: "01", label: "Total Balance", value: formatCurrency(balance, f.settings.currency), note: "All-time net", delta: `${list.length} in month`, good: true },
    { no: "02", label: "Total Income", value: formatCurrency(s.income, f.settings.currency), note: monthLabel(month), delta: pctChange(s.income, prev.income), good: s.income >= prev.income },
    { no: "03", label: "Total Expenses", value: formatCurrency(s.expenses, f.settings.currency), note: `${s.count} entries`, delta: pctChange(s.expenses, prev.expenses), good: s.expenses <= prev.expenses },
    { no: "04", label: "Savings", value: formatCurrency(s.net, f.settings.currency), note: `Rate ${savingsRate.toFixed(1)}%`, delta: s.net >= 0 ? "Surplus" : "Deficit", good: s.net >= 0 },
  ];

  return (
    <div>
      {/* A. Controls */}
      <section aria-label="Reporting controls">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-editorial font-bold">Overview · {monthLabel(month)}</p>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <MonthSelector />
          <button onClick={onAdd} className="min-h-[44px] px-6 inline-flex items-center gap-2 bg-ink text-paper font-sans text-xs font-bold uppercase tracking-widest hover:bg-paper hover:text-ink border hover:border-ink transition-colors">
            <Plus className="h-4 w-4" strokeWidth={2} /> Add transaction
          </button>
        </div>
      </section>

      {/* B. Summary grid */}
      <section aria-label="Financial summary" className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-ink bg-paper">
          {panels.map((p, i) => (
            <div key={p.no} className={cn("p-5", i !== 0 && "border-t sm:border-t-0 sm:border-l border-ink", i >= 2 && "max-sm:border-t lg:border-l", i === 2 && "sm:border-l-0 lg:border-l")}>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-neutral-500">No. {p.no}</span>
                <span className={cn("font-bold", p.good ? "text-pine" : "text-editorial")}>{p.delta}</span>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 mt-3">{p.label}</p>
              <p className="font-mono font-bold text-3xl lg:text-[2rem] tnum tracking-tight mt-1 break-words">{p.value}</p>
              <p className="font-body text-[13px] text-neutral-600 mt-1">{p.note}</p>
            </div>
          ))}
        </div>
      </section>



      {/* C. Spending analysis */}
      <section aria-labelledby="spend-h" className="mt-10">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2 w-2 bg-editorial" aria-hidden="true" />
          <h2 id="spend-h" className="font-serif font-black text-3xl lg:text-4xl tracking-tight">Where the money goes.</h2>
        </div>
        <div className="grid grid-cols-12 gap-6 mt-5">
          <div className="col-span-12 lg:col-span-5 border border-ink bg-paper p-5">
            <h3 className="font-mono text-xs uppercase tracking-widest border-b border-ink pb-2">By category · donut</h3>
            <div className="mt-4"><CategoryDonut data={cats} currency={f.settings.currency} /></div>
          </div>
          <div className="col-span-12 lg:col-span-7 border border-ink bg-paper p-5">
            <h3 className="font-mono text-xs uppercase tracking-widest border-b border-ink pb-2">Category comparison · bars</h3>
            <div className="mt-4"><CategoryBars data={cats} currency={f.settings.currency} /></div>
          </div>
          <div className="col-span-12 border border-ink bg-paper p-5">
            <h3 className="font-mono text-xs uppercase tracking-widest border-b border-ink pb-2">Income vs expenses · 6 months</h3>
            <div className="mt-4"><CashflowTrend points={trend} currency={f.settings.currency} /></div>
          </div>
        </div>
        {/* Tabular alternative */}
        <details className="mt-4 border border-ink bg-paper">
          <summary className="cursor-pointer px-4 py-3 font-sans text-xs font-bold uppercase tracking-widest min-h-[44px]">View chart data as table</summary>
          <div className="border-t border-ink px-4 py-3 overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Spending by category, tabular</caption>
              <thead><tr className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 text-left">
                <th className="py-1 pr-4">Category</th><th className="py-1 pr-4 text-right">Amount</th><th className="py-1 text-right">Share</th>
              </tr></thead>
              <tbody className="font-mono tnum">
                {cats.map(c => (
                  <tr key={c.label} className="border-t border-divider">
                    <td className="py-1.5 pr-4">{c.label}</td>
                    <td className="py-1.5 pr-4 text-right">{formatCurrency(c.amountCents, f.settings.currency)}</td>
                    <td className="py-1.5 text-right">{s.expenses ? Math.round((c.amountCents / s.expenses) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      {/* D. Recent transactions */}
      <section aria-labelledby="recent-h" className="mt-10">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 id="recent-h" className="font-serif font-black text-3xl lg:text-4xl tracking-tight">The latest entries.</h2>
          <button onClick={() => onNav("transactions")} className="font-sans text-xs font-bold uppercase tracking-widest underline decoration-2 decoration-editorial underline-offset-4 hover:text-editorial min-h-[44px]">
            View all transactions
          </button>
        </div>
        <div className="mt-4">
          <TransactionTable
            rows={recent}
            sort={{ key: "date", dir: "desc" }}
            onSort={() => onNav("transactions")}
            onEdit={onEdit}
            onDelete={onDelete}
            onAdd={onAdd}
          />
        </div>
      </section>

      {/* E. Budget watch */}
      <section aria-labelledby="bw-h" className="mt-10">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 id="bw-h" className="font-serif font-black text-3xl lg:text-4xl tracking-tight">Budget watch.</h2>
          <button onClick={() => onNav("budgets")} className="font-sans text-xs font-bold uppercase tracking-widest underline decoration-2 decoration-editorial underline-offset-4 hover:text-editorial min-h-[44px]">
            Manage budgets
          </button>
        </div>
        {monthBudgets.length === 0 ? (
          <p className="mt-4 border border-ink bg-paper p-5 font-body text-sm text-neutral-600">No budgets for {monthLabel(month)}. Set caps on the Budgets desk.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {monthBudgets.slice(0, 3).map(b => (
              <BudgetCard key={b.id} budget={b} spentCents={spentByCat[b.category] || 0} onEdit={() => onNav("budgets")} onDelete={() => onNav("budgets")} />
            ))}
          </div>
        )}
      </section>

      {/* F. Month in review */}
      <section aria-labelledby="mir-h" className="mt-10">
        <h2 id="mir-h" className="font-serif font-black text-3xl lg:text-4xl tracking-tight">The month in review.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 border border-ink bg-paper mt-4">
          {insights.map((ins, i) => (
            <div key={ins.h} className={cn("p-5", i % 2 === 1 && "md:border-l border-ink", i >= 2 && "border-t border-ink")}>
              <p className="font-mono text-[11px] uppercase tracking-widest text-editorial">{String(i + 1).padStart(2, "0")} · {ins.h}</p>
              <p className="font-body text-[15px] leading-relaxed mt-2">{ins.b}</p>
            </div>
          ))}
        </div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 mt-3">All insights derived from filed entries. No forecasts.</p>
      </section>
    </div>
  );
}
