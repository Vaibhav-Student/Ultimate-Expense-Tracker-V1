import { ArrowDownWideNarrow, ArrowUpNarrowWide, Pencil, Trash2 } from "lucide-react";
import { useFinance } from "../../store/finance.jsx";
import { formatCurrency, displayShort } from "../../utils/format.js";
import { EmptyState } from "../ui/Field.jsx";
import { cn } from "../../utils/cn.js";

const COLS = [
  { id: "date", label: "Date" },
  { id: "description", label: "Description" },
  { id: "category", label: "Category" },
  { id: "account", label: "Method" },
  { id: "amount", label: "Amount" },
];

function TypeBadge({ type }) {
  return (
    <span className={cn(
      "inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest border shrink-0",
      type === "income" ? "bg-pinebg text-pine border-pine"
      : type === "transfer" ? "bg-ink text-paper border-ink"
      : "bg-rosebg text-editorial border-editorial"
    )}>
      {type === "income" ? "IN" : type === "transfer" ? "TR" : "OUT"}
      <span className="sr-only">{type}</span>
    </span>
  );
}

function routeOf(t) {
  if (t.type !== "transfer") return null;
  const from = t.fromAccount || t.account || "";
  const to = t.toAccount || "";
  return from && to ? `${from} → ${to}` : (from || to || "Transfer");
}

function SignedAmount({ t, currency, className }) {
  if (t.type === "income") {
    return <span className={cn("text-pine", className)}>+{formatCurrency(t.amountCents, currency)}</span>;
  }
  if (t.type === "transfer") {
    return <span className={cn("text-ink", className)}>⇄ {formatCurrency(t.amountCents, currency)}</span>;
  }
  return <span className={cn("text-ink", className)}>−{formatCurrency(t.amountCents, currency)}</span>;
}

export function TransactionTable({ rows, sort, onSort, onEdit, onDelete, onAdd }) {
  const { settings } = useFinance();

  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        title="Nothing on this page."
        body="No transactions match the current search and filters. File a new entry or loosen the filters."
        action={
          <button
            onClick={onAdd}
            className="min-h-[44px] px-6 bg-ink text-paper font-sans text-xs font-bold uppercase tracking-widest hover:bg-paper hover:text-ink border hover:border-ink transition-colors"
          >
            + Add transaction
          </button>
        }
      />
    );
  }

  const dirIcon = (id) => {
    if (sort.key !== id) return null;
    return sort.dir === "asc"
      ? <ArrowUpNarrowWide className="h-3.5 w-3.5 inline ml-1" strokeWidth={2} />
      : <ArrowDownWideNarrow className="h-3.5 w-3.5 inline ml-1" strokeWidth={2} />;
  };

  return (
    <>
      {/* Mobile: stacked cards */}
      <ul className="md:hidden divide-y divide-ink border border-ink bg-paper">
        {rows.map(t => (
          <li key={t.id} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs tnum">
                {displayShort(t.date)}
                {t.sample && <span className="ml-2 text-[10px] border border-ink px-1">SAMPLE</span>}
              </span>
              <TypeBadge type={t.type} />
            </div>
            <div className="flex items-start justify-between gap-3 mt-1.5">
              <div className="min-w-0">
                <p className="font-sans text-[15px] font-semibold leading-snug break-words">{t.description}</p>
                <p className="font-mono text-[11px] text-neutral-500 mt-0.5">
                  {t.type === "transfer" ? routeOf(t) : `${t.category} · ${t.account}`}{t.type !== "transfer" && t.merchant ? ` · ${t.merchant}` : ""}
                </p>
              </div>
              <p className="font-mono text-[15px] font-bold tnum whitespace-nowrap">
                <SignedAmount t={t} currency={settings.currency} />
              </p>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onEdit(t)}
                aria-label={`Edit ${t.description}`}
                className="flex-1 min-h-[44px] border border-ink inline-flex items-center justify-center gap-2 font-sans text-xs font-bold uppercase tracking-widest active:bg-ink active:text-paper"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.5} /> Edit
              </button>
              <button
                onClick={() => onDelete(t)}
                aria-label={`Delete ${t.description}`}
                className="flex-1 min-h-[44px] border border-ink inline-flex items-center justify-center gap-2 font-sans text-xs font-bold uppercase tracking-widest active:border-editorial active:text-editorial"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: full ledger table */}
      <div className="hidden md:block border border-ink bg-paper overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <caption className="sr-only">Transaction ledger, sortable. Amounts right-aligned in tabular figures.</caption>
          <thead>
            <tr className="bg-neutral-100 border-b-2 border-ink">
              {COLS.map(c => (
                <th key={c.id} scope="col" className={cn("font-mono text-[11px] uppercase tracking-widest text-neutral-600 font-medium", c.id === "amount" && "text-right")}>
                  <button
                    onClick={() => onSort(c.id)}
                    aria-label={`Sort by ${c.label}`}
                    className="w-full text-inherit px-4 py-3 min-h-[44px] inline-flex items-center gap-1 hover:text-ink focus-ring font-mono text-[11px] uppercase tracking-widest"
                    style={{ justifyContent: c.id === "amount" ? "flex-end" : "flex-start" }}
                  >
                    {c.label}{dirIcon(c.id)}
                  </button>
                </th>
              ))}
              <th scope="col" className="font-mono text-[11px] uppercase tracking-widest text-neutral-600 font-medium px-4 py-3 text-right">Type</th>
              <th scope="col" className="sr-only">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink">
            {rows.map(t => (
              <tr key={t.id} className="hover:bg-neutral-100 transition-colors">
                <td className="px-4 py-3 font-mono text-xs tnum whitespace-nowrap">
                  {displayShort(t.date)}
                  {t.sample && <span className="ml-2 text-[10px] border border-ink px-1">SAMPLE</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="block font-sans text-sm font-semibold leading-tight">{t.description}</span>
                  <span className="block font-mono text-[11px] text-neutral-500">
                    {t.id.slice(0, 9)}{t.merchant ? ` · ${t.merchant}` : ""}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest border", t.type === "transfer" ? "bg-ink text-paper border-ink" : "border-ink text-ink")}>{t.category}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{t.type === "transfer" ? routeOf(t) : t.account}</td>
                <td className="px-4 py-3 font-mono text-sm tnum text-right whitespace-nowrap font-medium">
                  <SignedAmount t={t} currency={settings.currency} />
                </td>
                <td className="px-4 py-3 text-right">
                  <TypeBadge type={t.type} />
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => onEdit(t)} aria-label={`Edit ${t.description}`} className="h-11 w-11 inline-flex items-center justify-center border border-transparent hover:border-ink transition-colors">
                    <Pencil className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => onDelete(t)} aria-label={`Delete ${t.description}`} className="h-11 w-11 inline-flex items-center justify-center border border-transparent hover:border-editorial hover:text-editorial transition-colors">
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
