export interface TodoItem {
  id: number
  created_at: string
  updated_at: string
  subject: string
  due_date: string | null
  completed: boolean | string | null
  description: string | null
  notification_sent: boolean | null
  send_to_google_calendar: 'NO' | 'SO' | 'SC'
  completed_at: string | null
  created_by: number
  updated_by: number | null
  todo: number
  notification: number | null
  completed_by: number | null
  todo_id: number
}
