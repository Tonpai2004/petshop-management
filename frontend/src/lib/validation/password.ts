import { z } from "zod";

// Same rule as the API's [StrongPassword], so people find out before they hit save.
export const strongPassword = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(100, "Keep it under 100 characters.")
  .regex(/[A-Z]/, "Add at least one uppercase letter.")
  .regex(/[a-z]/, "Add at least one lowercase letter.")
  .regex(/[0-9]/, "Add at least one number.");
