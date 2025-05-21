export interface TransactionsTypes {
    id: number
    created_at: string
    updated_at: string
    reference_id: string
    amount: string
    status: string
    payment_method: string
    payment_details: {
        secret?: string
        stripe_charge_id?: string
        stripe_customer_id?: string
        stripe_subscription_id?: string
        stripe_checkout_session_id?: string
        stripe_collected_confirmed?: boolean
        stripe_collected_confirmed_at?: string
        paypal_capture_id?: string
    },
    manual_payment_proof?: string | null
    notes?: string | null
    completed_at?: string | null
    validated_at?: string | null
    created_by: number | null
    updated_by: number | null
    order: number
    user: number
}
