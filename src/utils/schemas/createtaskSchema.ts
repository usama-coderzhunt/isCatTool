import { z } from 'zod'

export const createTaskSchema = z.object({
  project: z
    .preprocess(
      val => {
        if (val === '' || val === null || val === undefined) return null
        const num = Number(val)
        return isNaN(num) ? null : num
      },
      z.number().min(1, { message: 'Project is required' }).nullable()
    )
    .refine(val => val !== null, {
      message: 'Project is required'
    }),
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().nullable().default(null),
  due_date: z.string().nullable().default(null),
  similarity_threshold: z.string().default(''),
  is_subtask: z.preprocess(val => (val === null ? false : val), z.boolean().nullable().default(null)),
  is_split: z.preprocess(val => (val === null ? false : val), z.boolean().nullable().default(null)),
  custom_prompt: z.string().nullable().default(null),
  assigned_to: z.number().nullable().default(null),
  parent_task: z.number().nullable().default(null),
  source_language: z.number().nullable().default(null),
  target_language: z.number().nullable().default(null),
  translation_model: z.number().nullable().default(null),
  translation_subject: z.number().nullable().default(null)
})

export type TaskSchema = z.infer<typeof createTaskSchema>
