import type { ProductQuery } from "../types";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (query: Partial<ProductQuery>) => [...productKeys.lists(), query] as const,
  detail: (id: number) => [...productKeys.all, "detail", id] as const,
  summary: () => [...productKeys.all, "summary"] as const,
  categories: () => [...productKeys.all, "categories"] as const,
};
