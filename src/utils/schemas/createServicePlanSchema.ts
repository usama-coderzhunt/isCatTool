import { z } from 'zod'

export const createServicePlanSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  service_type: z
    .string()
    .min(1, { message: 'Service Type is required' })
    .refine(val => val === 'subscription' || val === 'one_time', {
      message: 'Please select a valid service type'
    }),
  price: z
    .number({ required_error: 'Price is required', invalid_type_error: 'Price must be a valid number' })
    .min(0, { message: 'Values must be zero or a positive number' })
    .nullable()
    .refine(val => val !== null, { message: 'Price is required' }),
  yearly_price: z
    .number({ invalid_type_error: 'Yearly price must be a valid number' })
    .min(0, { message: 'Values must be zero or a positive number' })
    .nullable()
    .optional(),
  trial_period_days: z
    .number({ invalid_type_error: 'Trial period must be a valid number' })
    .min(0, { message: 'Values must be zero or a positive number' })
    .nullable()
    .optional(),
  is_active: z.boolean().optional().default(true),
  requires_payment_info_for_free_plan: z.boolean().optional().default(false),
  service: z.number(),
  features: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}),
  limits: z.record(z.union([z.string(), z.number(), z.boolean()])).default({})
})

export type createServicePlanSchema = z.infer<typeof createServicePlanSchema>
