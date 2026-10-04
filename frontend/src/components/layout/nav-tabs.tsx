"use client";

import { useEffect, useState } from "react";
import { DASHBOARD_SECTIONS } from "@/config/routes";
import { cn } from "@/lib/utils";

const tabs = [
  { id: DASHBOARD_SECTIONS.overview, label: "Overview" },
  { id: DASHBOARD_SECTIONS.insights, label: "Insights" },
  { id: DASHBOARD_SECTIONS.products, label: "Products" },
];

/**
 * Section tabs with an underline that follows you as you scroll, the way one31 marks the current menu.
 */
export function NavTabs({ className }: { className?: string }) {
  const [active, setActive] = useState<string>(tabs[0].id);

  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.id))
      .filter((section): section is HTMLElement => section !== null);

    // A section counts as "current" once it crosses the band just under the navbar.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Dashboard sections"
      className={cn("flex h-full items-stretch gap-1", className)}
    >
      {tabs.map((tab) => {
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
