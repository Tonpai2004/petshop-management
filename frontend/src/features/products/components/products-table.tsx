"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "../types";
import { PetTypeTag } from "./pet-type-tag";
import { ProductActionsMenu } from "./product-actions-menu";
import { ProductThumb } from "./product-thumb";
import { StockBadge } from "./stock-badge";

interface ProductsTableProps {
  products?: Product[];
  isLoading: boolean;
  canDelete: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const COLUMN_COUNT = 8;

export function ProductsTable({
  products,
  isLoading,
  canDelete,
  onView,
  onEdit,
  onAdjustStock,
  onDelete,
}: ProductsTableProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="pl-4">Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>For</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">In stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden xl:table-cell">Last update</TableHead>
            <TableHead className="w-12 pr-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && !products
            ? Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={COLUMN_COUNT} className="px-4">
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : products?.map((product) => (
                <TableRow
                  key={product.id}
                  className={cn(
                    "group cursor-pointer",
                    product.status === "Discontinued" && "opacity-60",
                  )}
                  onClick={() => onView(product)}
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <ProductThumb
                        name={product.name}
                        categoryName={product.categoryName}
                        imageUrl={product.imageUrl}
                      />
                      <div className="min-w-0">
                        <p className="max-w-64 truncate font-medium">{product.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {product.brand}
                          <span className="mx-1">·</span>
                          <span className="font-mono">{product.sku}</span>
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p>{product.categoryName}</p>
                    {product.unit && (
                      <p className="text-muted-foreground text-xs">{product.unit}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <PetTypeTag type={product.petType} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <p
                      className={cn(
                        "font-medium",
                        product.stockLevel === "OutOfStock" && "text-rose-600 dark:text-rose-400",
                        product.stockLevel === "LowStock" && "text-amber-600 dark:text-amber-300",
                      )}
                    >
                      {formatNumber(product.stockQuantity)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      reorder at {product.reorderLevel}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StockBadge level={product.stockLevel} status={product.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-xs xl:table-cell">
                    <p>{formatRelative(product.updatedAt)}</p>
                    {product.updatedByName && <p>by {product.updatedByName}</p>}
                  </TableCell>
                  <TableCell className="pr-4">
                    <ProductActionsMenu
                      product={product}
                      canDelete={canDelete}
                      onView={onView}
                      onEdit={onEdit}
                      onAdjustStock={onAdjustStock}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
