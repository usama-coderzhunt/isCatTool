import { z } from "zod";

export const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters long"),
});
export type resetPasswordSchema = z.infer<typeof resetPasswordSchema>;
