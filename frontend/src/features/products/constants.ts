import type {
  PetType,
  ProductQuery,
  ProductSortField,
  ProductStatus,
  SortDirection,
  StockAdjustmentReason,
  StockLevel,
} from "./types";

export const PET_TYPES: { value: PetType; label: string }[] = [
  { value: "Dog", label: "Dogs" },
  { value: "Cat", label: "Cats" },
  { value: "Bird", label: "Birds" },
  { value: "Fish", label: "Fish" },
  { value: "SmallPet", label: "Small pets" },
  { value: "AllPets", label: "All pets" },
];

export const petTypeLabel = (type: PetType) =>
  PET_TYPES.find((t) => t.value === type)?.label ?? type;

export const PRODUCT_STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "Active", label: "Active" },
  { value: "Discontinued", label: "Discontinued" },
];

export const STOCK_LEVELS: { value: StockLevel; label: string }[] = [
  { value: "InStock", label: "In stock" },
  { value: "LowStock", label: "Low stock" },
  { value: "OutOfStock", label: "Out of stock" },
];

export const STOCK_STYLES: Record<
  StockLevel,
  { label: string; badge: string; dot: string; bar: string }
> = {
  InStock: {
    label: "In stock",
    badge:
      "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 dark:text-emerald-400 dark:ring-emerald-500/25",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  LowStock: {
    label: "Low stock",
    badge:
      "bg-amber-500/10 text-amber-700 ring-amber-600/25 dark:text-amber-300 dark:ring-amber-500/25",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  OutOfStock: {
    label: "Out of stock",
    badge: "bg-rose-500/10 text-rose-700 ring-rose-600/20 dark:text-rose-400 dark:ring-rose-500/25",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
};

/** Which way each reason moves the stock. Corrections can go either way. */
export const ADJUSTMENT_REASONS: {
  value: StockAdjustmentReason;
  label: string;
  direction: 1 | -1 | 0;
}[] = [
  { value: "Received", label: "Delivery received", direction: 1 },
  { value: "Sold", label: "Sold", direction: -1 },
  { value: "Returned", label: "Customer return", direction: 1 },
  { value: "Damaged", label: "Damaged or expired", direction: -1 },
  { value: "Correction", label: "Stock count correction", direction: 0 },
];

export const SORT_OPTIONS: { value: `${ProductSortField}:${SortDirection}`; label: string }[] = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "name:asc", label: "Name A-Z" },
  { value: "price:asc", label: "Price low to high" },
  { value: "price:desc", label: "Price high to low" },
  { value: "stock:asc", label: "Lowest stock first" },
  { value: "stock:desc", label: "Highest stock first" },
];

export const PAGE_SIZES = [5, 10, 20, 50];

export const DEFAULT_PRODUCT_QUERY: ProductQuery = {
  page: 1,
  pageSize: 10,
  sortBy: "createdAt",
  sortDirection: "desc",
};
