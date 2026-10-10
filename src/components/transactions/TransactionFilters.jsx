import { useFinance } from "../../store/finance.jsx";
import { SelectField } from "../ui/SelectField.jsx";
import { DateField } from "../ui/DateField.jsx";
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
        <div>
          <label htmlFor="flt-cat" className={wrap}>Category</label>
          <div className="mt-1">
            <SelectField
              id="flt-cat"
              value={value.category}
              onChange={v => set("category", v)}
              options={[
                { value: "all", label: "All categories" },
                ...categories.expense.map(c => ({ value: c, label: c })),
                ...categories.income.map(c => ({ value: c, label: c })),
              ]}
            />
          </div>
        </div>
        <div>
          <label htmlFor="flt-acct" className={wrap}>Account</label>
          <div className="mt-1">
            <SelectField
              id="flt-acct"
              value={value.account}
              onChange={v => set("account", v)}
              options={[
                { value: "all", label: "All methods" },
                ...[...new Set(value.allAccounts)].map(a => ({ value: a, label: a })),
              ]}
            />
          </div>
        </div>
        <div>
          <label htmlFor="flt-from" className={wrap}>From</label>
          <div className="mt-1">
            <DateField id="flt-from" value={value.from} onChange={v => set("from", v)} />
          </div>
        </div>
        <div>
          <label htmlFor="flt-to" className={wrap}>To</label>
          <div className="mt-1">
            <DateField id="flt-to" value={value.to} onChange={v => set("to", v)} />
          </div>
        </div>
      </div>
    </div>
  );
}
