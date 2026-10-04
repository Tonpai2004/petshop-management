import { cn } from "@/lib/utils";
import { STOCK_STYLES } from "../constants";
import type { ProductStatus, StockLevel } from "../types";

interface StockBadgeProps {
  level: StockLevel;
  status?: ProductStatus;
  className?: string;
}

export function StockBadge({ level, status, className }: StockBadgeProps) {
  if (status === "Discontinued") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-zinc-500/20 ring-inset dark:text-zinc-400",
          className,
        )}
      >
        <span className="size-1.5 rounded-full bg-zinc-400" />
        Discontinued
      </span>
    );
  }

  const style = STOCK_STYLES[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        style.badge,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
