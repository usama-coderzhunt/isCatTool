// Business Unit Types
export interface BusinessUnitType {
  id: string // UUID
  name: string
  description?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  limits?: {
    caseflow_max_cases?: number
    caseflow_max_active_users?: number
    caseflow_max_active_clients?: number
  }
  created_by?: number
  updated_by?: number
  max_active_users_limit?: number
  max_clients_limit?: number
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
