import { z } from 'zod'

export const createTranslationMemorySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().nullable().default(null),
  source_language: z.union([z.number().min(1), z.undefined()]).refine(val => val !== undefined, {
    message: 'Source language is required'
  }),
  target_language: z.union([z.number().min(1), z.undefined()]).refine(val => val !== undefined, {
    message: 'Target language is required'
  })
})

export type TranslationMemorySchema = z.infer<typeof createTranslationMemorySchema>
