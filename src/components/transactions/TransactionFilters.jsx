import { useFinance } from "../../store/finance.jsx";
import { inputCls } from "../ui/Field.jsx";
import { cn } from "../../utils/cn.js";

export function TransactionFilters({ value, onChange }) {
  const { categories } = useFinance();
  const set = (k, v) => onChange({ ...value, [k]: v, page: 1 });

  const wrap = "font-sans text-xs font-semibold uppercase tracking-widest text-neutral-600";
  return (
    <div className="border border-ink bg-paper">
      <div className="grid grid-cols-3 divide-x divide-y md:divide-y-0 divide-ink border-b border-ink">
        {[
          { id: "all", label: "All" },
          { id: "expense", label: "Expenses" },
          { id: "income", label: "Income" },
        ].map(o => (
          <button
            key={o.id}
            onClick={() => set("type", o.id)}
            aria-pressed={value.type === o.id}
            className={cn(
              "py-2.5 min-h-[44px] font-sans text-xs font-bold uppercase tracking-widest transition-colors",
              value.type === o.id ? "bg-ink text-paper" : "hover:bg-neutral-100"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <label className="block">
          <span className={wrap}>Category</span>
          <select
            value={value.category} onChange={e => set("category", e.target.value)}
            className={cn(inputCls, "mt-1 cursor-pointer bg-paper")} style={{ borderRadius: 0 }}
          >
            <option value="all">All categories</option>
            <optgroup label="Expense">
              {categories.expense.map(c => <option key={c} value={c}>{c}</option>)}
            </optgroup>
            <optgroup label="Income">
              {categories.income.map(c => <option key={c} value={c}>{c}</option>)}
            </optgroup>
          </select>
        </label>
        <label className="block">
          <span className={wrap}>Account</span>
          <select
            value={value.account} onChange={e => set("account", e.target.value)}
            className={cn(inputCls, "mt-1 cursor-pointer bg-paper")} style={{ borderRadius: 0 }}
          >
            <option value="all">All methods</option>
            {[...new Set(value.allAccounts)].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={wrap}>From</span>
          <input type="date" value={value.from} onChange={e => set("from", e.target.value)} className={cn(inputCls, "mt-1")} style={{ borderRadius: 0 }} />
        </label>
        <label className="block">
          <span className={wrap}>To</span>
          <input type="date" value={value.to} onChange={e => set("to", e.target.value)} className={cn(inputCls, "mt-1")} style={{ borderRadius: 0 }} />
        </label>
      </div>
    </div>
  );
}
