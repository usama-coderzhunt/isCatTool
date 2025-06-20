export interface ClientData {
  count: number
  next: string | null
  previous: string | null
  total_pages: number
  current_page: number
  results: Client[]
}

export interface Client {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  email: string | null
  phone_number: string | null
  date_of_birth: string | null
  address: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  client_type: 'client' | 'lead'
  converted_to_client: string
  customer_country: string | null
  created_by: number
  updated_by: number | null
  actions?: () => void
}

export interface CreateClient {
  id?: number
  first_name: string
  last_name: string | null
  middle_name?: string | null
  email?: string | null
  phone_number?: string | null
  date_of_birth?: string | null
  address?: string | null
  customer_country?: string | null
  notes?: string | null
  client_type: 'client' | 'lead'
  is_active: boolean
}

export type TableData = {
  client: Client[]
}
