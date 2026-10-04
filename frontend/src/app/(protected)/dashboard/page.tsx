import type { Metadata } from "next";
import { DashboardOverview } from "@/features/products/components/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
