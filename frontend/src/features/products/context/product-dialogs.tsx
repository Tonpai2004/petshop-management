"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { AdjustStockDialog } from "../components/adjust-stock-dialog";
import { DeleteProductDialog } from "../components/delete-product-dialog";
import { ProductDetailSheet } from "../components/product-detail-sheet";
import { ProductFormDialog } from "../components/product-form-dialog";
import { useCategories } from "../hooks/use-products";
import type { Product } from "../types";

interface ProductDialogs {
  openCreate: () => void;
  openEdit: (product: Product) => void;
  openDetails: (product: Product) => void;
  openAdjustStock: (product: Product) => void;
  openDelete: (product: Product, onDeleted?: () => void) => void;
}

const ProductDialogsContext = createContext<ProductDialogs | null>(null);

/**
 * Owns the add/edit dialog, stock adjustment, delete confirmation and the detail sheet,
 * so any part of the dashboard (table, new arrivals, restock list, the sheet itself) can open them.
 */
export function ProductDialogsProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const { data: categories = [] } = useCategories();

  const [form, setForm] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [deleteState, setDeleteState] = useState<{
    product: Product;
    onDeleted?: () => void;
  } | null>(null);

  const openCreate = useCallback(() => setForm({ open: true, product: null }), []);
  const openEdit = useCallback((product: Product) => setForm({ open: true, product }), []);
  const openDetails = useCallback((product: Product) => setDetailProduct(product), []);
  const openAdjustStock = useCallback((product: Product) => setAdjustProduct(product), []);
  const openDelete = useCallback(
    (product: Product, onDeleted?: () => void) => setDeleteState({ product, onDeleted }),
    [],
  );

  const value = useMemo(
    () => ({ openCreate, openEdit, openDetails, openAdjustStock, openDelete }),
    [openCreate, openEdit, openDetails, openAdjustStock, openDelete],
  );

  return (
    <ProductDialogsContext.Provider value={value}>
      {children}

      <ProductDetailSheet
        product={detailProduct}
        canDelete={isAdmin}
        onClose={() => setDetailProduct(null)}
        onEdit={openEdit}
        onAdjustStock={openAdjustStock}
        onDelete={(product) => openDelete(product)}
      />
      <ProductFormDialog
        open={form.open}
        product={form.product}
        categories={categories}
        onOpenChange={(open) => setForm((state) => ({ ...state, open }))}
      />
      <AdjustStockDialog product={adjustProduct} onClose={() => setAdjustProduct(null)} />
      <DeleteProductDialog
        product={deleteState?.product ?? null}
        onClose={() => setDeleteState(null)}
        onDeleted={() => {
          deleteState?.onDeleted?.();
          // The product is gone, so its detail sheet has nothing left to show.
          setDetailProduct((current) => (current?.id === deleteState?.product.id ? null : current));
        }}
      />
    </ProductDialogsContext.Provider>
  );
}

export function useProductDialogs() {
  const context = useContext(ProductDialogsContext);
  if (!context) {
    throw new Error("useProductDialogs must be used inside <ProductDialogsProvider>.");
  }
  return context;
}
