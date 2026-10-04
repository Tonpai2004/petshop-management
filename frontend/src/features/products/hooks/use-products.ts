import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products.api";
import type { Product, ProductQuery } from "../types";
import { productKeys } from "./query-keys";

export function useProducts(query: Partial<ProductQuery>) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => productsApi.list(query),
    // Keep showing the current page while the next one loads, so the table doesn't flash.
    placeholderData: keepPreviousData,
  });
}

/** One product, starting from the copy we already have in the list so the sheet opens instantly. */
export function useProduct(id: number | null, snapshot?: Product) {
  return useQuery({
    queryKey: productKeys.detail(id ?? 0),
    queryFn: () => productsApi.get(id!),
    enabled: id !== null,
    placeholderData: snapshot,
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: productKeys.summary(),
    queryFn: productsApi.summary,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: productsApi.categories,
    staleTime: Infinity,
  });
}
