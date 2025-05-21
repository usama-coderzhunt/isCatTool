export interface SubscriptionsTypes {
    id: number
    created_at: string
    updated_at: string
    status: string
    start_date: string
    end_date: string | null
    trial_end: string | null
    next_billing_date: string
    cancelled_at: string | null
    cancel_at_period_end: boolean
    billing_cycle: string
    provider: string
    provider_subscription_id: string | null
    note: string
    created_by: number | null
    updated_by: number | null
    order: number
}
