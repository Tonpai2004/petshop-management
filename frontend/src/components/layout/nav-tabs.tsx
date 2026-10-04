"use client";

import { DASHBOARD_TAB_IDS, DASHBOARD_TABS } from "@/config/routes";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";

/**
 * Section tabs with an underline that follows you as you scroll, the way one31 marks the current menu.
 */
export function NavTabs({ className }: { className?: string }) {
  const [active, setActive] = useActiveSection(DASHBOARD_TAB_IDS);

  return (
    <nav
      aria-label="Dashboard sections"
      className={cn("flex h-full items-stretch gap-1", className)}
    >
      {DASHBOARD_TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <a
            key={tab.id}
            href={`#${tab.id}`}
            onClick={() => setActive(tab.id)}
            aria-current={isActive ? "location" : undefined}
            className={cn(
              "relative flex items-center px-3 text-sm font-medium transition-colors",
              "after:bg-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-transform after:duration-200",
              isActive
                ? "text-white after:scale-x-100"
                : "text-white/55 after:scale-x-0 hover:text-white",
            )}
          >
            {tab.label}
          </a>
        );
      })}
    </nav>
  );
}
