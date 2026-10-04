import { cn } from "@/lib/utils";
import { petTypeLabel } from "../constants";
import { petTypeIcons } from "../looks";
import type { PetType } from "../types";

export function PetTypeTag({ type, className }: { type: PetType; className?: string }) {
  const Icon = petTypeIcons[type];
  return (
    <span
      className={cn(
        "text-muted-foreground inline-flex items-center gap-1.5 text-sm whitespace-nowrap",
        className,
      )}
    >
      <Icon className="size-3.5" />
      {petTypeLabel(type)}
    </span>
  );
}
