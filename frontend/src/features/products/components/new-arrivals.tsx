"use client";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AccentTitle } from "@/components/shared/accent-title";
import { formatCurrency } from "@/lib/format";
import { useProductDialogs } from "../context/product-dialogs";
import { useProducts } from "../hooks/use-products";
import type { Product } from "../types";
import { ProductThumb } from "./product-thumb";
import { StockBadge } from "./stock-badge";

const LATEST = {
  page: 1,
  pageSize: 6,
  sortBy: "createdAt",
  sortDirection: "desc",
  status: "Active",
} as const;

// A "poster row" of the newest products, borrowed from how one31 lists its latest shows.
export function NewArrivals() {
  const { data, isLoading } = useProducts(LATEST);

  return (
    <Card>
      <CardHeader>
        <AccentTitle>New on the shelf</AccentTitle>
        <CardDescription>The six latest products added to the catalogue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-1 md:grid md:grid-cols-3 md:overflow-visible">
          {isLoading || !data
            ? Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="aspect-[4/3] w-40 shrink-0 rounded-lg md:w-auto" />
              ))
            : data.items.map((product) => <ArrivalTile key={product.id} product={product} />)}
        </div>
      </CardContent>
    </Card>
  );
}

function ArrivalTile({ product }: { product: Product }) {
  const { openDetails } = useProductDialogs();

  return (
    <button
      type="button"
      onClick={() => openDetails(product)}
      className="group focus-visible:ring-ring/50 w-40 shrink-0 snap-start rounded-lg text-left outline-none focus-visible:ring-3 md:w-auto"
    >
      <div className="relative overflow-hidden rounded-lg ring-1 ring-black/5 dark:ring-white/5">
        <ProductThumb
          name={product.name}
          categoryName={product.categoryName}
          imageUrl={product.imageUrl}
          className="aspect-[4/3] size-auto w-full rounded-lg transition-transform duration-300 group-hover:scale-105"
          iconClassName="size-12 opacity-80"
        />
        <div className="absolute top-2 left-2">
          <StockBadge level={product.stockLevel} className="bg-background/90 backdrop-blur" />
        </div>
      </div>
      <div className="mt-2.5">
        <p className="text-muted-foreground truncate text-[11px] font-medium tracking-wide uppercase">
          {product.brand}
        </p>
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="text-primary mt-1 text-sm font-semibold tabular-nums">
          {formatCurrency(product.price)}
        </p>
      </div>
    </button>
  );
}
