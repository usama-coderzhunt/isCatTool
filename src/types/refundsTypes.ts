export interface RefundsTypes {
  id: number
  created_at: string
  updated_at: string
  amount: string
  status: string
  refund_reference_id: string
  reason: string
  notes: string
  payment_details: {
    stripe_refund_id: string
  }
  refunded_at: string
  is_full: boolean
  created_by: number
  updated_by: number | null
  transaction: number
  requested_by: number
  processed_by: number
}
