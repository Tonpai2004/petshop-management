import { z } from "zod";
import type { PetType, Product, ProductStatus, ProductUpsertPayload } from "../types";

// Number inputs hand us strings, so parse them here and keep the error message friendly.
const numberField = (label: string, min: number, max: number, integer = false) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .pipe(
      z.coerce
        .number<string>({ error: `${label} must be a number.` })
        .min(min, `${label} must be at least ${min}.`)
        .max(max, `${label} can't be more than ${max.toLocaleString()}.`)
        .refine((value) => !integer || Number.isInteger(value), `${label} must be a whole number.`),
    );

const optionalText = (max: number) =>
  z.string().trim().max(max, `Keep it under ${max} characters.`);

export const productFormSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(3, "SKU needs at least 3 characters.")
    .max(30)
    .regex(/^[A-Za-z0-9-]+$/, "Letters, numbers and dashes only."),
  name: z.string().trim().min(1, "Name is required.").max(150, "Keep it under 150 characters."),
  brand: z.string().trim().min(1, "Brand is required.").max(80, "Keep it under 80 characters."),
  categoryId: z.string().min(1, "Please choose a category."),
  petType: z.enum(["Dog", "Cat", "Bird", "Fish", "SmallPet", "AllPets"] satisfies PetType[]),
  unit: optionalText(50),
  price: numberField("Price", 0, 1_000_000),
  stockQuantity: numberField("Stock", 0, 1_000_000, true),
  reorderLevel: numberField("Reorder level", 0, 100_000, true),
  status: z.enum(["Active", "Discontinued"] satisfies ProductStatus[]),
  description: optionalText(1000),
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;

export const emptyProductForm: ProductFormInput = {
  sku: "",
  name: "",
  brand: "",
  categoryId: "",
  petType: "Dog",
  unit: "",
  price: "",
  stockQuantity: "0",
  reorderLevel: "5",
  status: "Active",
  description: "",
};

export function productToFormValues(product: Product): ProductFormInput {
  return {
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    categoryId: String(product.categoryId),
    petType: product.petType,
    unit: product.unit ?? "",
    price: String(product.price),
    stockQuantity: String(product.stockQuantity),
    reorderLevel: String(product.reorderLevel),
    status: product.status,
    description: product.description ?? "",
  };
}

export function formValuesToPayload(values: ProductFormOutput): ProductUpsertPayload {
  return {
    ...values,
    sku: values.sku.toUpperCase(),
    categoryId: Number(values.categoryId),
    unit: values.unit || null,
    description: values.description || null,
  };
}
