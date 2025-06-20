// User Types
export interface UserType {
  id: number
  username: string
  email: string
  user_permissions: Permission[]
  groups: {
    id: number
    name: string
  }[]
}

export interface UserListResponse {
  count: number
  next: string | null
  previous: string | null
  total_pages: number
  current_page: number
  results: UserType[]
}

export interface CreateUserType {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
}

export interface UpdateUserType extends Partial<Omit<CreateUserType, 'password'>> {
  id: number
  password?: string
}

// Group Types
export interface GroupType {
  id: number
  name: string
  count: number
}

export interface CreateGroupType {
  name: string
}

// Permission Types
export interface PermissionType {
  id: number
  name: string
  codename: string
  content_type: {
    id: number
    app_label: string
    model: string
  }
}

// User-Group-Permission Assignment Types
export interface UserGroupAssignmentType {
  user_id: number
  group_ids: number[]
}

export interface UserPermissionAssignmentType {
  user_id: number
  permission_ids: number[]
}

export interface GroupPermissionAssignmentType {
  group_id: number
  permission_ids: number[]
}

export interface AssignablePermissionType {
  id: number
  name: string
  codename: string
  app_label: string
  model: string
}

export interface ContentTypeResponse {
  app_label: string
  model: string
  name: string
}

interface ContentType {
  id: number
  app_label: string
  model: string
}

interface Permission {
  id: number
  name: string
  codename: string
  content_type: ContentType
}
