import { useEffect } from "react";
import { LayoutDashboard, ReceiptText, Wallet, Tags, BarChart3, Settings, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "../../utils/cn.js";

export const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, hash: "#/overview" },
  { id: "transactions", label: "Transactions", icon: ReceiptText, hash: "#/transactions" },
  { id: "budgets", label: "Budgets", icon: Wallet, hash: "#/budgets" },
  { id: "categories", label: "Categories", icon: Tags, hash: "#/categories" },
  { id: "reports", label: "Reports", icon: BarChart3, hash: "#/reports" },
  { id: "settings", label: "Settings", icon: Settings, hash: "#/settings" },
];

function DeskList({ active, onNav, collapsed = false }) {
  return (
    <>
      <nav className="mt-2 px-2 space-y-1" aria-label="Primary">
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={item.hash}
              onClick={(e) => { e.preventDefault(); onNav(item.id); }}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 min-h-[44px] font-sans text-xs font-bold uppercase tracking-widest border transition-colors focus-ring",
                collapsed ? "justify-center px-0" : "px-3",
                isActive ? "bg-ink text-paper border-ink" : "border-transparent text-ink hover:bg-neutral-100 hover:border-ink"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
              <span className={collapsed ? "sr-only" : undefined}>{item.label}</span>
            </a>
          );
        })}
      </nav>
      {!collapsed && (
        <div className="m-4 mt-6 border border-ink p-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-editorial">Press note</p>
          <p className="font-body text-[13px] leading-relaxed mt-1 text-neutral-700">
            Figures are computed from your ledger. Sample rows are marked SAMPLE until you clear them.
          </p>
        </div>
      )}
    </>
  );
}

export function Sidebar({ active, onNav, mobileOpen = false, onClose, collapsed = false, onToggle }) {
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen, onClose]);

  return (
    <>
      {/* Desktop sidebar — collapsible to an icon rail */}
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 border-r border-ink bg-paper no-print transition-all duration-200",
          collapsed ? "w-[68px]" : "w-60"
        )}
        aria-label="Primary"
      >
        <div className={cn("flex items-center pt-4 px-2", collapsed ? "justify-center" : "justify-between px-4")}>
          {!collapsed && (
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500">Desks</p>
          )}
          <button
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-ink hover:bg-ink hover:text-paper transition-colors shrink-0"
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" strokeWidth={1.5} /> : <ChevronsLeft className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
        <DeskList active={active} onNav={onNav} collapsed={collapsed} />
      </aside>

      {/* Mobile / tablet drawer — same desks panel, slides in */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 no-print"
          role="dialog"
          aria-modal="true"
          aria-label="Primary navigation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
          style={{ background: "rgba(17,17,17,0.55)" }}
        >
          <div className="animate-drawer absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-paper border-r-2 border-ink overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink px-4 h-14">
              <span className="font-serif font-black text-xl tracking-tighter">THE LEDGER</span>
              <button
                onClick={onClose}
                aria-label="Close navigation"
                autoFocus
                className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-ink hover:bg-ink hover:text-paper transition-colors"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500 px-4 pt-4">Desks</p>
            <DeskList active={active} onNav={onNav} />
          </div>
        </div>
      )}
    </>
  );
}
