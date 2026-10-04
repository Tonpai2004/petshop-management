"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AccentTitle } from "@/components/shared/accent-title";
import type { CategoryBreakdown } from "../types";

const chartConfig = {
  inStock: { label: "In stock", color: "var(--chart-1)" },
  needsRestock: { label: "Needs restock", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function CategoryChart({ data }: { data?: CategoryBreakdown[] }) {
  // Seven category names don't fit side by side on a phone, so the bars turn sideways there.
  const isNarrow = useMediaQuery("(max-width: 639px)");

  return (
    <Card>
      <CardHeader>
        <AccentTitle>Products by category</AccentTitle>
        <CardDescription>
          How much of each category is healthy and how much needs restocking
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!data ? (
          <Skeleton className="h-[260px] w-full" />
        ) : isNarrow ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8 }} maxBarSize={22}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="categoryName"
                tickLine={false}
                axisLine={false}
                width={84}
              />
              <ChartTooltip cursor={{ fillOpacity: 0.4 }} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="inStock"
                stackId="products"
                fill="var(--color-inStock)"
                radius={[4, 0, 0, 4]}
              />
              <Bar
                dataKey="needsRestock"
                stackId="products"
                fill="var(--color-needsRestock)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <BarChart data={data} margin={{ left: -20, right: 4 }} maxBarSize={44}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="categoryName"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
              <ChartTooltip cursor={{ fillOpacity: 0.4 }} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="inStock"
                stackId="products"
                fill="var(--color-inStock)"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="needsRestock"
                stackId="products"
                fill="var(--color-needsRestock)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
