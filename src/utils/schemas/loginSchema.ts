import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email or Username is required'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters long')
})

export type loginSchema = z.infer<typeof loginSchema>
