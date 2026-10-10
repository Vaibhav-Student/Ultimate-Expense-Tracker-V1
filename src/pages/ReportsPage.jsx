import { useMemo, useState } from "react";
import { Download, Printer, ArrowLeft, ArrowRight } from "lucide-react";
import { useFinance } from "../store/finance.jsx";
import { CategoryDonut, CategoryBars, CashflowTrend } from "../components/reports/Charts.jsx";
import { MonthCalendar, DayLedger } from "../components/reports/MonthCalendar.jsx";
import { TimeChart } from "../components/reports/TimeChart.jsx";
import { DateField } from "../components/ui/DateField.jsx";
import { formatCurrency, monthLabel, shiftMonth, currentMonthKey, toCSV, downloadFile } from "../utils/format.js";

export function ReportsPage() {
  const f = useFinance();
  const [from, setFrom] = useState(() => shiftMonth(f.month, -2).slice(0, 7) + "-01");
  const [to, setTo] = useState(() => f.month + "-28");
  const [calMonth, setCalMonth] = useState(() => currentMonthKey());
  const [selDay, setSelDay] = useState(null);

  const rows = useMemo(() => {
    return f.transactions
      .filter(t => (!from || t.date >= from) && (!to || t.date <= to))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [f.transactions, from, to]);

  const income = rows.filter(t => t.type === "income").reduce((a, t) => a + t.amountCents, 0);
  const expenses = rows.filter(t => t.type === "expense").reduce((a, t) => a + t.amountCents, 0);
  const net = income - expenses;
  const rate = income > 0 ? ((net / income) * 100).toFixed(1) : "0.0";

  const cats = useMemo(() => {
    const m = {};
    for (const t of rows) if (t.type === "expense") m[t.category] = (m[t.category] || 0) + t.amountCents;
    return Object.entries(m).map(([label, amountCents]) => ({ label, amountCents })).sort((a, b) => b.amountCents - a.amountCents);
  }, [rows]);

  const months = useMemo(() => {
    const keys = [...new Set(rows.map(t => t.date.slice(0, 7)))].sort();
    return keys.map(k => {
      const inM = rows.filter(t => t.date.slice(0, 7) === k);
      return {
        key: k,
        label: monthLabel(k),
        income: inM.filter(t => t.type === "income").reduce((a, t) => a + t.amountCents, 0),
        expenses: inM.filter(t => t.type === "expense").reduce((a, t) => a + t.amountCents, 0),
      };
    });
  }, [rows]);

  const budgetRows = f.budgets.filter(b => rows.some(t => t.date.slice(0, 7) === b.month && t.category === b.category));
  const enough = months.length >= 2;

  const exportCSV = () => {
    const head = ["month", "income", "expenses", "net"];
    const body = months.map(m => [m.label, (m.income / 100).toFixed(2), (m.expenses / 100).toFixed(2), ((m.income - m.expenses) / 100).toFixed(2)]);
    downloadFile("ledger-report.csv", toCSV([head, ...body]));
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-editorial font-bold">Desk E · Evidence</p>
          <h1 className="font-serif font-black tracking-tighter text-5xl sm:text-6xl leading-none mt-1">The Financial Record.</h1>
          <p className="font-body text-[15px] text-neutral-600 mt-2 max-w-2xl">
            {rows.length} entries in range · net {formatCurrency(net, f.settings.currency)} · savings {rate}%.
            {!enough && " Month-over-month comparison needs at least two months of data."}
          </p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={exportCSV} className="min-h-[44px] px-4 inline-flex items-center gap-2 border border-ink font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
            <Download className="h-4 w-4" strokeWidth={1.5} /> CSV
          </button>
          <button onClick={() => window.print()} className="min-h-[44px] px-4 inline-flex items-center gap-2 bg-ink text-paper font-sans text-xs font-bold uppercase tracking-widest hover:bg-paper hover:text-ink border hover:border-ink transition-colors">
            <Printer className="h-4 w-4" strokeWidth={1.5} /> Print
          </button>
        </div>
      </div>

      <div className="mt-5 border border-ink bg-paper p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 no-print">
        <div>
          <label htmlFor="rep-from" className="font-sans text-xs font-semibold uppercase tracking-widest text-neutral-600">From</label>
          <div className="mt-1">
            <DateField id="rep-from" value={from} onChange={setFrom} />
          </div>
        </div>
        <div>
          <label htmlFor="rep-to" className="font-sans text-xs font-semibold uppercase tracking-widest text-neutral-600">To</label>
          <div className="mt-1">
            <DateField id="rep-to" value={to} onChange={setTo} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 border border-ink bg-paper mt-4 print-block">
        {[
          ["Income", income], ["Expenses", expenses], ["Net", net],
        ].map(([l, v]) => (
          <div key={l} className="p-3 sm:p-4 border-r last:border-r-0 border-ink min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">{l}</p>
            <p className="font-mono font-bold text-lg sm:text-2xl tnum mt-1 break-words">{formatCurrency(v, f.settings.currency)}</p>
          </div>
        ))}
        <div className="p-3 sm:p-4 border-t lg:border-t-0 border-ink col-span-2 lg:col-span-1">
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">Savings rate</p>
          <p className="font-mono font-bold text-lg sm:text-2xl tnum mt-1">{rate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-12 lg:col-span-5 border border-ink bg-paper p-5 print-block">
          <h2 className="font-mono text-xs uppercase tracking-widest border-b border-ink pb-2">Spending by category</h2>
          <div className="mt-4"><CategoryDonut data={cats} currency={f.settings.currency} /></div>
        </div>
        <div className="col-span-12 lg:col-span-7 border border-ink bg-paper p-5 print-block">
          <h2 className="font-mono text-xs uppercase tracking-widest border-b border-ink pb-2">Category bars</h2>
          <div className="mt-4"><CategoryBars data={cats} currency={f.settings.currency} /></div>
        </div>
        <div className="col-span-12 border border-ink bg-paper p-4 sm:p-5 print-block">
          <h2 className="font-mono text-xs uppercase tracking-widest border-b border-ink pb-2">Cash-flow trend</h2>
          <div className="mt-4">
            {enough ? <CashflowTrend points={months} currency={f.settings.currency} /> : <p className="font-body text-sm text-neutral-600">Insufficient data for a reliable trend — file entries across two or more months.</p>}
          </div>
        </div>

        <div className="col-span-12 border border-ink bg-paper p-4 sm:p-5 print-block">
          <h2 className="font-mono text-xs uppercase tracking-widest border-b border-ink pb-2">Spending bars — over time</h2>
          <div className="mt-4">
            <TimeChart transactions={f.transactions} currency={f.settings.currency} />
          </div>
        </div>

        <div className="col-span-12 border border-ink bg-paper p-4 sm:p-5 print-block">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-mono text-xs uppercase tracking-widest">Daily ledger — calendar</h2>
            <div className="flex items-center border border-ink no-print" role="group" aria-label="Calendar month">
              <button onClick={() => setCalMonth(shiftMonth(calMonth, -1))} aria-label="Previous month" className="min-h-[44px] min-w-[44px] flex items-center justify-center border-r border-ink hover:bg-ink hover:text-paper transition-colors">
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              </button>
              <span className="px-4 font-mono text-xs uppercase tracking-widest whitespace-nowrap" aria-live="polite">{monthLabel(calMonth)}</span>
              <button onClick={() => setCalMonth(shiftMonth(calMonth, 1))} aria-label="Next month" className="min-h-[44px] min-w-[44px] flex items-center justify-center border-l border-ink hover:bg-ink hover:text-paper transition-colors">
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <MonthCalendar
              month={calMonth}
              transactions={f.transactions}
              currency={f.settings.currency}
              selected={selDay}
              onSelect={setSelDay}
            />
            <DayLedger
              date={selDay}
              transactions={f.transactions}
              currency={f.settings.currency}
              onClear={() => setSelDay(null)}
            />
          </div>
        </div>
      </div>

      {budgetRows.length > 0 && (
        <>
          {/* Mobile: stacked cards */}
          <div className="md:hidden mt-6 border border-ink bg-paper print-block">
            <p className="font-mono text-xs uppercase tracking-widest px-4 py-3 border-b-2 border-ink">Budget vs actual (in range)</p>
            <ul className="divide-y divide-ink">
              {budgetRows.map(b => {
                const spent = rows.filter(t => t.type === "expense" && t.category === b.category && t.date.slice(0, 7) === b.month).reduce((a, t) => a + t.amountCents, 0);
                return (
                  <li key={b.id} className="px-4 py-3 font-mono text-sm tnum">
                    <p className="font-sans text-sm font-bold">{b.category} <span className="font-mono text-[11px] font-normal text-neutral-500">· {b.month}</span></p>
                    <div className="flex justify-between mt-1"><span className="text-neutral-500 text-xs uppercase tracking-widest">Limit</span><span>{formatCurrency(b.limitCents, f.settings.currency)}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500 text-xs uppercase tracking-widest">Spent</span><span>{formatCurrency(spent, f.settings.currency)}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500 text-xs uppercase tracking-widest">Left</span><span className="font-bold">{formatCurrency(b.limitCents - spent, f.settings.currency)}</span></div>
                  </li>
                );
              })}
            </ul>
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block mt-6 border border-ink bg-paper overflow-x-auto print-block">
            <table className="w-full min-w-[640px]">
              <caption className="text-left font-mono text-xs uppercase tracking-widest px-4 py-3 border-b-2 border-ink">Budget vs actual (in range)</caption>
              <thead><tr className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 text-left">
                {["Category", "Month", "Limit", "Spent", "Left"].map(h => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}
              </tr></thead>
              <tbody className="font-mono text-sm tnum divide-y divide-ink">
                {budgetRows.map(b => {
                  const spent = rows.filter(t => t.type === "expense" && t.category === b.category && t.date.slice(0, 7) === b.month).reduce((a, t) => a + t.amountCents, 0);
                  return (
                    <tr key={b.id} className="hover:bg-neutral-100">
                      <td className="px-4 py-2">{b.category}</td>
                      <td className="px-4 py-2">{b.month}</td>
                      <td className="px-4 py-2">{formatCurrency(b.limitCents, f.settings.currency)}</td>
                      <td className="px-4 py-2">{formatCurrency(spent, f.settings.currency)}</td>
                      <td className="px-4 py-2">{formatCurrency(b.limitCents - spent, f.settings.currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
