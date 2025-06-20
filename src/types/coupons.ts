export interface CouponsTypes {
    id: number
    created_at: string
    updated_at: string
    code: string
    description: string
    discount_type: string
    discount_value: number | null
    is_active: boolean
    valid_from: string
    valid_until: string
    usage_limit: number | null
    used_count: number
    stripe_coupon_id: string | null
    stripe_promotion_id: string | null
    created_by: number
    updated_by: number | null

}
