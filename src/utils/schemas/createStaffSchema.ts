import { z } from 'zod';

export const createStaffSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }),
    middle_name: z.string().min(1, { message: 'Middle name is required' }),
    first_name: z.string().min(1, { message: 'First name is required' }),
    last_name: z.string().min(1, { message: 'Last name is required' }),
    email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email format' }),
    phone_number: z
        .string()
        .min(6, { message: 'Phone number must be at least 6 digits long' })
        .max(15, { message: 'Phone number must not exceed 15 digits' })
        .regex(/^\+(?:[0-9] ?){6,14}[0-9]$/, { message: 'Invalid phone number format' }),
    position: z.number().nullable().default(null).refine((val) => val !== undefined, { message: 'Position is required' }),
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters' })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }),
    password2: z.string().min(1, { message: 'Confirm password is required' }),
}).superRefine((data, ctx) => {
    if (data.password !== data.password2) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Passwords must match',
            path: ['password2'],
        });
    }
});


export const updateStaffSchema = z.object({
    first_name: z.string().min(1, { message: 'First name is required' }),
    middle_name: z.string().min(1, { message: 'Middle name is required' }),
    last_name: z.string().min(1, { message: 'Last name is required' }),
    email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email format' }),
    phone_number: z
        .string()
        .min(6, { message: 'Phone number must be at least 6 digits long' })
        .max(15, { message: 'Phone number must not exceed 15 digits' })
        .regex(/^\+(?:[0-9] ?){6,14}[0-9]$/, { message: 'Invalid phone number format' }),
    position: z.number().nullable().default(null).refine((val) => val !== undefined, { message: 'Position is required' })
});

export type createStaffSchema = z.infer<typeof createStaffSchema>;
export type updateStaffSchema = z.infer<typeof updateStaffSchema>;
