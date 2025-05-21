import { z } from 'zod';

export const todoItemsSchema = z.object({
    subject: z.string().min(1, { message: 'Subject is required' }),
    due_date: z.string().nullable().default(null),
    completed: z.boolean().default(false),
    description: z.string().nullable().default(null),
    send_to_google_calendar: z.string()
        .transform((val) => {
            if (!val || val === '') return 'NO';
            return val.toUpperCase();
        })
        .refine((val) => val === 'NO' || val === 'SO' || val === 'SC', {
            message: 'Please select either No or Staff Only or Staff and Client'
        })
        .default('NO'),
    notification: z.number().nullable().default(null),
    todo: z.number().min(1, { message: "Todo is required" }),
});

export type TodoItemsSchema = z.infer<typeof todoItemsSchema>;
