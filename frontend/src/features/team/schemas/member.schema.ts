import { z } from "zod";
import { strongPassword } from "@/lib/validation/password";

export const addMemberSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter their name.").max(100),
  username: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters.")
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, "Letters, numbers, dots, dashes or underscores only."),
  password: strongPassword,
  role: z.enum(["Admin", "Staff"]),
});

export type AddMemberValues = z.infer<typeof addMemberSchema>;

export const resetPasswordSchema = z.object({ password: strongPassword });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
