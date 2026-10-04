"use client";

import { useEffect } from "react";
import { Search } from "lucide-react";
import { DASHBOARD_SEARCH_INPUT_ID, DASHBOARD_SECTIONS } from "@/config/routes";
import { cn } from "@/lib/utils";

function jumpToSearch() {
  document
    .getElementById(DASHBOARD_SECTIONS.products)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById(DASHBOARD_SEARCH_INPUT_ID)?.focus({ preventScroll: true });
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/** Looks like a search box, works as a shortcut: press "/" anywhere to jump to the product search, like GitHub. */
export function QuickSearch({ className }: { className?: string }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const slash = event.key === "/" && !isTyping(event.target);
      const commandK = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      if (slash || commandK) {
        event.preventDefault();
        jumpToSearch();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={jumpToSearch}
        className={cn(
          "hidden h-9 w-60 items-center gap-2 rounded-lg bg-white/[0.06] px-3 text-sm text-white/45 ring-1 ring-white/10 transition-colors ring-inset hover:bg-white/10 hover:text-white/70 lg:flex",
          className,
        )}
      >
        <Search className="size-4" />
        Search products...
        <kbd className="ml-auto rounded border border-white/15 px-1.5 font-sans text-[11px] leading-5 text-white/50">
          /
        </kbd>
      </button>

      <button
        type="button"
        onClick={jumpToSearch}
        aria-label="Search products"
        className="flex size-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
      >
        <Search className="size-[18px]" />
      </button>
    </>
  );
}
