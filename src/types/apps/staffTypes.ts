interface StaffPosition {
  id: number
  name: string
  permissions: number[]
  // ... other existing properties
} 

export type { StaffPosition }

export interface Staff {
  id: number
  username?: string
  first_name?: string
  middle_name?: string
  last_name?: string
  email?: string
  phone_number?: string
  position?: number
  address?: string
  country?: string
  is_active?: boolean
}
