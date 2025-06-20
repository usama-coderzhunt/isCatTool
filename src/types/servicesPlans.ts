export interface ServicePlanTypes {
  id: number
  created_at?: string
  updated_at?: string
  name: string
  slug?: string
  service_type?: string | null
  price: string | number | null
  price_before_discount?: string | null
  yearly_price?: string | null
  trial_period_days?: number | null
  features: {}
  is_active?: boolean
  requires_payment_info_for_free_plan?: boolean
  limits?: {}
  paypal_plan_id?: {}
  stripe_price_id?: string | null
  created_by?: number
  updated_by?: number
  service?: string
}
