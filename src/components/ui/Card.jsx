import { cn } from "../../utils/cn.js";

export function IconBox({ children, dark = false, className }) {
  return (
    <div
      className={cn(
        "h-12 w-12 flex items-center justify-center border transition-all duration-200",
        dark ? "border-paper text-paper" : "border-ink text-ink",
        "hover:bg-ink hover:text-paper",
        dark && "hover:bg-paper hover:text-ink",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Card({ children, className, hover = false }) {
  return (
    <div className={cn("border border-ink bg-paper", hover && "hard-shadow-hover hover:bg-neutral-100", className)}>
      {children}
    </div>
  );
}
