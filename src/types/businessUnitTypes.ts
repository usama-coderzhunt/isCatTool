// Business Unit Types
export interface BusinessUnitType {
  id: string // UUID
  name: string
  description?: string
  max_active_users_limit?: number
  max_clients_limit?: number
  notes?: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface CreateBusinessUnitType {
  name: string
  description?: string
  max_active_users_limit?: number
  max_clients_limit?: number
  notes?: string
}

export interface UpdateBusinessUnitType extends Partial<CreateBusinessUnitType> {
  id: string
}

export interface ExtendedGroupType {
  id: number
  group: number
  business_unit: string
}

export interface CreateExtendedGroupType {
  group: number
  business_unit: string
}
