export interface OrdersTypes {
    id: number
    created_at: string
    updated_at: string
    order_number: string
    status: string
    amount: string | number | null
    is_subscription: boolean
    notes: string
    discount_amount: string
    provider: string
    currency_code: string
    created_by: number
    updated_by: number | null
    user: number
    service_plan: number
    coupon: number | null
    coupon_code: string | null
    billing_cycle: string | null
}
