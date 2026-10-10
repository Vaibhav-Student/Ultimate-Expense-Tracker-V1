import { useState } from "react";
import { Plus, Search, Bell, Settings as SettingsIcon, Menu, X } from "lucide-react";
import { useFinance } from "../../store/finance.jsx";
import { monthLabel } from "../../utils/format.js";

export function Header({ onAdd, onSearch, onNav, onMenu, menuOpen = false }) {
  const { month, budgets, monthTx } = useFinance();
  const [q, setQ] = useState("");
  const spent = monthTx(month).filter(t => t.type === "expense").reduce((a, t) => a + t.amountCents, 0);
  const limit = budgets.filter(b => b.month === month).reduce((a, b) => a + b.limitCents, 0);
  const over = limit > 0 && spent > limit;
  const alerts = over ? 1 : 0;

  return (
    <header className="sticky top-0 z-40 bg-paper border-b-4 border-ink no-print">
      <div className="border-b border-ink">
        <div className="px-4 flex items-center justify-between h-8 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
          <span className="hidden sm:inline">Vol. 01 &nbsp;|&nbsp; Personal Finance</span>
          <span className="truncate">Vol. 01 &middot; Personal Finance &middot; {monthLabel(month)}</span>
          <span className="hidden md:inline">Late City Final</span>
        </div>
      </div>

      <div className="px-4 flex items-center gap-2 sm:gap-3 py-3">
        <button
          onClick={onMenu}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center border border-ink hover:bg-ink hover:text-paper transition-colors shrink-0"
        >
          {menuOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
        </button>
        <button onClick={() => onNav("overview")} className="text-left focus-ring" aria-label="The Ledger — go to overview">
          <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-editorial font-bold">Personal Finance Edition</span>
          <span className="block font-serif font-black text-xl sm:text-3xl tracking-tighter leading-none whitespace-nowrap">THE LEDGER</span>
        </button>

        <div className="hidden md:flex flex-1 max-w-md ml-4">
          <label htmlFor="global-search" className="sr-only">Search transactions</label>
          <div className="flex w-full border border-ink">
            <span className="flex items-center px-3 border-r border-ink" aria-hidden="true">
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <input
              id="global-search"
              value={q}
              onChange={(e) => { setQ(e.target.value); onSearch(e.target.value); }}
              placeholder="Search description, merchant…"
              className="flex-1 px-3 py-2 font-mono text-base sm:text-sm bg-transparent focus-visible:bg-neutral-100 focus-visible:outline-none min-h-[44px]"
            />
          </div>
        </div>

        <div className="flex-1 md:hidden" />

        <button
          onClick={() => onNav("budgets")}
          aria-label={alerts ? "1 budget alert — view budgets" : "No budget alerts — view budgets"}
          className="relative min-h-[44px] min-w-[44px] flex items-center justify-center border border-ink hover:bg-ink hover:text-paper transition-colors"
          title="Budget alerts"
        >
          <Bell className="h-5 w-5" strokeWidth={1.5} />
          {alerts > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-editorial text-paper font-mono text-[10px] font-bold px-1.5 py-0.5 border border-ink">
              {alerts}
            </span>
          )}
        </button>
        <button
          onClick={() => onNav("settings")}
          aria-label="Open settings"
          className="hidden sm:flex min-h-[44px] min-w-[44px] items-center justify-center border border-ink hover:bg-ink hover:text-paper transition-colors"
        >
          <SettingsIcon className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <button
          onClick={onAdd}
          className="min-h-[44px] px-4 sm:px-6 inline-flex items-center gap-2 bg-ink text-paper border border-transparent hover:bg-paper hover:text-ink hover:border-ink font-sans text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="md:hidden border-t border-ink px-4 py-2">
        <label htmlFor="global-search-m" className="sr-only">Search transactions</label>
        <div className="flex w-full border border-ink">
          <span className="flex items-center px-3 border-r border-ink" aria-hidden="true">
            <Search className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <input
            id="global-search-m"
            value={q}
            onChange={(e) => { setQ(e.target.value); onSearch(e.target.value); }}
            placeholder="Search ledger…"
            className="flex-1 px-3 py-2 font-mono text-base sm:text-sm bg-transparent focus-visible:bg-neutral-100 focus-visible:outline-none min-h-[44px]"
          />
        </div>
      </div>
    </header>
  );
}
