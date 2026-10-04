"use client";

import { RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DASHBOARD_SEARCH_INPUT_ID } from "@/config/routes";
import { PET_TYPES, SORT_OPTIONS, STOCK_LEVELS } from "../constants";
import type { Category, PetType, ProductSortField, SortDirection, StockLevel } from "../types";

const ALL = "all";

export interface ProductFilters {
  search: string;
  categoryId: string;
  petType: string;
  stockLevel: string;
  sort: `${ProductSortField}:${SortDirection}`;
}

export const DEFAULT_FILTERS: ProductFilters = {
  search: "",
  categoryId: ALL,
  petType: ALL,
  stockLevel: ALL,
  sort: "createdAt:desc",
};

export function filtersToQuery(filters: ProductFilters) {
  const [sortBy, sortDirection] = filters.sort.split(":") as [ProductSortField, SortDirection];

  return {
    search: filters.search.trim() || undefined,
    categoryId: filters.categoryId === ALL ? undefined : Number(filters.categoryId),
    petType: filters.petType === ALL ? undefined : (filters.petType as PetType),
    stockLevel: filters.stockLevel === ALL ? undefined : (filters.stockLevel as StockLevel),
    sortBy,
    sortDirection,
  };
}

interface FilterSelectProps {
  label: string;
  value: string;
  items: { value: string; label: string }[];
  className: string;
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, items, className, onChange }: FilterSelectProps) {
  return (
    <Select items={items} value={value} onValueChange={(next) => onChange(next ?? ALL)}>
      <SelectTrigger className={className} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface ProductsToolbarProps {
  filters: ProductFilters;
  categories: Category[];
  onChange: (filters: ProductFilters) => void;
}

export function ProductsToolbar({ filters, categories, onChange }: ProductsToolbarProps) {
  const update = (patch: Partial<ProductFilters>) => onChange({ ...filters, ...patch });

  const isFiltered = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <div className="relative flex-1 xl:max-w-xs">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          id={DASHBOARD_SEARCH_INPUT_ID}
          value={filters.search}
          onChange={(event) => update({ search: event.target.value })}
          placeholder="Search name, brand or SKU..."
          className="h-9 pr-8 pl-8"
          aria-label="Search products"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => update({ search: "" })}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 max-[359px]:grid-cols-1 sm:flex sm:flex-wrap sm:items-center">
        <FilterSelect
          label="Filter by category"
          value={filters.categoryId}
          items={[
            { value: ALL, label: "All categories" },
            ...categories.map((c) => ({ value: String(c.id), label: c.name })),
          ]}
          className="h-9 w-full sm:w-40"
          onChange={(categoryId) => update({ categoryId })}
        />
        <FilterSelect
          label="Filter by pet"
          value={filters.petType}
          items={[
            { value: ALL, label: "All pets" },
            ...PET_TYPES.filter((t) => t.value !== "AllPets"),
          ]}
          className="h-9 w-full sm:w-32"
          onChange={(petType) => update({ petType })}
        />
        <FilterSelect
          label="Filter by stock"
          value={filters.stockLevel}
          items={[{ value: ALL, label: "Any stock" }, ...STOCK_LEVELS]}
          className="h-9 w-full sm:w-36"
          onChange={(stockLevel) => update({ stockLevel })}
        />
        <FilterSelect
          label="Sort products"
          value={filters.sort}
          items={SORT_OPTIONS}
          className="h-9 w-full sm:w-44"
          onChange={(sort) => sort !== ALL && update({ sort: sort as ProductFilters["sort"] })}
        />

        {isFiltered && (
          <Button variant="ghost" className="h-9" onClick={() => onChange(DEFAULT_FILTERS)}>
            <RotateCcw />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
