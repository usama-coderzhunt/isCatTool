import { z } from 'zod'

export const createTermBaseEntrySchema = z.object({
  term_base: z
    .preprocess(
      val => {
        if (val === '' || val === null || val === undefined) return null
        const num = Number(val)
        return isNaN(num) ? null : num
      },
      z.number().min(1, { message: 'Term base is required' }).nullable()
    )
    .refine(val => val !== null, {
      message: 'Term base is required'
    }),
  original_term: z.string().min(1, { message: 'Original term is required' }),
  translation: z.string().min(1, { message: 'Translation is required' })
})

export type TermBaseEntrySchema = z.infer<typeof createTermBaseEntrySchema>
