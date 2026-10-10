import { useFinance } from "../../store/finance.jsx";
import { formatCurrency } from "../../utils/format.js";

export function Ticker() {
  const { monthTx, month, sums, balance, settings } = useFinance();
  const s = sums(monthTx(month));
  const items = [
    { flag: "LEDGER", text: `${s.count} entries filed · ${month}` },
    { flag: "SPEND", text: `Outflows ${formatCurrency(s.expenses, settings.currency)}` },
    { flag: "INCOME", text: `Inflows ${formatCurrency(s.income, settings.currency)}` },
    { flag: "BALANCE", text: `Balance ${formatCurrency(balance, settings.currency)}` },
    { flag: "NOTE", text: "Sample rows marked SAMPLE — clear in Settings" },
  ];
  const row = [...items, ...items];
  return (
    <div className="bg-ink text-paper border-b border-ink overflow-hidden no-print" role="marquee" aria-label="Latest ledger headlines">
      <div className="flex whitespace-nowrap animate-ticker w-max">
        {[0, 1].map(half => (
          <div key={half} className="flex items-center" aria-hidden={half === 1}>
            {row.map((item, i) => (
              <span key={`${half}-${i}`} className="inline-flex items-center gap-3 px-6 py-2.5 font-mono text-xs uppercase tracking-widest">
                <span className="bg-editorial text-on-accent px-1.5 py-0.5 text-[10px] font-bold">{item.flag}</span>
                <span>{item.text}</span>
                <span className="text-paper opacity-40 pl-3">///</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
