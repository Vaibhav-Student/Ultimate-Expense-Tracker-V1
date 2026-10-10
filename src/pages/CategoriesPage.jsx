import { useState } from "react";
import {
  Home, UtensilsCrossed, Car, ShoppingBag, HeartPulse, Zap, Clapperboard,
  GraduationCap, Plane, Scissors, RefreshCw, Tag, Briefcase, TrendingUp, Gift, Wallet, Landmark,
} from "lucide-react";
import { useFinance } from "../store/finance.jsx";
import { Confirm } from "../components/ui/Dialog.jsx";
import { inputCls } from "../components/ui/Field.jsx";
import { IconBox } from "../components/ui/Card.jsx";
import { cn } from "../utils/cn.js";

const ICONS = [Home, UtensilsCrossed, Car, ShoppingBag, HeartPulse, Zap, Clapperboard, GraduationCap, Plane, Scissors, RefreshCw, Tag, Briefcase, TrendingUp, Gift, Wallet, Landmark];

function iconFor(name, i) {
  return ICONS[(name.length + i * 5) % ICONS.length];
}

function CategoryList({ kind, title, blurb }) {
  const f = useFinance();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState("");
  const [deleting, setDeleting] = useState(null);

  const counts = {};
  for (const t of f.transactions) {
    const k = t.type === "income" ? "income" : "expense";
    if (k === kind) counts[t.category] = (counts[t.category] || 0) + 1;
  }

  const create = (e) => {
    e.preventDefault();
    const r = f.addCategory(kind, name);
    if (!r.ok) { setError(r.error); return; }
    setName(""); setError(""); setAdding(false);
  };

  const rename = (e) => {
    e.preventDefault();
    const r = f.renameCategory(kind, renaming, newName);
    if (!r.ok) { setError(r.error); return; }
    setRenaming(null); setNewName(""); setError("");
  };

  return (
    <section aria-labelledby={`${kind}-h`} className="border border-ink bg-paper">
      <div className="border-b-2 border-ink px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 id={`${kind}-h`} className="font-serif font-black text-2xl tracking-tight">{title}</h2>
          <p className="font-body text-[13px] text-neutral-600 mt-0.5">{blurb}</p>
        </div>
        <button onClick={() => setAdding(v => !v)} aria-expanded={adding} className="min-h-[44px] px-4 border border-ink font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors no-print">
          + New
        </button>
      </div>

      {adding && (
        <form onSubmit={create} className="border-b border-ink p-4 flex flex-col sm:flex-row gap-2 no-print">
          <label htmlFor={`${kind}-new`} className="sr-only">New {kind} category name</label>
          <input id={`${kind}-new`} value={name} onChange={e => setName(e.target.value)} maxLength={32} placeholder="e.g. Pet Care" className={inputCls} style={{ borderRadius: 0 }} />
          <button type="submit" className="min-h-[44px] px-6 bg-ink text-paper font-sans text-xs font-bold uppercase tracking-widest shrink-0">File it</button>
        </form>
      )}
      {error && <p role="alert" className="px-5 py-2 font-mono text-xs uppercase tracking-widest text-editorial border-b border-ink">{error}</p>}

      <ul className="divide-y divide-ink">
        {f.categories[kind].map((c, i) => {
          const Icon = iconFor(c, i);
          return (
            <li key={c} className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-100 transition-colors">
              <IconBox className="h-10 w-10 shrink-0"><Icon className="h-5 w-5" strokeWidth={1.5} /></IconBox>
              <div className="flex-1 min-w-0">
                {renaming === c ? (
                  <form onSubmit={rename} className="flex gap-2 no-print">
                    <label htmlFor={`rn-${kind}-${i}`} className="sr-only">Rename {c}</label>
                    <input id={`rn-${kind}-${i}`} value={newName} onChange={e => setNewName(e.target.value)} maxLength={32} className={inputCls} style={{ borderRadius: 0 }} />
                    <button type="submit" className="min-h-[44px] px-3 border border-ink font-sans text-xs font-bold uppercase">Save</button>
                    <button type="button" onClick={() => setRenaming(null)} className="min-h-[44px] px-3 font-sans text-xs uppercase">Cancel</button>
                  </form>
                ) : (
                  <>
                    <p className="font-sans text-sm font-bold truncate">{c}</p>
                    <p className="font-mono text-[11px] text-neutral-500">{counts[c] || 0} entries filed</p>
                  </>
                )}
              </div>
              {renaming !== c && (
                <div className="flex gap-1 no-print">
                  <button onClick={() => { setRenaming(c); setNewName(c); }} aria-label={`Rename ${c}`} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-transparent hover:border-ink font-sans text-xs font-bold uppercase tracking-widest">
                    Rename
                  </button>
                  <button onClick={() => setDeleting(c)} aria-label={`Delete ${c}`} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-transparent hover:border-editorial hover:text-editorial font-sans text-xs font-bold uppercase tracking-widest">
                    Delete
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Confirm
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete “${deleting}”?`}
        body={`Historical entries filed under “${deleting}” will be reassigned to “${kind === "income" ? "Other Income" : "Other"}” — never silently dropped. Budgets on this desk are removed.`}
        confirmLabel="Reassign & delete"
        onConfirm={() => { f.deleteCategory(kind, deleting); setDeleting(null); }}
      />
    </section>
  );
}

export function CategoriesPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-editorial font-bold">Desk D · Taxonomy</p>
      <h1 className="font-serif font-black tracking-tighter text-5xl sm:text-6xl leading-none mt-1">The Classification Desk.</h1>
      <p className="font-body text-[15px] text-neutral-600 mt-2 max-w-2xl">
        Monochrome categories, each with its own bordered badge. Renaming updates history; deletion reassigns —
        the record is never broken.
      </p>
      <div className={cn("grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6")}>
        <CategoryList kind="expense" title="Expense desks" blurb="the filament of daily spending" />
        <CategoryList kind="income" title="Income desks" blurb="sources of inflow" />
      </div>
    </div>
  );
}
