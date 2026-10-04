import type { ReactNode } from "react";
import { CircleDollarSign, Package, PackageX, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InventorySummary } from "../types";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint: ReactNode;
  icon: ReactNode;
  iconClassName: string;
}

function StatCard({ label, value, hint, icon, iconClassName }: StatCardProps) {
  return (
    <Card className="gap-0 p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9",
            iconClassName,
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
    </Card>
  );
}

export function SummaryCards({ summary }: { summary?: InventorySummary }) {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[118px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 max-[359px]:grid-cols-1 sm:gap-4 lg:grid-cols-4">
      <StatCard
        label="Products"
        value={formatNumber(summary.totalProducts)}
        hint={`${formatNumber(summary.totalUnits)} items on the shelves`}
        icon={<Package className="size-[18px]" />}
        iconClassName="bg-primary/10 text-primary"
      />
      <StatCard
        label="Stock value"
        value={formatCurrency(summary.stockValue)}
        hint="At current selling prices"
        icon={<CircleDollarSign className="size-[18px]" />}
        iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-300"
      />
      <StatCard
        label="Low stock"
        value={formatNumber(summary.lowStock)}
        hint="At or below their reorder level"
        icon={<TriangleAlert className="size-[18px]" />}
        iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-300"
      />
      <StatCard
        label="Out of stock"
        value={formatNumber(summary.outOfStock)}
        hint={
          summary.outOfStock === 0
            ? "Everything is on the shelf"
            : "Customers can't buy these right now"
        }
        icon={<PackageX className="size-[18px]" />}
        iconClassName="bg-rose-500/10 text-rose-600 dark:text-rose-400"
      />
    </div>
  );
}
