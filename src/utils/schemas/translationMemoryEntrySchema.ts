import { z } from 'zod'

export const createTranslationMemoryEntrySchema = z.object({
  translation_memory: z
    .preprocess(
      val => {
        if (val === '' || val === null || val === undefined) return null
        const num = Number(val)
        return isNaN(num) ? null : num
      },
      z.number().min(1, { message: 'Translation memory is required' }).nullable()
    )
    .refine(val => val !== null, {
      message: 'Translation memory is required'
    }),
  source_text: z.string().min(1, { message: 'Source text is required' }),
  target_text: z.string().min(1, { message: 'Target text is required' }),
  reference: z.string().optional().nullable().default(null)
})

export type TranslationMemoryEntrySchema = z.infer<typeof createTranslationMemoryEntrySchema>
