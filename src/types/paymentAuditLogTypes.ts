export interface PaymentAuditLogsTypes {
  id: number
  created_at: string
  updated_at: string
  action: string
  details: {
    provider: string
    checkout_session_id: string
    amount: string
    reference_id: string
    payment_method: string
    status: string
  }
  ip_address: string | null
  user_agent: string
  created_by: number | null
  updated_by: number | null
  transaction: number
}
