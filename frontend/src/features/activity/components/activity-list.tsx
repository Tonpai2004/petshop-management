import {
  Camera,
  CameraOff,
  KeyRound,
  Lock,
  LogIn,
  PackagePlus,
  Pencil,
  PlusCircle,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Activity, ActivityAction } from "../types";

const look: Record<ActivityAction, { icon: LucideIcon; className: string }> = {
  ProductCreated: {
    icon: PlusCircle,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  ProductUpdated: { icon: Pencil, className: "bg-sky-500/10 text-sky-600 dark:text-sky-300" },
  ProductDeleted: { icon: Trash2, className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  ProductPhotoChanged: { icon: Camera, className: "bg-primary/10 text-primary" },
  ProductPhotoRemoved: { icon: CameraOff, className: "bg-muted text-muted-foreground" },
  StockAdjusted: {
    icon: PackagePlus,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  SignedIn: { icon: LogIn, className: "bg-muted text-muted-foreground" },
  PasswordChanged: { icon: KeyRound, className: "bg-muted text-muted-foreground" },
  PasswordReset: {
    icon: KeyRound,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  AccountLocked: { icon: Lock, className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  UserCreated: {
    icon: UserPlus,
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  },
  UserEnabled: {
    icon: UserCheck,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  UserDisabled: { icon: UserX, className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
};

interface ActivityListProps {
  items?: Activity[];
  isLoading?: boolean;
  emptyText?: string;
  className?: string;
}

export function ActivityList({
  items,
  isLoading,
  emptyText = "Nothing has happened yet.",
  className,
}: ActivityListProps) {
  if (isLoading || !items) {
    return (
      <div className={cn("grid gap-4", className)}>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-muted-foreground py-6 text-center text-sm">{emptyText}</p>;
  }

  return (
    <ol className={cn("relative grid gap-4", className)}>
      {/* the thin line that joins the icons, timeline style */}
      <span aria-hidden className="bg-border absolute top-2 bottom-2 left-4 w-px" />
      {items.map((item) => {
        const { icon: Icon, className: iconClass } = look[item.action] ?? look.ProductUpdated;
        return (
          <li key={item.id} className="relative flex gap-3">
            <span
              className={cn(
                "bg-card ring-card relative flex size-8 shrink-0 items-center justify-center rounded-full ring-4",
                iconClass,
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 pt-0.5 text-sm leading-snug">
              <p>
                <span className="font-medium">{item.userFullName ?? "System"}</span>{" "}
                <span className="text-muted-foreground">{item.summary}</span>
              </p>
              <time dateTime={item.createdAt} className="text-muted-foreground text-xs">
                {formatRelative(item.createdAt)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
