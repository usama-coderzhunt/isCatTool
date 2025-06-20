import { z } from 'zod'

export const createCaseSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  summary: z.string().min(1, { message: 'Summary is required' }),
  cost_amount: z.preprocess(
    val => {
      if (typeof val === 'string' && val.trim() === '') return 0
      const parsed = Number(val)
      return isNaN(parsed) ? undefined : parsed
    },
    z
      .number({ required_error: 'Cost is required', invalid_type_error: 'Cost must be a valid number' })
      .min(0, { message: 'Cost must be greater than or equal to 0' })
  ),

  types: z
    .preprocess(val => {
      if (Array.isArray(val)) {
        return val.length > 0 ? val : undefined
      }
      if (typeof val === 'string') {
        const parsed = Number(val)
        return isNaN(parsed) ? undefined : [parsed]
      }
      if (typeof val === 'number') {
        return [val]
      }
      return undefined
    }, z.array(z.number()).optional())
    .refine(val => val && val.length > 0, {
      message: 'Type is required'
    }),

  clients: z
    .preprocess(val => {
      if (Array.isArray(val)) {
        return val.length > 0 ? val : undefined
      }
      if (typeof val === 'string') {
        const parsed = Number(val)
        return isNaN(parsed) ? undefined : [parsed]
      }
      if (typeof val === 'number') {
        return [val]
      }
      return undefined
    }, z.array(z.number()).optional())
    .refine(val => val && val.length > 0, {
      message: 'At least one client must be selected'
    }),
  staffs: z.preprocess(val => {
    if (Array.isArray(val)) {
      return val.length > 0 ? val : undefined
    }
    if (typeof val === 'string') {
      const parsed = Number(val)
      return isNaN(parsed) ? undefined : [parsed]
    }
    if (typeof val === 'number') {
      return [val]
    }
    return undefined
  }, z.array(z.number()).optional()),
  payment_schedule: z.string().optional()
})

export type CreateCaseSchema = z.infer<typeof createCaseSchema>
