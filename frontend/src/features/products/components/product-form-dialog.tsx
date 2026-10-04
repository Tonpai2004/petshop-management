"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toApiError } from "@/lib/api/api-error";
import {
  useCreateProduct,
  useRemoveProductImage,
  useUpdateProduct,
  useUploadProductImage,
} from "../hooks/use-product-mutations";
import {
  emptyProductForm,
  formValuesToPayload,
  productToFormValues,
  type ProductFormOutput,
} from "../schemas/product.schema";
import type { Category, Product } from "../types";
import { PRODUCT_FORM_ID, ProductForm, type PhotoChange } from "./product-form";

interface ProductFormDialogProps {
  open: boolean;
  product: Product | null;
  categories: Category[];
  onOpenChange: (open: boolean) => void;
}

export function ProductFormDialog({
  open,
  product,
  categories,
  onOpenChange,
}: ProductFormDialogProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const uploadImage = useUploadProductImage();
  const removeImage = useRemoveProductImage();

  const isEdit = product !== null;
  const mutation = isEdit ? updateProduct : createProduct;
  const serverError = mutation.error ? toApiError(mutation.error) : null;
  const isSaving = mutation.isPending || uploadImage.isPending || removeImage.isPending;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      createProduct.reset();
      updateProduct.reset();
    }
    onOpenChange(next);
  };

  // Save the details first, then the photo. If only the photo fails, the product is still saved
  // and we say so, rather than pretending the whole thing failed.
  const handleSubmit = async (
    values: ProductFormOutput,
    photo: PhotoChange,
    detailsChanged: boolean,
  ) => {
    const payload = formValuesToPayload(values);

    let saved: Product;
    try {
      if (isEdit && !detailsChanged) {
        // Only the photo changed, so leave the details alone and keep the history accurate.
        saved = product;
      } else {
        saved = isEdit
          ? await updateProduct.mutateAsync({ id: product.id, payload })
          : await createProduct.mutateAsync(payload);
      }
    } catch {
      return; // shown inside the dialog via mutation.error
    }

    try {
      if (photo.type === "replace") {
        await uploadImage.mutateAsync({ id: saved.id, image: photo.image });
      } else if (photo.type === "remove") {
        await removeImage.mutateAsync(saved.id);
      }
      toast.success(isEdit ? `${saved.name} has been updated.` : `${saved.name} has been added.`);
    } catch (error) {
      toast.warning(`${saved.name} was saved, but the photo wasn't: ${toApiError(error).message}`);
    }

    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${product.name}` : "Add a product"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details and save your changes."
              : "Add a new item to the shop's catalogue."}
          </DialogDescription>
        </DialogHeader>

        {serverError && Object.keys(serverError.fieldErrors).length === 0 && (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-3 py-2"
          >
            {serverError.message}
          </p>
        )}

        {/* key forces a fresh form whenever we switch between products */}
        <ProductForm
          key={product?.id ?? "new"}
          defaultValues={product ? productToFormValues(product) : emptyProductForm}
          currentImageUrl={product?.imageUrl}
          categories={categories}
          serverError={serverError}
          onSubmit={handleSubmit}
        />

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />} disabled={isSaving}>
            Cancel
          </DialogClose>
          <Button type="submit" form={PRODUCT_FORM_ID} disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin" />}
            {isEdit ? "Save changes" : "Add product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
