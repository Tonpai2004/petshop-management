"use client";

import type { ReactNode } from "react";
import { PackagePlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ActivityList } from "@/features/activity/components/activity-list";
import { useProductActivity } from "@/features/activity/hooks/use-activity";
import { formatCurrency, formatNumber, formatRelative } from "@/lib/format";
import { useProduct } from "../hooks/use-products";
import type { Product } from "../types";
import { PetTypeTag } from "./pet-type-tag";
import { ProductThumb } from "./product-thumb";
import { StockBadge } from "./stock-badge";

interface ProductDetailSheetProps {
  product: Product | null;
  canDelete: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductDetailSheet({
  product: snapshot,
  canDelete,
  onClose,
  onEdit,
  onAdjustStock,
  onDelete,
}: ProductDetailSheetProps) {
  const { data: product = snapshot } = useProduct(snapshot?.id ?? null, snapshot ?? undefined);
  const { data: history, isLoading: isHistoryLoading } = useProductActivity(snapshot?.id ?? null);

  return (
    <Sheet open={snapshot !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md">
        {product && (
          <>
            <div className="relative">
              <ProductThumb
                name={product.name}
                categoryName={product.categoryName}
                imageUrl={product.imageUrl}
                className="aspect-[4/3] size-auto w-full rounded-none"
                iconClassName="size-20 opacity-80"
              />
              <div className="absolute bottom-3 left-3">
                <StockBadge
                  level={product.stockLevel}
                  status={product.status}
                  className="bg-background/90 backdrop-blur"
                />
              </div>
            </div>

            <SheetHeader className="px-5 pt-5 pb-0">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {product.brand}
              </p>
              <SheetTitle className="text-xl leading-snug">{product.name}</SheetTitle>
              <SheetDescription>
                {product.categoryName}
                {product.unit && ` · ${product.unit}`}
              </SheetDescription>
              <p className="text-primary pt-1 text-2xl font-semibold tabular-nums">
                {formatCurrency(product.price)}
              </p>
            </SheetHeader>

            <div className="grid gap-5 p-5">
              <div className="grid grid-cols-3 divide-x rounded-lg border text-center">
                <Stat label="In stock" value={formatNumber(product.stockQuantity)} />
                <Stat label="Reorder at" value={formatNumber(product.reorderLevel)} />
                <Stat
                  label="Stock value"
                  value={formatCurrency(product.price * product.stockQuantity)}
                />
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Detail label="SKU">
                  <span className="font-mono">{product.sku}</span>
                </Detail>
                <Detail label="Made for">
                  <PetTypeTag type={product.petType} className="text-foreground" />
                </Detail>
                <Detail label="Status">{product.status}</Detail>
                <Detail label="Last update">
                  {formatRelative(product.updatedAt)}
                  {product.updatedByName && (
                    <span className="text-muted-foreground"> · {product.updatedByName}</span>
                  )}
                </Detail>
              </dl>

              {product.description && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p className="text-muted-foreground mb-1 text-xs font-medium">Notes</p>
                  {product.description}
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => onAdjustStock(product)}>
                  <PackagePlus />
                  Adjust stock
                </Button>
                <Button variant="outline" onClick={() => onEdit(product)}>
                  <Pencil />
                  Edit
                </Button>
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(product)}
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>

              <Separator />

              <section>
                <h3 className="mb-4 text-sm font-medium">History</h3>
                <ActivityList
                  items={history}
                  isLoading={isHistoryLoading}
                  emptyText="No changes recorded yet."
                />
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
