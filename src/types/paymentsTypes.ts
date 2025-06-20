export interface PaymentPayload {
  order_id: number
  payment_method: string
}

export interface CapturePaymentPayload {
  provider: string
  order_id: string
  payer_id?: string
  secret: string
  provider_order_id?: string
  provider_subscription_id?: string
  stripe_session_id?: string
}

export interface RefundPaymentPayload {
  trx_reference_id: string
  reason: string
}

export interface InitiateSubscriptionPayload {
  order_id: number
  payment_method: string
  billing_cycle: string
  payment_details?: {
    provider: string
  }
}

export interface CaptureSubscriptionPayload {
  provider_subscription_id: string
  provider: string
  secret: string
}

export interface SubscriptionChangePlanPayload {
  subscription_id: number
  service_plan_id: number
  billing_cycle: string
  currency_code: string
  payment_method?: string
}

export interface RefundSubscriptionPayload {
  subscription_id: string
  reason: string
  amount: number
}
