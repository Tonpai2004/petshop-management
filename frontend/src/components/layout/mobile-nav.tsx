"use client";

import { useState } from "react";
import { BarChart3, LayoutGrid, LogOut, Menu, Moon, Package, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BrandLogo } from "@/components/shared/brand-logo";
import { DASHBOARD_SECTIONS, DASHBOARD_TAB_IDS, DASHBOARD_TABS } from "@/config/routes";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";
import { jumpToSearch } from "./quick-search";

const tabIcons = {
  [DASHBOARD_SECTIONS.overview]: LayoutGrid,
  [DASHBOARD_SECTIONS.insights]: BarChart3,
  [DASHBOARD_SECTIONS.products]: Package,
};

/** Hamburger menu for phones and small tablets, where the section tabs don't fit in the bar. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useActiveSection(DASHBOARD_TAB_IDS);
  const { resolvedTheme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  const goTo = (id: string) => {
    setActive(id);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="-ml-2 text-white/80 hover:bg-white/10 hover:text-white md:hidden"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[85%] max-w-xs gap-0 p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle render={<div />}>
              <BrandLogo />
            </SheetTitle>
            <SheetDescription className="sr-only">
              Jump to a section of the dashboard
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                // Wait for the sheet to close so focus can land on the search box.
                setTimeout(jumpToSearch, 250);
              }}
              className="bg-muted/60 text-muted-foreground hover:bg-muted flex h-10 items-center gap-2 rounded-lg px-3 text-sm transition-colors"
            >
              <Search className="size-4" />
              Search products...
            </button>

            <nav aria-label="Dashboard sections" className="grid gap-1">
              <p className="text-muted-foreground mb-1 px-3 text-[11px] font-medium tracking-wider uppercase">
                Menu
              </p>
              {DASHBOARD_TABS.map((tab) => {
                const Icon = tabIcons[tab.id];
                const isActive = active === tab.id;
                return (
                  <a
                    key={tab.id}
                    href={`#${tab.id}`}
                    onClick={() => goTo(tab.id)}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted",
                    )}
                  >
                    {isActive && (
                      <span
                        aria-hidden
                        className="bg-primary absolute inset-y-2 left-0 w-1 rounded-full"
                      />
                    )}
                    <Icon className="size-[18px]" />
                    {tab.label}
                  </a>
                );
              })}
            </nav>

            <div className="grid gap-2">
              <p className="text-muted-foreground px-3 text-[11px] font-medium tracking-wider uppercase">
                Appearance
              </p>
              <div
                className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1"
                role="group"
                aria-label="Theme"
              >
                {(["light", "dark"] as const).map((theme) => {
                  const Icon = theme === "light" ? Sun : Moon;
                  const selected = resolvedTheme === theme;
                  return (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setTheme(theme)}
                      aria-pressed={selected}
                      className={cn(
                        "flex h-9 items-center justify-center gap-2 rounded-md text-sm capitalize transition-colors",
                        selected
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                      {theme}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {user && (
            <div className="flex items-center justify-between gap-3 border-t p-4">
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium">{user.fullName}</p>
                <p className="text-muted-foreground text-xs">
                  {user.role === "Admin" ? "Administrator" : "Staff"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut />
                Sign out
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
