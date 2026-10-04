import { httpClient } from "@/lib/api/http-client";
import { fileNameFromDisposition } from "@/lib/download";
import type { PagedResult } from "@/lib/types";
import type {
  Category,
  InventorySummary,
  Product,
  ProductQuery,
  ProductUpsertPayload,
  StockAdjustmentPayload,
} from "../types";

export const productsApi = {
  async list(query: Partial<ProductQuery>) {
    const { data } = await httpClient.get<PagedResult<Product>>("/products", { params: query });
    return data;
  },

  async get(id: number) {
    const { data } = await httpClient.get<Product>(`/products/${id}`);
    return data;
  },

  async create(payload: ProductUpsertPayload) {
    const { data } = await httpClient.post<Product>("/products", payload);
    return data;
  },

  async update(id: number, payload: ProductUpsertPayload) {
    const { data } = await httpClient.put<Product>(`/products/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await httpClient.delete(`/products/${id}`);
  },

  async adjustStock(id: number, payload: StockAdjustmentPayload) {
    const { data } = await httpClient.post<Product>(`/products/${id}/stock`, payload);
    return data;
  },

  async uploadImage(id: number, image: Blob) {
    const form = new FormData();
    form.append("file", image, `product-${id}.${image.type.split("/")[1] ?? "jpg"}`);
    // Let the browser set multipart/form-data with the right boundary.
    const { data } = await httpClient.post<Product>(`/products/${id}/image`, form, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  async removeImage(id: number) {
    const { data } = await httpClient.delete<Product>(`/products/${id}/image`);
    return data;
  },

  async exportCsv(query: Omit<ProductQuery, "page" | "pageSize">) {
    const response = await httpClient.get<Blob>("/products/export", {
      params: query,
      responseType: "blob",
    });
    return {
      blob: response.data,
      fileName: fileNameFromDisposition(response.headers["content-disposition"], "products.csv"),
    };
  },

  async summary() {
    const { data } = await httpClient.get<InventorySummary>("/products/summary");
    return data;
  },

  async categories() {
    const { data } = await httpClient.get<Category[]>("/products/categories");
    return data;
  },
};
