"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { PhotoPicker } from "@/components/shared/photo-picker";
import type { ApiError } from "@/lib/api/api-error";
import { resolveAssetUrl } from "@/lib/assets";
import { resizeImage } from "@/lib/image";
import { PET_TYPES, PRODUCT_STATUSES } from "../constants";
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormOutput,
} from "../schemas/product.schema";
import type { Category } from "../types";

export const PRODUCT_FORM_ID = "product-form";

/** What should happen to the photo when the form is saved. */
export type PhotoChange = { type: "keep" } | { type: "replace"; image: Blob } | { type: "remove" };

interface ProductFormProps {
  defaultValues: ProductFormInput;
  currentImageUrl?: string | null;
  categories: Category[];
  serverError?: ApiError | null;
  onSubmit: (values: ProductFormOutput, photo: PhotoChange, detailsChanged: boolean) => void;
}

export function ProductForm({
  defaultValues,
  currentImageUrl,
  categories,
  serverError,
  onSubmit,
}: ProductFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  const [photo, setPhoto] = useState<PhotoChange>({ type: "keep" });
  const [previewUrl, setPreviewUrl] = useState(resolveAssetUrl(currentImageUrl));
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const objectUrl = useRef<string | null>(null);

  // Show the API's validation messages right under the matching inputs.
  useEffect(() => {
    if (!serverError) return;

    for (const [field, message] of Object.entries(serverError.fieldErrors)) {
      if (field in defaultValues) {
        setError(field as keyof ProductFormInput, { type: "server", message });
      }
    }
  }, [serverError, setError, defaultValues]);

  // Free the preview's memory when the dialog closes.
  useEffect(
    () => () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  const showPreview = (blob: Blob | null) => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = blob ? URL.createObjectURL(blob) : null;
    setPreviewUrl(objectUrl.current);
  };

  const pickPhoto = async (file: File) => {
    setPhotoError(null);
    setIsProcessingPhoto(true);
    try {
      const image = await resizeImage(file);
      setPhoto({ type: "replace", image });
      showPreview(image);
    } catch {
      setPhotoError("We couldn't read that image. Try another one.");
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const removePhoto = () => {
    setPhoto(currentImageUrl ? { type: "remove" } : { type: "keep" });
    setPhotoError(null);
    showPreview(null);
  };

  const categoryItems = categories.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <form
      id={PRODUCT_FORM_ID}
      onSubmit={handleSubmit((values) => onSubmit(values, photo, isDirty))}
      noValidate
      className="grid gap-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <PhotoPicker
          previewUrl={previewUrl}
          isProcessing={isProcessingPhoto}
          error={photoError ?? serverError?.fieldErrors.file}
          onPick={pickPhoto}
          onRemove={removePhoto}
          onError={setPhotoError}
        />
      </div>

      <FormField
        id="name"
        label="Product name"
        required
        error={errors.name?.message}
        className="sm:col-span-2"
      >
        <Input
          id="name"
          placeholder="e.g. Mini Adult Dry Dog Food"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
      </FormField>

      <FormField id="brand" label="Brand" required error={errors.brand?.message}>
        <Input
          id="brand"
          placeholder="e.g. Royal Canin"
          aria-invalid={Boolean(errors.brand)}
          {...register("brand")}
        />
      </FormField>

      <FormField
        id="sku"
        label="SKU"
        required
        hint="The code on the shelf label."
        error={errors.sku?.message}
      >
        <Input
          id="sku"
          placeholder="e.g. FD-RC-MINI-15"
          className="font-mono uppercase placeholder:normal-case"
          aria-invalid={Boolean(errors.sku)}
          {...register("sku")}
        />
      </FormField>

      <FormField id="categoryId" label="Category" required error={errors.categoryId?.message}>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select
              items={categoryItems}
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
            >
              <SelectTrigger
                id="categoryId"
                className="w-full"
                aria-invalid={Boolean(errors.categoryId)}
              >
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField id="petType" label="Made for" required error={errors.petType?.message}>
        <Controller
          control={control}
          name="petType"
          render={({ field }) => (
            <Select
              items={PET_TYPES}
              value={field.value}
              onValueChange={(value) => value && field.onChange(value)}
            >
              <SelectTrigger id="petType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PET_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField id="unit" label="Pack size" error={errors.unit?.message}>
        <Input
          id="unit"
          placeholder="e.g. 1.5 kg bag"
          aria-invalid={Boolean(errors.unit)}
          {...register("unit")}
        />
      </FormField>

      <FormField id="price" label="Price (THB)" required error={errors.price?.message}>
        <Input
          id="price"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0.00"
          aria-invalid={Boolean(errors.price)}
          {...register("price")}
        />
      </FormField>

      <FormField id="stockQuantity" label="In stock" required error={errors.stockQuantity?.message}>
        <Input
          id="stockQuantity"
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          aria-invalid={Boolean(errors.stockQuantity)}
          {...register("stockQuantity")}
        />
      </FormField>

      <FormField
        id="reorderLevel"
        label="Reorder at"
        required
        hint="Shows as low stock at or below this number."
        error={errors.reorderLevel?.message}
      >
        <Input
          id="reorderLevel"
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          aria-invalid={Boolean(errors.reorderLevel)}
          {...register("reorderLevel")}
        />
      </FormField>

      <FormField id="status" label="Status" required error={errors.status?.message}>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              items={PRODUCT_STATUSES}
              value={field.value}
              onValueChange={(value) => value && field.onChange(value)}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField
        id="description"
        label="Notes"
        error={errors.description?.message}
        className="sm:col-span-2"
      >
        <Textarea
          id="description"
          rows={3}
          placeholder="Ingredients, who it's for, supplier notes..."
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
      </FormField>
    </form>
  );
}
