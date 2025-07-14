import { z } from 'zod'

export const createTranslationSubjectSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional().default('')
})

export type TranslationSubjectSchema = z.infer<typeof createTranslationSubjectSchema>
