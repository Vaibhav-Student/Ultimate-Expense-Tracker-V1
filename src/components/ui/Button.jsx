import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn.js";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-200 focus-ring min-h-[44px] px-6 sharp-corners cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-paper border border-transparent hover:bg-paper hover:text-ink hover:border-ink",
        secondary:
          "border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
        ghost: "text-ink hover:bg-divider hover:text-ink border border-transparent",
        accent: "bg-editorial text-on-accent border border-transparent hover:bg-ink hover:text-paper",
      },
    },
    defaultVariants: { variant: "primary" },
  }
);

export function Button({ variant, className, ...props }) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
