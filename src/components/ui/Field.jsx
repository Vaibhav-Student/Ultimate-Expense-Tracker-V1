import { cn } from "../../utils/cn.js";

export const inputCls =
  "w-full border-b-2 border-ink bg-transparent px-3 py-2.5 font-mono text-base sm:text-sm tnum field-focus focus-visible:outline-none sharp-corners min-h-[44px]";
export const labelCls = "font-sans text-xs font-semibold uppercase tracking-widest text-neutral-600";

export function Field({ label, error, hint, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>{label}</label>
      <div className="mt-1">{children}</div>
      {hint && !error && <p className="font-mono text-[11px] text-neutral-500 mt-1">{hint}</p>}
      {error && <p role="alert" className="font-mono text-xs text-editorial mt-1 uppercase tracking-wide">{error}</p>}
    </div>
  );
}

export function Progress({ pct, status }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Budget consumed ${Math.round(clamped)} percent, ${status}`}
    >
      <div
        className={cn("progress-fill", status === "Budget Exceeded" && "over", status === "On Track" && "good")}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="border border-ink bg-paper p-8 text-center newsprint-texture">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-500">No records found</p>
      <h3 className="font-serif font-black text-2xl mt-2">{title}</h3>
      <p className="font-body text-sm text-neutral-600 mt-2 max-w-md mx-auto">{body}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    "On Track": "bg-pinebg text-pine border border-pine",
    "Approaching Limit": "border border-ink text-ink bg-transparent",
    "Budget Exceeded": "bg-rosebg text-editorial border border-editorial",
  };
  return (
    <span className={cn("inline-block px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest", map[status] || map["Approaching Limit"])}>
      {status}
    </span>
  );
}
