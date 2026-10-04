"use client";

import { useState } from "react";
import { AlertTriangle, Download, Loader2, Package, Plus, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { AccentTitle } from "@/components/shared/accent-title";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toApiError } from "@/lib/api/api-error";
import { downloadBlob } from "@/lib/download";
import { productsApi } from "../api/products.api";
import { DEFAULT_PRODUCT_QUERY } from "../constants";
import { useProductDialogs } from "../context/product-dialogs";
import { useCategories, useProducts } from "../hooks/use-products";
import type { Product } from "../types";
import { ProductsList } from "./products-list";
import { ProductsPagination } from "./products-pagination";
import { ProductsTable } from "./products-table";
import {
  DEFAULT_FILTERS,
  filtersToQuery,
  ProductsToolbar,
  type ProductFilters,
} from "./products-toolbar";

export function ProductsSection() {
  const { isAdmin } = useAuth();
  const dialogs = useProductDialogs();
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(DEFAULT_PRODUCT_QUERY.page);
  const [pageSize, setPageSize] = useState(DEFAULT_PRODUCT_QUERY.pageSize);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedFilters = useDebouncedValue(filters, 300);
  const { data, isLoading, isError, isFetching, refetch } = useProducts({
    ...filtersToQuery(debouncedFilters),
    page,
    pageSize,
  });
  const { data: categories = [] } = useCategories();

  const changeFilters = (next: ProductFilters) => {
    setFilters(next);
    setPage(1);
  };

  const confirmDelete = (product: Product) =>
    dialogs.openDelete(product, () => {
      // Deleting the only product on a page would leave us looking at an empty page, so step back one.
      if (data?.items.length === 1 && page > 1) {
        setPage(page - 1);
      }
    });

  // Exports exactly what the filters show, across all pages.
  const exportCsv = async () => {
    setIsExporting(true);
    try {
      const { blob, fileName } = await productsApi.exportCsv(filtersToQuery(debouncedFilters));
      downloadBlob(blob, fileName);
      toast.success("Your CSV is downloading.");
    } catch (error) {
      toast.error(toApiError(error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const productActions = {
    canDelete: isAdmin,
    onView: dialogs.openDetails,
    onEdit: dialogs.openEdit,
    onAdjustStock: dialogs.openAdjustStock,
    onDelete: confirmDelete,
  };

  const isFiltered = JSON.stringify(debouncedFilters) !== JSON.stringify(DEFAULT_FILTERS);
  const isEmpty = data && data.items.length === 0;

  return (
    <Card>
      <CardHeader>
        <AccentTitle>Products</AccentTitle>
        <CardDescription>The full catalogue, including discontinued lines.</CardDescription>
        <CardAction className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={isExporting || isEmpty}>
            {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button onClick={dialogs.openCreate} aria-label="Add product">
            <Plus />
            {/* "Add" is enough on a phone, where the card header has very little room. */}
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add product</span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-4">
        <ProductsToolbar filters={filters} categories={categories} onChange={changeFilters} />

        {isError ? (
          <EmptyState
            icon={<AlertTriangle />}
            title="We couldn't load the products"
            description="The API didn't respond. Check that the backend is running and try again."
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        ) : isEmpty ? (
          isFiltered ? (
            <EmptyState
              icon={<SearchX />}
              title="No products match your filters"
              description="Try a different keyword or clear the filters."
              action={
                <Button variant="outline" onClick={() => changeFilters(DEFAULT_FILTERS)}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Package />}
              title="No products yet"
              description="Add the first product to start tracking your stock."
              action={
                <Button onClick={dialogs.openCreate}>
                  <Plus />
                  Add product
                </Button>
              }
            />
          )
        ) : (
          <div
            className={
              isFetching && !isLoading ? "opacity-60 transition-opacity" : "transition-opacity"
            }
          >
            {/* Cards on phones and tablets, the full table from laptop size up. */}
            <div className="lg:hidden">
              <ProductsList products={data?.items} isLoading={isLoading} {...productActions} />
            </div>
            <div className="hidden lg:block">
              <ProductsTable products={data?.items} isLoading={isLoading} {...productActions} />
            </div>
          </div>
        )}

        {data && data.totalItems > 0 && (
          <ProductsPagination
            page={data.page}
            pageSize={data.pageSize}
            totalItems={data.totalItems}
            totalPages={data.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
