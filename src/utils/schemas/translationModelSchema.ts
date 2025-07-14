import { z } from 'zod'

export const createTranslationModelSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  model_name: z.string().min(1, { message: 'Model Name is required' }),
  description: z.string().optional().default(''),
  operator: z
    .preprocess(
      val => {
        if (val === '' || val === null || val === undefined) return null
        const num = Number(val)
        return isNaN(num) ? null : num
      },
      z.number().min(1, { message: 'Operator is required' }).nullable()
    )
    .refine(val => val !== null, {
      message: 'Operator is required'
    }),
  allowed_users: z.array(z.number()).optional().default([]),
  allowed_groups: z.array(z.number()).optional().default([])
})

export type TranslationModelSchema = z.infer<typeof createTranslationModelSchema>
