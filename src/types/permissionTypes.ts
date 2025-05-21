// Permission Types
export interface PermissionType {
  id: number
  name: string
  codename: string
  description?: string
  module: string
  created_at: string
  updated_at: string
}

export interface CreatePermissionType {
  name: string
  codename: string
  description?: string
  module: string
}

// Role Types
export interface RoleType {
  id: number
  name: string
  description?: string
  permissions: number[]
  created_at: string
  updated_at: string
  created_by?: number
}

export interface CreateRoleType {
  name: string
  description?: string
  permissions: number[]
}

export interface UpdateRoleType extends Partial<CreateRoleType> {
  id: number
}

// Permission Assignment Types
export interface PermissionAssignmentType {
  entity_type: 'user' | 'role' | 'group'
  entity_id: number
  permissions: number[]
}

// Permission Inheritance Types
export interface PermissionInheritanceType {
  source_type: 'role' | 'group'
  source_id: number
  target_type: 'role' | 'group'
  target_id: number
}
