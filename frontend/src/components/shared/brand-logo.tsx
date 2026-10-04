import { PawPrint } from "lucide-react";
import { env } from "@/config/env";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="bg-primary text-primary-foreground shadow-primary/30 flex size-9 items-center justify-center rounded-[10px] shadow-md">
        <PawPrint className="size-5" />
      </span>
      {!compact && (
        <div className="leading-none">
          <p className="text-[15px] font-semibold tracking-tight">{env.appName}</p>
          <p className="text-muted-foreground mt-1 text-[11px] font-medium tracking-[0.14em] uppercase">
            Back office
          </p>
        </div>
      )}
    </div>
  );
}
