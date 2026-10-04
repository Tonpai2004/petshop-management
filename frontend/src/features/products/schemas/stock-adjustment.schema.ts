import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  reason: z.enum(["Received", "Sold", "Damaged", "Returned", "Correction"]),
  direction: z.enum(["add", "remove"]),
  quantity: z
    .string()
    .trim()
    .min(1, "How many items?")
    .pipe(
      z.coerce
        .number<string>({ error: "Enter a number." })
        .int("Whole numbers only.")
        .min(1, "At least 1.")
        .max(100_000, "That's too many for one adjustment."),
    ),
  note: z.string().trim().max(200, "Keep it under 200 characters."),
});

export type StockAdjustmentInput = z.input<typeof stockAdjustmentSchema>;
export type StockAdjustmentOutput = z.output<typeof stockAdjustmentSchema>;
