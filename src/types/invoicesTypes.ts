export interface InvoicesTypes {
  id: number
  created_at: string
  updated_at: string
  invoice_number: string
  status: string
  due_date: string
  subtotal: string
  tax_percent: string
  tax_amount: string
  total: string
  billing_address: {}
  notes: string
  created_by: number | null
  updated_by: number | null
  order: number
  transaction: number
}
