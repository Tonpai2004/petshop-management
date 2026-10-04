export type PetType = "Dog" | "Cat" | "Bird" | "Fish" | "SmallPet" | "AllPets";
export type StockLevel = "InStock" | "LowStock" | "OutOfStock";
export type ProductStatus = "Active" | "Discontinued";
export type StockAdjustmentReason = "Received" | "Sold" | "Damaged" | "Returned" | "Correction";

export interface Product {
  id: number;
  sku: string;
  name: string;
  brand: string;
  categoryId: number;
  categoryName: string;
  petType: PetType;
  unit: string | null;
  price: number;
  stockQuantity: number;
  reorderLevel: number;
  stockLevel: StockLevel;
  status: ProductStatus;
  imageUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  updatedByName: string | null;
}

export interface ProductUpsertPayload {
  sku: string;
  name: string;
  brand: string;
  categoryId: number;
  petType: PetType;
  unit: string | null;
  price: number;
  stockQuantity: number;
  reorderLevel: number;
  status: ProductStatus;
  description: string | null;
}

export interface StockAdjustmentPayload {
  quantityChange: number;
  reason: StockAdjustmentReason;
  note?: string;
}

export type ProductSortField = "name" | "price" | "stock" | "createdAt" | "updatedAt";
export type SortDirection = "asc" | "desc";

export interface ProductQuery {
  search?: string;
  categoryId?: number;
  petType?: PetType;
  stockLevel?: StockLevel;
  status?: ProductStatus;
  page: number;
  pageSize: number;
  sortBy: ProductSortField;
  sortDirection: SortDirection;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  inStock: number;
  needsRestock: number;
  stockValue: number;
}

export interface InventorySummary {
  totalProducts: number;
  totalUnits: number;
  stockValue: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  discontinued: number;
  byCategory: CategoryBreakdown[];
}
