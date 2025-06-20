import { z } from 'zod'
import { METHOD_CHOICES, TARGET_CHOICES } from '@/types/notificationTypes'

export const notificationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    method: z.string().min(1, 'Method is required').refine(
        (val) => [METHOD_CHOICES.EMAIL, METHOD_CHOICES.SMS, METHOD_CHOICES.BOTH].includes(val as any),
        'Please select a valid method'
    ),
    to_who: z.string().min(1, 'Target is required').refine(
        (val) => [TARGET_CHOICES.STAFF, TARGET_CHOICES.CLIENT, TARGET_CHOICES.BOTH_TARGETS].includes(val as any),
        'Please select a valid target'
    )
})

export type NotificationFormData = z.infer<typeof notificationSchema>
