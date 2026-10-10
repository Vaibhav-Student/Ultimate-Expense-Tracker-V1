import { cn } from "../../utils/cn.js";

export function Badge({ children, tone = "default", className }) {
  const tones = {
    default: "bg-ink text-paper",
    accent: "bg-editorial text-on-accent",
    outline: "border border-ink text-ink bg-transparent",
    paper: "bg-paper text-ink border border-ink",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-widest sharp-corners",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Meta({ children, className }) {
  return (
    <p className={cn("font-mono text-xs uppercase tracking-widest text-neutral-500", className)}>
      {children}
    </p>
  );
}
