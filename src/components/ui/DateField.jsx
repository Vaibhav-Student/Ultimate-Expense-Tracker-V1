import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { inputCls } from "./Field.jsx";
import { todayISO, monthLabel, shiftMonth, fmtLong } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

// Newsprint calendar replacing <input type="date"> (whose popup ignores site styling).
// Monday-start grid, adjacent-month days dimmed but selectable, Today/Clear footer.
const WD = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

function gridCells(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const lead = (start.getDay() + 6) % 7; // Monday start
  const cells = [];
  for (let i = lead; i > 0; i--) {
    const d = new Date(y, m - 1, 1 - i);
    cells.push({ iso: toISO(d), outside: true });
  }
  const days = new Date(y, m, 0).getDate();
  for (let d = 1; d <= days; d++) {
    cells.push({ iso: `${monthKey}-${String(d).padStart(2, "0")}`, outside: false });
  }
  let n = 1;
  while (cells.length % 7 !== 0) {
    const d = new Date(y, m, n++);
    cells.push({ iso: toISO(d), outside: true });
  }
  return cells;
}

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DateField({ id, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => (value || todayISO()).slice(0, 7));
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const today = todayISO();

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) setView((value || todayISO()).slice(0, 7));
    setOpen(v => !v);
  };

  const pick = (iso) => {
    onChange(iso);
    setOpen(false);
    btnRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
        className={cn(inputCls, "flex items-center justify-between gap-2 cursor-pointer bg-paper text-left")}
        style={{ borderRadius: 0 }}
      >
        <span className={cn("truncate", !value && "text-neutral-500")}>{value ? fmtLong(value) : "Pick a date"}</span>
        <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
      </button>
      {open && (
        <div role="dialog" aria-label="Choose a date" className="absolute z-50 left-0 mt-1 w-[320px] max-w-[86vw] border-2 border-ink bg-paper shadow-hard">
          <div className="flex items-center justify-between border-b border-ink pl-3">
            <span className="font-serif font-bold text-base" aria-live="polite">{monthLabel(view)}</span>
            <span className="flex">
              <button type="button" onClick={() => setView(shiftMonth(view, -1))} aria-label="Previous month" className="min-h-[44px] min-w-[44px] flex items-center justify-center border-l border-ink hover:bg-ink hover:text-paper transition-colors">
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </button>
              <button type="button" onClick={() => setView(shiftMonth(view, 1))} aria-label="Next month" className="min-h-[44px] min-w-[44px] flex items-center justify-center border-l border-ink hover:bg-ink hover:text-paper transition-colors">
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </span>
          </div>
          <div className="grid grid-cols-7 gap-px bg-ink border-b border-ink p-px" role="grid" aria-label={monthLabel(view)}>
            {WD.map(w => (
              <span key={w} className="bg-ink text-paper font-mono text-[10px] uppercase tracking-widest text-center py-1">{w}</span>
            ))}
            {gridCells(view).map(c => {
              const sel = c.iso === value;
              return (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => pick(c.iso)}
                  aria-pressed={sel}
                  aria-label={fmtLong(c.iso)}
                  className={cn(
                    "min-h-[40px] min-w-[40px] font-mono text-[13px] tnum transition-colors focus-ring",
                    sel ? "bg-ink text-paper"
                    : c.iso === today ? "bg-paper text-ink ring-2 ring-inset ring-editorial hover:bg-neutral-100"
                    : c.outside ? "bg-paper text-neutral-400 hover:bg-neutral-100"
                    : "bg-paper text-ink hover:bg-neutral-100"
                  )}
                >
                  {Number(c.iso.slice(8))}
                </button>
              );
            })}
          </div>
          <div className="flex">
            <button type="button" onClick={() => pick(today)} className="flex-1 min-h-[44px] font-sans text-xs font-bold uppercase tracking-widest border-r border-ink hover:bg-ink hover:text-paper transition-colors">
              Today
            </button>
            <button type="button" onClick={() => pick("")} className="flex-1 min-h-[44px] font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
