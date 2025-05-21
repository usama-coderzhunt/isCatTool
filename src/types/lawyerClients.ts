export interface LawyerClientTypes {
    id: number
    first_name: string
    middle_name: string | null
    email: string | null
    date_of_birth: string | null
    address: string | null
    notes: string | null
    is_active: boolean
    created_at: string
    updated_at: string
    client_type: string
    converted_to_client: string | null
    last_name: string
    phone_number: string | null
    ssn: string | null
    a_number: string | null
    created_by: number
    updated_by: number | null
}

