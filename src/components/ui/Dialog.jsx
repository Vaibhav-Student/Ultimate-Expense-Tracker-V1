import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Dialog({ open, onClose, title, kicker, children, wide = false }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      panelRef.current?.querySelector("input, select, textarea, button")?.focus();
    }, 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="dialog-overlay no-print"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div ref={panelRef} className="dialog-panel" style={wide ? { maxWidth: 760 } : undefined}>
        <div className="flex items-center justify-between border-b-2 border-ink px-4 sm:px-6 py-3">
          <div>
            {kicker && <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-editorial">{kicker}</p>}
            <h2 className="font-serif font-black text-2xl tracking-tight">{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-ink hover:bg-ink hover:text-paper transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ open, onClose, onConfirm, title, body, confirmLabel = "Delete", tone = "danger" }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} kicker="Confirmation required">
      <p className="font-body text-[15px] leading-relaxed text-neutral-700">{body}</p>
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 min-h-[44px] border border-ink font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
        >
          Keep it
        </button>
        <button
          onClick={onConfirm}
          autoFocus
          className={`flex-1 min-h-[44px] font-sans text-xs font-bold uppercase tracking-widest border transition-colors ${
            tone === "danger"
              ? "bg-editorial text-on-accent border-transparent hover:bg-ink"
              : "bg-ink text-paper border-transparent hover:bg-paper hover:text-ink hover:border-ink"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
