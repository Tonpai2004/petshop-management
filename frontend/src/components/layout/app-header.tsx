import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { routes } from "@/config/routes";
import { MobileNav } from "./mobile-nav";
import { NavTabs } from "./nav-tabs";
import { QuickSearch } from "./quick-search";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function AppHeader() {
  return (
    // The bar stays black in both themes, like the one31 / oneD top bar.
    <header className="dark text-foreground sticky top-0 z-30 border-b border-white/10 bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 md:gap-0 lg:px-8">
        <MobileNav />

        <Link href={routes.dashboard} aria-label="Go to dashboard" className="shrink-0">
          <BrandLogo />
        </Link>

        <span aria-hidden className="mx-6 hidden h-6 w-px bg-white/10 md:block" />

        <NavTabs className="hidden md:flex" />

        <div className="ml-auto flex items-center gap-2">
          <QuickSearch />
          <ThemeToggle className="hidden text-white/60 hover:bg-white/10 hover:text-white md:inline-flex" />
          <span aria-hidden className="mx-1 hidden h-6 w-px bg-white/10 md:block" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
