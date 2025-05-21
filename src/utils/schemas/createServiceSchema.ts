import { z } from 'zod'

export const createServiceSchema = z.object({
  communication_platform: z.string().nullable().default(null),
  translation_type: z.string().nullable().default(null),
  marketing_funnel: z.string().nullable().default(null),
  cost: z
    .number({ required_error: "Cost is required", invalid_type_error: "Cost must be a valid number" })
    .min(1, { message: "Values must be a positive number" })
    .nullable()
    .refine((val) => val !== null, { message: "Cost is required" }),
  source_language: z.string().nullable().default(null),
  target_language: z.string().nullable().default(null),
  priority: z.string().nullable().default(null),
  trans_client: z.number().default(0)
})

export type createServiceSchema = z.infer<typeof createServiceSchema>
