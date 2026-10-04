"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Minus, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { toApiError } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";
import { ADJUSTMENT_REASONS } from "../constants";
import { useAdjustStock } from "../hooks/use-product-mutations";
import {
  stockAdjustmentSchema,
  type StockAdjustmentInput,
  type StockAdjustmentOutput,
} from "../schemas/stock-adjustment.schema";
import type { Product } from "../types";
import { ProductThumb } from "./product-thumb";

const FORM_ID = "adjust-stock-form";

interface AdjustStockDialogProps {
  product: Product | null;
  onClose: () => void;
}

export function AdjustStockDialog({ product, onClose }: AdjustStockDialogProps) {
  const adjustStock = useAdjustStock();
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<StockAdjustmentInput, unknown, StockAdjustmentOutput>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: { reason: "Received", direction: "add", quantity: "", note: "" },
  });

  const [reason, direction, quantityText] = useWatch({
    control,
    name: ["reason", "direction", "quantity"],
  });
  const fixedDirection = ADJUSTMENT_REASONS.find((r) => r.value === reason)?.direction ?? 0;

  // Most reasons only go one way: a delivery always adds, a sale always removes.
  useEffect(() => {
    if (fixedDirection !== 0) setValue("direction", fixedDirection > 0 ? "add" : "remove");
  }, [fixedDirection, setValue]);

  const quantity = Number(quantityText) || 0;
  const change = direction === "add" ? quantity : -quantity;
  const after = (product?.stockQuantity ?? 0) + change;

  const close = () => {
    reset();
    adjustStock.reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    if (!product) return;
    adjustStock.mutate(
      {
        id: product.id,
        payload: {
          quantityChange: values.direction === "add" ? values.quantity : -values.quantity,
          reason: values.reason,
          note: values.note || undefined,
        },
      },
      {
        onSuccess: (updated) => {
          toast.success(`${updated.name} now has ${updated.stockQuantity} in stock.`);
          close();
        },
        onError: (error) => {
          const apiError = toApiError(error);
          if (apiError.fieldErrors.quantityChange)
            setError("quantity", { message: apiError.fieldErrors.quantityChange });
          else toast.error(apiError.message);
        },
      },
    );
  });

  return (
    <Dialog open={product !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            Record a delivery, a sale or anything else that changes the count.
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
            <ProductThumb
              name={product.name}
              categoryName={product.categoryName}
              imageUrl={product.imageUrl}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="text-muted-foreground font-mono text-xs">{product.sku}</p>
            </div>
          </div>
        )}

        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField id="adjust-reason" label="What happened?">
            <Controller
              control={control}
              name="reason"
              render={({ field }) => (
                <Select
                  items={ADJUSTMENT_REASONS}
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                >
                  <SelectTrigger id="adjust-reason" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADJUSTMENT_REASONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <div className="grid grid-cols-[auto_1fr] items-end gap-3">
            <div
              className="bg-muted inline-flex h-8 rounded-lg p-0.5"
              role="group"
              aria-label="Add or remove"
            >
              {(["add", "remove"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={fixedDirection !== 0}
                  onClick={() => setValue("direction", value)}
                  aria-pressed={direction === value}
                  aria-label={value === "add" ? "Add stock" : "Remove stock"}
                  className={cn(
                    "flex w-9 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed",
                    direction === value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  {value === "add" ? <Plus className="size-4" /> : <Minus className="size-4" />}
                </button>
              ))}
            </div>
            <FormField id="adjust-quantity" label="Quantity" error={errors.quantity?.message}>
              <Input
                id="adjust-quantity"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                placeholder="0"
                autoFocus
                aria-invalid={Boolean(errors.quantity)}
                {...register("quantity")}
              />
            </FormField>
          </div>

          <FormField
            id="adjust-note"
            label="Note"
            hint="Optional, e.g. invoice number or who it was sold to."
            error={errors.note?.message}
          >
            <Input id="adjust-note" placeholder="e.g. Invoice #2045" {...register("note")} />
          </FormField>

          {product && quantity > 0 && (
            <p
              className={cn(
                "flex items-center gap-2 text-sm",
                after < 0 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              Stock goes from{" "}
              <span className="text-foreground font-medium tabular-nums">
                {product.stockQuantity}
              </span>
              <ArrowRight className="size-3.5" />
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  after < 0 ? "text-destructive" : "text-foreground",
                )}
              >
                {after}
              </span>
              {after < 0 && "(not enough in stock)"}
            </p>
          )}
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form={FORM_ID} disabled={adjustStock.isPending}>
            {adjustStock.isPending && <Loader2 className="animate-spin" />}
            Save adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
