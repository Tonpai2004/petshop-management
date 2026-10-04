"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toApiError } from "@/lib/api/api-error";
import { useDeleteProduct } from "../hooks/use-product-mutations";
import type { Product } from "../types";

interface DeleteProductDialogProps {
  product: Product | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteProductDialog({ product, onClose, onDeleted }: DeleteProductDialogProps) {
  const deleteProduct = useDeleteProduct();

  const confirm = () => {
    if (!product) return;

    deleteProduct.mutate(product.id, {
      onSuccess: () => {
        toast.success(`${product.name} has been removed.`);
        onDeleted?.();
        onClose();
      },
      onError: (error) => toast.error(toApiError(error).message),
    });
  };

  return (
    <AlertDialog open={product !== null} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {product?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes {product?.sku} from the catalogue for good. If the shop just stopped
            selling it, marking it as discontinued keeps its history instead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteProduct.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={confirm}
            disabled={deleteProduct.isPending}
          >
            {deleteProduct.isPending && <Loader2 className="animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
