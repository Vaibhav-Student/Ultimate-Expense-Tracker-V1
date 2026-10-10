import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { inputCls } from "./Field.jsx";
import { cn } from "../../utils/cn.js";

// Newsprint dropdown replacing the native <select> (whose popup ignores site styling).
// Button + listbox popover, full keyboard support, theme-aware via CSS vars.
export function SelectField({ id, value, onChange, options, placeholder = "Select…" }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const opts = options.map(o => (typeof o === "string" ? { value: o, label: o } : o));
  const current = opts.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    setHi(Math.max(0, opts.findIndex(o => o.value === value)));
    const onDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onDown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pick = (val) => {
    onChange(val);
    setOpen(false);
    btnRef.current?.focus();
  };

  const onBtnKey = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onListKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi(h => (h + 1) % opts.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi(h => (h - 1 + opts.length) % opts.length); }
    else if (e.key === "Enter") { e.preventDefault(); if (opts[hi]) pick(opts[hi].value); }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        onKeyDown={onBtnKey}
        className={cn(inputCls, "flex items-center justify-between gap-2 cursor-pointer bg-paper text-left")}
        style={{ borderRadius: 0 }}
      >
        <span className={cn("truncate", !current && "text-neutral-500")}>{current ? current.label : placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} strokeWidth={2} aria-hidden="true" />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-labelledby={id}
          tabIndex={-1}
          onKeyDown={onListKey}
          className="absolute z-50 inset-x-0 top-full mt-1 border-2 border-ink bg-paper max-h-60 overflow-y-auto shadow-hard"
        >
          {opts.map((opt, i) => {
            const sel = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={sel} id={`${id}-opt-${i}`}>
                <button
                  type="button"
                  onClick={() => pick(opt.value)}
                  onMouseEnter={() => setHi(i)}
                  className={cn(
                    "w-full min-h-[44px] px-3 flex items-center gap-2 text-left font-mono text-sm transition-colors",
                    sel ? "bg-ink text-paper" : hi === i ? "bg-neutral-100" : "bg-paper text-ink"
                  )}
                >
                  <span className="flex-1 truncate">{opt.label}</span>
                  {sel && <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
