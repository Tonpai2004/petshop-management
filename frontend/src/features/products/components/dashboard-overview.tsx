"use client";

import { format } from "date-fns";
import { DASHBOARD_SECTIONS } from "@/config/routes";
import { RecentActivity } from "@/features/activity/components/recent-activity";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ProductDialogsProvider } from "../context/product-dialogs";
import { useInventorySummary } from "../hooks/use-products";
import { CategoryChart } from "./category-chart";
import { NewArrivals } from "./new-arrivals";
import { ProductsSection } from "./products-section";
import { StockHealth } from "./stock-health";
import { SummaryCards } from "./summary-cards";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardOverview() {
  const { user } = useAuth();
  const { data: summary } = useInventorySummary();
  const now = new Date();

  return (
    <ProductDialogsProvider>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <p className="text-muted-foreground text-sm">{format(now, "EEEE, d MMMM yyyy")}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {greeting(now.getHours())}, {user?.fullName.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here&apos;s how the shop&apos;s stock looks today.
          </p>
        </div>

        <section id={DASHBOARD_SECTIONS.overview} className="grid scroll-mt-24 grid-cols-1 gap-6">
          <SummaryCards summary={summary} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <NewArrivals />
            </div>
            <RecentActivity />
          </div>
        </section>

        <section
          id={DASHBOARD_SECTIONS.insights}
          className="grid scroll-mt-24 grid-cols-1 gap-6 lg:grid-cols-3"
        >
          <div className="min-w-0 lg:col-span-2">
            <CategoryChart data={summary?.byCategory} />
          </div>
          <StockHealth summary={summary} />
        </section>

        <section id={DASHBOARD_SECTIONS.products} className="scroll-mt-24">
          <ProductsSection />
        </section>
      </div>
    </ProductDialogsProvider>
  );
}
