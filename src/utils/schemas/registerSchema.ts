import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(1, "User name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters long")
        .refine((value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/.test(value), {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        })
});

export type registerSchema = z.infer<typeof registerSchema>;
