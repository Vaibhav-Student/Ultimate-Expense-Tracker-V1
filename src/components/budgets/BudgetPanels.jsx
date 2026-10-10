import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useFinance } from "../../store/finance.jsx";
import { formatCurrency } from "../../utils/format.js";
import { Progress, StatusBadge } from "../ui/Field.jsx";
import { Field, inputCls } from "../ui/Field.jsx";
import { cn } from "../../utils/cn.js";

export function budgetStatus(spent, limit, warnAt) {
  if (limit <= 0) return "On Track";
  const r = spent / limit;
  if (r > 1) return "Budget Exceeded";
  if (r >= warnAt) return "Approaching Limit";
  return "On Track";
}

export function BudgetCard({ budget, spentCents, onEdit, onDelete }) {
  const { settings } = useFinance();
  const warnAt = settings.warningAt ?? 0.8;
  const status = budgetStatus(spentCents, budget.limitCents, warnAt);
  const pct = budget.limitCents > 0 ? (spentCents / budget.limitCents) * 100 : 0;
  const remaining = budget.limitCents - spentCents;

  return (
    <article className="border border-ink bg-paper p-5 hard-shadow-hover">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif font-bold text-xl leading-tight">{budget.category}</h3>
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 mt-1">{budget.month} · monthly cap</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 space-y-1.5 font-mono text-sm tnum">
        <div className="flex justify-between"><span className="text-neutral-500 text-xs uppercase tracking-widest">Spent</span><span className="font-bold">{formatCurrency(spentCents, settings.currency)}</span></div>
        <div className="flex justify-between"><span className="text-neutral-500 text-xs uppercase tracking-widest">Limit</span><span>{formatCurrency(budget.limitCents, settings.currency)}</span></div>
        <div className="flex justify-between">
          <span className="text-neutral-500 text-xs uppercase tracking-widest">Left</span>
          <span className={cn("font-bold", remaining < 0 ? "text-editorial" : "text-pine")}>
            {remaining < 0 ? "−" : ""}{formatCurrency(Math.abs(remaining), settings.currency)}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <Progress pct={pct} status={status} />
        <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 mt-2">
          {Math.min(999, Math.round(pct))}% consumed · warn at {Math.round(warnAt * 100)}%
        </p>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={() => onEdit(budget)} aria-label={`Edit ${budget.category} budget`} className="flex-1 min-h-[44px] border border-ink inline-flex items-center justify-center gap-2 font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
          <Pencil className="h-4 w-4" strokeWidth={1.5} /> Edit
        </button>
        <button onClick={() => onDelete(budget)} aria-label={`Remove ${budget.category} budget`} className="flex-1 min-h-[44px] border border-ink inline-flex items-center justify-center gap-2 font-sans text-xs font-bold uppercase tracking-widest hover:border-editorial hover:text-editorial transition-colors">
          <Trash2 className="h-4 w-4" strokeWidth={1.5} /> Remove
        </button>
      </div>
    </article>
  );
}

export function BudgetForm({ initial, month, onSaved }) {
  const { categories, upsertBudget } = useFinance();
  const [category, setCategory] = useState(initial?.category || categories.expense[0]);
  const [limit, setLimit] = useState(initial ? String((initial.limitCents / 100).toFixed(0)) : "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const res = upsertBudget({ category, limit, month: initial?.month || month });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    setError("");
    onSaved?.(res.budget);
  };

  return (
    <form onSubmit={submit} noValidate aria-label={initial ? "Edit budget" : "Create budget"}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Category" htmlFor="bg-cat">
          <select id="bg-cat" value={category} onChange={e => setCategory(e.target.value)} className={cn(inputCls, "cursor-pointer bg-paper")} style={{ borderRadius: 0 }}>
            {categories.expense.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Monthly limit" error={error} htmlFor="bg-limit">
          <input id="bg-limit" type="number" min="1" step="1" inputMode="numeric" value={limit} onChange={e => setLimit(e.target.value)} placeholder="8000" className={inputCls} style={{ borderRadius: 0 }} />
        </Field>
      </div>
      <button type="submit" disabled={busy} className="w-full mt-5 min-h-[44px] bg-ink text-paper font-sans text-xs font-bold uppercase tracking-widest hover:bg-paper hover:text-ink border hover:border-ink transition-colors disabled:opacity-60">
        {busy ? "Setting…" : initial ? "Save limit" : "Create budget"}
      </button>
    </form>
  );
}
