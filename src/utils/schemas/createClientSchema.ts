import { z } from 'zod'

export const createClientSchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required' }),
  last_name: z.string().nullable().default(null),
  middle_name: z.string().nullable().default(null),
  email: z.string().email({ message: 'Invalid email format' }).nullable().default(null),
  phone_number: z
    .string()
    .min(6, { message: 'Phone number must be at least 6 digits long' })
    .max(15, { message: 'Phone number must not exceed 15 digits' })
    .regex(/^\+(?:[0-9] ?){6,14}[0-9]$/, { message: 'Invalid phone number format' })
    .nullable()
    .default(null),
  date_of_birth: z.string().nullable().default(null),
  address: z.string().nullable().default(null),
  customer_country: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
  client_type: z.enum(['lead', 'client'], { message: 'Invalid client type' }).nullable().default(null),
  is_active: z.boolean().nullable().default(null)
})

export type CreateClientSchema = z.infer<typeof createClientSchema>
