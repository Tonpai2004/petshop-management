"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { petTypeLabel } from "../constants";
import type { Product } from "../types";
import { ProductActionsMenu, type ProductActions } from "./product-actions-menu";
import { ProductThumb } from "./product-thumb";
import { StockBadge } from "./stock-badge";

interface ProductsListProps extends ProductActions {
  products?: Product[];
  isLoading: boolean;
}

/** Card list used instead of the table on phones and tablets, so nothing needs sideways scrolling. */
export function ProductsList({ products, isLoading, ...actions }: ProductsListProps) {
  if (isLoading && !products) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[92px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {products?.map((product) => (
        <li key={product.id} className="min-w-0">
          <div
            role="button"
            tabIndex={0}
            onClick={() => actions.onView(product)}
            onKeyDown={(event) =>
              (event.key === "Enter" || event.key === " ") && actions.onView(product)
            }
            className={cn(
              "hover:bg-muted/40 focus-visible:ring-ring/50 flex h-full gap-3 rounded-lg border p-3 transition-colors outline-none focus-visible:ring-3",
              product.status === "Discontinued" && "opacity-60",
            )}
          >
            <ProductThumb
              name={product.name}
              categoryName={product.categoryName}
              imageUrl={product.imageUrl}
              className="size-14"
              iconClassName="size-6"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm leading-snug font-medium">{product.name}</p>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {product.brand}
                    <span className="mx-1">·</span>
                    {product.categoryName}
                    <span className="mx-1">·</span>
                    {petTypeLabel(product.petType)}
                  </p>
                </div>
                <ProductActionsMenu product={product} {...actions} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="text-primary text-sm font-semibold tabular-nums">
                  {formatCurrency(product.price)}
                </span>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    product.stockLevel === "OutOfStock" && "text-rose-600 dark:text-rose-400",
                    product.stockLevel === "LowStock" && "text-amber-600 dark:text-amber-300",
                    product.stockLevel === "InStock" && "text-muted-foreground",
                  )}
                >
                  {formatNumber(product.stockQuantity)} in stock
                </span>
                <StockBadge
                  level={product.stockLevel}
                  status={product.status}
                  className="ml-auto"
                />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
