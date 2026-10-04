"use client";

import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AccentTitle } from "@/components/shared/accent-title";
import { cn } from "@/lib/utils";
import { STOCK_LEVELS, STOCK_STYLES } from "../constants";
import { useProductDialogs } from "../context/product-dialogs";
import { useProducts } from "../hooks/use-products";
import type { InventorySummary, StockLevel } from "../types";
import { ProductThumb } from "./product-thumb";

// The lowest stock first; anything still comfortably in stock is filtered out below.
const LOWEST_STOCK = {
  page: 1,
  pageSize: 8,
  sortBy: "stock",
  sortDirection: "asc",
  status: "Active",
} as const;

function percent(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

export function StockHealth({ summary }: { summary?: InventorySummary }) {
  const { openAdjustStock, openDetails } = useProductDialogs();
  const { data: lowest } = useProducts(LOWEST_STOCK);
  const restockList = lowest?.items.filter((p) => p.stockLevel !== "InStock").slice(0, 4) ?? [];

  const counts: Record<StockLevel, number> = summary
    ? { InStock: summary.inStock, LowStock: summary.lowStock, OutOfStock: summary.outOfStock }
    : { InStock: 0, LowStock: 0, OutOfStock: 0 };

  return (
    <Card className="h-full">
      <CardHeader>
        <AccentTitle>Stock health</AccentTitle>
        <CardDescription>What needs reordering soon</CardDescription>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="grid gap-4">
            {STOCK_LEVELS.map(({ value, label }) => {
              const share = percent(counts[value], summary.totalProducts);
              return (
                <div key={value} className="grid gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", STOCK_STYLES[value].dot)} />
                      {label}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {counts[value]} <span className="text-xs">({share}%)</span>
                    </span>
                  </div>
                  <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                    <div
                      className={cn("h-full rounded-full transition-all", STOCK_STYLES[value].bar)}
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Restock soon</p>
              {restockList.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nothing is running low. Nice.</p>
              ) : (
                <ul className="grid gap-1">
                  {restockList.map((product) => (
                    <li
                      key={product.id}
                      className="hover:bg-muted/60 -mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => openDetails(product)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <ProductThumb
                          name={product.name}
                          categoryName={product.categoryName}
                          imageUrl={product.imageUrl}
                          className="size-8"
                          iconClassName="size-4"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm">{product.name}</span>
                          <span
                            className={cn(
                              "text-xs",
                              product.stockLevel === "OutOfStock"
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-amber-600 dark:text-amber-300",
                            )}
                          >
                            {product.stockQuantity === 0
                              ? "Out of stock"
                              : `${product.stockQuantity} left`}
                          </span>
                        </span>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openAdjustStock(product)}
                        aria-label={`Restock ${product.name}`}
                      >
                        <PackagePlus />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <Skeleton className="h-[260px] w-full" />
        )}
      </CardContent>
    </Card>
  );
}
