import { useMemo } from "react";
import { formatCurrency, displayDate, todayISO } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

const WD = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

function monthCells(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Monday start
  const days = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(`${monthKey}-${String(d).padStart(2, "0")}`);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// Monthly grid: one cell per day with that day's expense total and income marker.
// All figures derive from the transaction list passed in.
export function MonthCalendar({ month, transactions, currency, selected, onSelect }) {
  const today = todayISO();
  const days = useMemo(() => {
    const map = {};
    for (const t of transactions) {
      if (t.date.slice(0, 7) !== month) continue;
      const e = map[t.date] || (map[t.date] = { exp: 0, inc: 0, n: 0 });
      if (t.type === "income") e.inc += t.amountCents;
      else if (t.type === "expense") e.exp += t.amountCents;
      e.n += 1;
    }
    return map;
  }, [transactions, month]);

  const monthExp = Object.values(days).reduce((a, d) => a + d.exp, 0);
  const monthInc = Object.values(days).reduce((a, d) => a + d.inc, 0);

  return (
    <div>
      <div className="grid grid-cols-7 border border-ink bg-ink gap-px" role="grid" aria-label={`Daily ledger for ${month}`}>
        {WD.map(w => (
          <span key={w} className="bg-ink text-paper font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-center py-1.5">
            {w}
          </span>
        ))}
        {monthCells(month).map((iso, i) => {
          if (!iso) return <span key={`x-${i}`} className="bg-paper min-h-[64px] sm:min-h-[76px]" aria-hidden="true" />;
          const d = days[iso] || { exp: 0, inc: 0, n: 0 };
          const isSel = selected === iso;
          const isToday = iso === today;
          return (
            <button
              key={iso}
              role="gridcell"
              onClick={() => onSelect?.(isSel ? null : iso)}
              aria-pressed={isSel}
              aria-label={`${displayDate(iso)}: ${d.n} entries, expenses ${formatCurrency(d.exp, currency)}, income ${formatCurrency(d.inc, currency)}`}
              className={cn(
                "min-h-[64px] sm:min-h-[76px] p-1 text-left align-top transition-colors focus-ring",
                isSel ? "bg-ink text-paper" : "bg-paper hover:bg-neutral-100",
                isToday && "ring-2 ring-inset ring-editorial"
              )}
            >
              <span className={cn("block font-mono text-xs font-bold tnum", isSel ? "text-paper" : d.n ? "text-ink" : "text-neutral-400")}>
                {Number(iso.slice(8))}
              </span>
              {d.exp > 0 ? (
                <span className={cn("block font-mono text-[10px] sm:text-[11px] tnum truncate", isSel ? "text-paper" : "text-editorial")}>
                  −{formatCurrency(d.exp, currency)}
                </span>
              ) : (
                <span className={cn("block font-mono text-[10px]", isSel ? "text-paper" : "text-neutral-300")} aria-hidden="true">·</span>
              )}
              {d.inc > 0 && (
                <span className={cn("block font-mono text-[10px] sm:text-[11px] tnum truncate", isSel ? "text-paper" : "text-pine")}>
                  +{formatCurrency(d.inc, currency)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
        <span><span className="inline-block h-2.5 w-2.5 bg-editorial mr-1.5" aria-hidden="true" />Expenses · {formatCurrency(monthExp, currency)}</span>
        <span><span className="inline-block h-2.5 w-2.5 bg-pine mr-1.5" aria-hidden="true" />Income · {formatCurrency(monthInc, currency)}</span>
        <span><span className="inline-block h-2.5 w-2.5 border-2 border-editorial mr-1.5" aria-hidden="true" />Today</span>
        <span><span className="inline-block h-2.5 w-2.5 bg-ink mr-1.5" aria-hidden="true" />Selected day</span>
      </div>
    </div>
  );
}

// Entries filed on one day, shown under the calendar on selection.
export function DayLedger({ date, transactions, currency, onClear }) {
  const list = useMemo(
    () => transactions.filter(t => t.date === date).sort((a, b) => b.amountCents - a.amountCents),
    [transactions, date]
  );
  if (!date) return null;
  const out = list.filter(t => t.type === "expense").reduce((a, t) => a + t.amountCents, 0);
  const inn = list.filter(t => t.type === "income").reduce((a, t) => a + t.amountCents, 0);

  return (
    <div className="mt-4 border-2 border-ink bg-paper">
      <div className="flex items-center justify-between gap-3 border-b-2 border-ink px-4 py-2.5 flex-wrap">
        <p className="font-serif font-bold text-lg">
          {displayDate(date)} <span className="font-mono text-[11px] font-normal uppercase tracking-widest text-neutral-500">· {list.length} entries</span>
        </p>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tnum">
            <span className="text-editorial">−{formatCurrency(out, currency)}</span>
            {" / "}
            <span className="text-pine">+{formatCurrency(inn, currency)}</span>
          </span>
          <button
            onClick={onClear}
            className="min-h-[44px] px-3 border border-ink font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="px-4 py-5 font-body text-sm text-neutral-600">A quiet day — nothing filed on this date.</p>
      ) : (
        <ul className="divide-y divide-ink">
          {list.map(t => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-100 transition-colors">
              <span className="flex-1 min-w-0">
                <span className="block font-sans text-sm font-semibold truncate">{t.description}</span>
                <span className="block font-mono text-[11px] text-neutral-500">{t.type === "transfer" ? `${t.fromAccount || t.account} → ${t.toAccount || ""}` : `${t.category} · ${t.account}`}</span>
              </span>
              <span className={cn("font-mono text-sm font-bold tnum whitespace-nowrap", t.type === "income" ? "text-pine" : "text-ink")}>
                {t.type === "income" ? "+" : t.type === "transfer" ? "⇄ " : "−"}{formatCurrency(t.amountCents, currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
