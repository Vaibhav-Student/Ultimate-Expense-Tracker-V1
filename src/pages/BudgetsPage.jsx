import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useFinance } from "../store/finance.jsx";
import { BudgetCard } from "../components/budgets/BudgetPanels.jsx";
import { Dialog, Confirm } from "../components/ui/Dialog.jsx";
import { BudgetForm } from "../components/budgets/BudgetPanels.jsx";
import { formatCurrency, monthLabel, shiftMonth } from "../utils/format.js";

export function BudgetsPage() {
  const f = useFinance();
  const [month, setMonth] = useState(f.month);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const list = f.monthTx(month);
  const spentByCat = {};
  for (const t of list) if (t.type === "expense") spentByCat[t.category] = (spentByCat[t.category] || 0) + t.amountCents;
  const rows = f.budgets.filter(b => b.month === month);
  const totalLimit = rows.reduce((a, b) => a + b.limitCents, 0);

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-editorial font-bold">Desk C · Caps &amp; limits</p>
      <h1 className="font-serif font-black tracking-tighter text-5xl sm:text-6xl leading-none mt-1">The Monthly Budget.</h1>
      <p className="font-body text-[15px] text-neutral-600 mt-2 max-w-2xl">
        {rows.length} capped desks for {monthLabel(month)} · {formatCurrency(totalLimit, f.settings.currency)} committed.
        Statuses derive from actual spending; warn at {Math.round((f.settings.warningAt ?? 0.8) * 100)}% (change in Settings).
      </p>

      <div className="flex flex-wrap items-center gap-3 mt-5 no-print">
        <div className="flex items-center border border-ink bg-paper" role="group" aria-label="Budget month">
          <button onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month" className="min-h-[44px] min-w-[44px] flex items-center justify-center border-r border-ink hover:bg-ink hover:text-paper transition-colors">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <span className="px-4 font-mono text-xs uppercase tracking-widest" aria-live="polite">{monthLabel(month)}</span>
          <button onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month" className="min-h-[44px] min-w-[44px] flex items-center justify-center border-l border-ink hover:bg-ink hover:text-paper transition-colors">
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="min-h-[44px] px-6 inline-flex items-center gap-2 bg-ink text-paper font-sans text-xs font-bold uppercase tracking-widest hover:bg-paper hover:text-ink border hover:border-ink transition-colors">
          <Plus className="h-4 w-4" strokeWidth={2} /> New budget
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 border border-ink bg-paper p-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-500">No caps set</p>
          <h2 className="font-serif font-black text-2xl mt-2">A blank budget page.</h2>
          <p className="font-body text-sm text-neutral-600 mt-2">Create your first category cap — e.g. Food &amp; Dining, ₹12,000.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {rows.map(b => (
            <BudgetCard
              key={b.id}
              budget={b}
              spentCents={spentByCat[b.category] || 0}
              onEdit={(x) => { setEditing(x); setFormOpen(true); }}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit budget cap" : "Create budget cap"} kicker={`Month · ${month}`}>
        <BudgetForm initial={editing} month={month} onSaved={() => setFormOpen(false)} />
      </Dialog>
      <Confirm
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Remove this budget?"
        body={`The ${deleting?.category} cap for ${deleting?.month} will be struck from the record. Past spending stays in the ledger.`}
        confirmLabel="Remove budget"
        onConfirm={() => { f.deleteBudget(deleting.id); setDeleting(null); }}
      />
    </div>
  );
}
