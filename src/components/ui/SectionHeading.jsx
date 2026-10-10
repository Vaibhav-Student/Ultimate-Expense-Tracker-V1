import { cn } from "../../utils/cn.js";

export function SectionHeading({ kicker, title, lede, align = "left", dark = false, className }) {
  return (
    <div className={cn("w-full px-4", className)}>
      <div className={cn("flex items-center gap-3", align === "center" && "justify-center")}>
        <span className="inline-block h-2 w-2 bg-editorial" aria-hidden="true" />
        <p className={cn(
          "font-mono text-xs uppercase tracking-[0.25em]",
          dark ? "text-neutral-400" : "text-neutral-600"
        )}>
          {kicker}
        </p>
        <span className={cn("h-px flex-1", dark ? "bg-neutral-700" : "bg-ink")} aria-hidden="true" />
      </div>
      <h2 className={cn(
        "font-serif font-black mt-4 text-4xl lg:text-5xl leading-[1.05] tracking-tight",
        dark ? "text-paper" : "text-ink",
        align === "center" && "text-center"
      )}>
        {title}
      </h2>
      {lede && (
        <p className={cn(
          "font-body text-base mt-3 max-w-2xl leading-relaxed",
          dark ? "text-neutral-400" : "text-neutral-600",
          align === "center" && "mx-auto text-center"
        )}>
          {lede}
        </p>
      )}
    </div>
  );
}

export function Ornament({ className }) {
  return (
    <div className={cn("py-6 text-center font-serif text-xl text-neutral-400 tracking-[1em] select-none", className)} aria-hidden="true">
      &#10022; &#10022; &#10022;
    </div>
  );
}
