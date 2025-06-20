export interface CaseTypes {
  id: number
  created_at: string
  updated_at: string
  title: string
  summary: string
  cost_amount: string
  payment_schedule: string | null
  closed: boolean
  created_by: number
  updated_by: number | null
  types: number[] | null
  clients: number[] | null
  staffs: number[] | null
  name: string
}

export interface CaseTodoItemTypes {
  id: number
  created_at: string
  updated_at: string
  title: string
  description: string
  due_date: string
  completed: boolean
  case_id: number
  created_by: number
  updated_by: number | null
}
