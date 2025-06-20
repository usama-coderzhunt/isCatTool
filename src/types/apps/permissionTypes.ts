export type PermissionRowType = {
  id: number
  name: string
  createdDate: string
  assignedTo: string | string[]
}

export interface UserPermissions {
  user_permissions: Permission[]  
}

export interface Permission {
  id: number
  name: string
  codename: string
  content_type: ContentType
}

export interface ContentType {
  id: number
  app_label: string
  model: string
}

export interface AssignablePermission {
  [key: string]: Permission[]
}
