// Notification Types
export enum METHOD_CHOICES {
  EMAIL = 'email',
  SMS = 'sms',
  BOTH = 'both'
}

export enum TARGET_CHOICES {
  STAFF = 'staff',
  CLIENT = 'client',
  BOTH_TARGETS = 'both'
}

export interface NotificationType {
  id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  recipient_id: number
  is_read: boolean
  metadata?: Record<string, any>
  created_at: string
  read_at?: string
}

export interface CreateNotificationType {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message?: string
  recipient_id?: number
  metadata?: Record<string, any>
  name: string
  method: string
  to_who: string
}

// Notification Template Types
export interface NotificationTemplateType {
  id: number
  name: string
  description?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  title_template?: string
  message_template?: string
  variables?: string[]
  created_at?: string
  updated_at?: string
  created_by?: number | null
  updated_by?: number | null
  method?: string
  to_who?: string
  active?: boolean
  count?: number
}

export interface CreateNotificationTemplateType {
  name: string
  description?: string
  type: 'info' | 'success' | 'warning' | 'error'
  title_template: string
  message_template: string
  variables: string[]
}

export interface UpdateNotificationTemplateType extends Partial<CreateNotificationTemplateType> {
  id: number
}

// Notification Preference Types
export interface NotificationPreferenceType {
  id: number
  user_id: number
  category: string
  channel: 'web' | 'email' | 'mobile'
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export interface UpdateNotificationPreferenceType {
  id: number
  is_enabled: boolean
}

// Notification Sending Types
export interface SendNotificationType {
  template_id: number
  recipient_ids: number[]
  variables: Record<string, any>
}

// Notification Statistics Types
export interface NotificationStatisticsType {
  total_sent: number
  total_read: number
  read_rate: number
  by_type: Record<string, number>
  by_category: Record<string, number>
  by_channel: Record<string, number>
  over_time: Array<{
    date: string
    sent: number
    read: number
  }>
}

// Notification Method Types
export type NotificationMethodType = 'email' | 'sms' | 'push'

// Notification Target Types
export type NotificationTargetType = 'staff' | 'client' | 'admin'

// Notification Status Types
export interface NotificationStatusType {
  id: number
  notification: number
  status: 'sent' | 'failed' | 'pending'
  recipient: string
  sent_at?: string
  error_message?: string
}
