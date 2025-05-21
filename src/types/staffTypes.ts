// Staff Position Types
export interface StaffPosition {
  id: number
  name: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface CreateStaffPositionInput {
  name: string
}

// Staff Types
export interface Staff {
  id: number
  first_name: string
  username?: string
  middle_name?: string
  last_name: string
  email: string
  phone_number: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
  position?: number
  user?: number
}

export interface CreateStaffInput {
  first_name: string
  middle_name?: string
  username?: string
  last_name: string
  address?: string
  email: string
  phone_number: string
  is_active?: boolean
  position?: number
  password: string
  password2: string
  user?: number
}

export interface CreateStaff {
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  phone_number: string
  position?: number
}

export interface UpdateStaffInput extends Partial<CreateStaffInput> {
  id: number
  middle_name?: string
}
