"use client";

import { Eye, MoreHorizontal, PackagePlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "../types";

export interface ProductActions {
  canDelete: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onDelete: (product: Product) => void;
}

/** The "..." menu shared by the desktop table rows and the mobile cards. */
export function ProductActionsMenu({
  product,
  canDelete,
  onView,
  onEdit,
  onAdjustStock,
  onDelete,
}: ProductActions & { product: Product }) {
  return (
    // Clicks in the menu shouldn't also open the detail sheet behind it.
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${product.name}`} />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => onView(product)}>
            <Eye />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAdjustStock(product)}>
            <PackagePlus />
            Adjust stock
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(product)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(product)}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
