import { z } from "zod";

export const forgotSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export type forgotSchema = z.infer<typeof forgotSchema>;
