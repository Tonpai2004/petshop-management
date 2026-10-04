import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activityKeys } from "@/features/activity/hooks/use-activity";
import { productsApi } from "../api/products.api";
import type { ProductUpsertPayload, StockAdjustmentPayload } from "../types";
import { productKeys } from "./query-keys";

// Any change to a product affects the table, the dashboard numbers and the activity feed.
function useRefreshProducts() {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
      queryClient.invalidateQueries({ queryKey: activityKeys.all }),
    ]);
}

export function useCreateProduct() {
  const refresh = useRefreshProducts();
  return useMutation({
    mutationFn: (payload: ProductUpsertPayload) => productsApi.create(payload),
    onSuccess: refresh,
  });
}

export function useUpdateProduct() {
  const refresh = useRefreshProducts();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductUpsertPayload }) =>
      productsApi.update(id, payload),
    onSuccess: refresh,
  });
}

export function useDeleteProduct() {
  const refresh = useRefreshProducts();
  return useMutation({ mutationFn: (id: number) => productsApi.remove(id), onSuccess: refresh });
}

export function useAdjustStock() {
  const refresh = useRefreshProducts();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StockAdjustmentPayload }) =>
      productsApi.adjustStock(id, payload),
    onSuccess: refresh,
  });
}

export function useUploadProductImage() {
  const refresh = useRefreshProducts();
  return useMutation({
    mutationFn: ({ id, image }: { id: number; image: Blob }) => productsApi.uploadImage(id, image),
    onSuccess: refresh,
  });
}

export function useRemoveProductImage() {
  const refresh = useRefreshProducts();
  return useMutation({
    mutationFn: (id: number) => productsApi.removeImage(id),
    onSuccess: refresh,
  });
}
